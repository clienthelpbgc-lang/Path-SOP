import { createAdminClient } from "@/utils/supabase/admin";
import { createStatelessClient } from "@/utils/supabase/stateless";

export type ResetPasswordResult = { ok: true } | { ok: false; error: string };

const INVALID_LINK_ERROR =
  "This reset link is invalid or has expired. Please request a new one.";

// Redeems the recovery token on a cookie-less client (so it never signs the
// browser in), sets the new password via the admin API, then revokes every
// session for the account -- anyone holding an old session, e.g. whoever
// prompted the reset, is signed out everywhere.
export async function resetPassword(
  tokenHash: string,
  password: string,
): Promise<ResetPasswordResult> {
  const supabase = createStatelessClient();
  const { data, error } = await supabase.auth.verifyOtp({
    type: "recovery",
    token_hash: tokenHash,
  });

  if (error || !data.user || !data.session) {
    return { ok: false, error: INVALID_LINK_ERROR };
  }

  const supabaseAdmin = createAdminClient();
  const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
    data.user.id,
    { password },
  );

  if (updateError) {
    console.error("Failed to set password during reset.", updateError);

    // The token is single-use and already redeemed, so the only way forward
    // is a fresh link.
    return {
      ok: false,
      error:
        updateError.code === "weak_password"
          ? "That password is too weak. Please request a new link and choose a stronger one."
          : "We couldn't update your password. Please request a new reset link.",
    };
  }

  const { error: signOutError } = await supabaseAdmin.auth.admin.signOut(
    data.session.access_token,
    "global",
  );

  if (signOutError) {
    // The password is already changed; failing here would only confuse the
    // user, so log it and carry on.
    console.error("Failed to revoke sessions after password reset.", signOutError);
  }

  return { ok: true };
}
