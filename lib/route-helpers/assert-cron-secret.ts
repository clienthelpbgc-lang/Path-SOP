import { AuthError } from "@/lib/errors";

// Not user-session auth (no browser calls this) -- a shared secret shared
// with whatever triggers the route on a schedule. Vercel Cron Jobs
// automatically send `Authorization: Bearer $CRON_SECRET` when that env var
// is set; any other scheduler (Netlify Scheduled Functions, GitHub Actions,
// cron-job.org, ...) needs to send the same header manually.
export function assertValidCronSecret(request: Request): void {
  const secret = process.env.CRON_SECRET;

  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    throw new AuthError("Invalid or missing cron secret.");
  }
}
