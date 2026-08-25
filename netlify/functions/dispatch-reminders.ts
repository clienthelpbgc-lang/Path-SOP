import type { Config } from "@netlify/functions";

import { dispatchDueReminders } from "../../features/task/service";

// Runs on Netlify's scheduler (see `config.schedule` below), independent of
// the Next.js app -- this is what actually sends due task_reminders over
// email/WhatsApp in production. See features/task/service/dispatch-reminders.service.ts
// for the logic itself, and app/api/cron/dispatch-reminders/route.ts for a
// manually-triggerable copy of the same thing (useful for local testing,
// since Netlify doesn't run scheduled functions locally on a real clock).
async function handler() {
  const result = await dispatchDueReminders();

  console.log(
    `dispatch-reminders: processed ${result.processedCount}, sent ${result.sentCount}, failed ${result.failedCount}.`,
  );

  return new Response(JSON.stringify(result), {
    headers: { "content-type": "application/json" },
  });
}

export default handler;

export const config: Config = {
  // Every 5 minutes. Netlify Scheduled Functions use UTC.
  schedule: "*/5 * * * *",
};
