import { cookies } from "next/headers";
import { z } from "zod";

import { changePasswordSchema } from "@/features/auth/validation";
import {
  RateLimitError,
  ValidationError,
  translateSupabaseAuthError,
} from "@/lib/errors";
import { checkRateLimit } from "@/lib/rate-limit/in-memory-rate-limiter";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";
import { createStatelessClient } from "@/utils/supabase/stateless";

// Per account: caps how fast someone with a stolen session could guess the
// current password through this endpoint.
const ATTEMPT_LIMIT = 5;
const ATTEMPT_WINDOW_MS = 15 * 60_000;

type PasswordOwner = { id: string; email: string };

export async function changePassword(
  user: PasswordOwner,
  input: unknown,
): Promise<{ changed: true }> {
  const result = changePasswordSchema.safeParse(input);

  if (!result.success) {
    throw new ValidationError(
      "Invalid password data.",
      z.flattenError(result.error).fieldErrors,
    );
  }

  const rateLimit = checkRateLimit(
    `change-password:${user.id}`,
    ATTEMPT_LIMIT,
    ATTEMPT_WINDOW_MS,
  );

  if (!rateLimit.allowed) {
    throw new RateLimitError(
      rateLimit.retryAfterSeconds,
      "Too many attempts. Please wait a few minutes and try again.",
    );
  }

  const { currentPassword, newPassword } = result.data;

  // Verified on a cookie-less client so the check doesn't replace the
  // browser's session; the throwaway session it creates is revoked below.
  const { error: verifyError } =
    await createStatelessClient().auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });

  if (verifyError) {
    throw new ValidationError("Your current password is incorrect.", {
      currentPassword: ["Your current password is incorrect."],
    });
  }

  const { error: updateError } =
    await createAdminClient().auth.admin.updateUserById(user.id, {
      password: newPassword,
    });

  if (updateError) {
    translateSupabaseAuthError(updateError);
  }

  // Keep this browser signed in, but end every other session (other
  // devices, plus the verification session above).
  const supabase = createClient(await cookies());
  const { error: signOutError } = await supabase.auth.signOut({
    scope: "others",
  });

  if (signOutError) {
    console.error("Failed to revoke other sessions after password change.", signOutError);
  }

  return { changed: true };
}
