import { AuthError } from "@/lib/errors";

// Not user-session auth -- creating a platform admin can't require an
// existing platform admin (bootstrapping problem), so this route is guarded
// by a shared secret instead, the same way app/api/cron/* routes are (see
// assert-cron-secret.ts). Meant to be called once, manually, from a trusted
// machine -- never exposed in the UI.
export function assertValidPlatformSetupSecret(request: Request): void {
  const secret = process.env.PLATFORM_ADMIN_SETUP_SECRET;

  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    throw new AuthError("Invalid or missing platform admin setup secret.");
  }
}
