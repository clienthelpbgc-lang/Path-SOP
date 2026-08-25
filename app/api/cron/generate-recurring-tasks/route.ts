import { assertValidCronSecret } from "@/lib/route-helpers/assert-cron-secret";
import { routeHandler } from "@/lib/route-helpers/route-handler";
import { generateRecurringTasks } from "@/features/task/service";

export const GET = routeHandler(async (request) => {
  assertValidCronSecret(request);

  return generateRecurringTasks();
});
