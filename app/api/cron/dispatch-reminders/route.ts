import { assertValidCronSecret } from "@/lib/route-helpers/assert-cron-secret";
import { routeHandler } from "@/lib/route-helpers/route-handler";
import { dispatchDueReminders } from "@/features/task/service";

// The Netlify scheduled function (netlify/functions/dispatch-reminders.ts)
// is what actually runs this periodically in production. This route exists
// alongside it so the same logic can be triggered manually -- for local
// testing, or from any other scheduler -- with a curl request carrying the
// CRON_SECRET bearer token.
export const GET = routeHandler(async (request) => {
  assertValidCronSecret(request);

  return dispatchDueReminders();
});
