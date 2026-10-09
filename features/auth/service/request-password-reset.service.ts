import { PASSWORD_RESET_LINK_TTL_LABEL, RESET_PASSWORD_PATH } from "@/features/auth/constants";
import { findPasswordResetRecipient } from "@/features/auth/service/find-password-reset-recipient";
import { getAppUrl } from "@/lib/app-url";
import { sendPasswordResetEmail } from "@/lib/notifications/send-password-reset-email";
import { createAdminClient } from "@/utils/supabase/admin";

// Generates a one-time recovery token and emails a link to the reset page.
// The link carries the token hash to a page with a form, rather than
// redeeming it on GET, so mail scanners that prefetch links (Outlook Safe
// Links etc.) can't burn the token before the user clicks it.
//
// Silent when there's no eligible account: the caller always reports the
// same generic outcome so the form can't be used to discover emails.
export async function requestPasswordReset(email: string): Promise<void> {
  const recipient = await findPasswordResetRecipient(email);

  if (!recipient) {
    return;
  }

  const supabaseAdmin = createAdminClient();
  const { data, error } = await supabaseAdmin.auth.admin.generateLink({
    type: "recovery",
    email,
  });

  if (error || !data.properties?.hashed_token) {
    throw error ?? new Error("Supabase returned no recovery token.");
  }

  const resetUrl = new URL(RESET_PASSWORD_PATH, getAppUrl());
  resetUrl.searchParams.set("token_hash", data.properties.hashed_token);

  await sendPasswordResetEmail({
    to: email,
    recipientName: recipient.name,
    resetUrl: resetUrl.toString(),
    expiresInLabel: PASSWORD_RESET_LINK_TTL_LABEL,
  });
}
