import type { Config } from "@netlify/functions";

import { generateRecurringTasks } from "../../features/task/service";

// Runs on Netlify's scheduler (see `config.schedule` below) -- this is what
// actually spawns the next occurrence of each repeating task in production.
// See features/task/service/generate-recurring-tasks.service.ts for the
// logic itself, and app/api/cron/generate-recurring-tasks/route.ts for a
// manually-triggerable copy of the same thing (useful for local testing,
// since Netlify doesn't run scheduled functions locally on a real clock).
async function handler() {
  const result = await generateRecurringTasks();

  console.log(
    `generate-recurring-tasks: generated ${result.generatedCount}, failed ${result.failedTaskIds.length}.`,
  );

  return new Response(JSON.stringify(result), {
    headers: { "content-type": "application/json" },
  });
}

export default handler;

export const config: Config = {
  // Every hour, on the hour. Netlify Scheduled Functions use UTC.
  schedule: "0 * * * *",
};
