import type { Config } from "@netlify/functions";

import type { ReportType } from "../../features/report/constants/report-type.constant";
import {
  isMonthEndReportDay,
  isWeekendReportDay,
  sendAdminSummaryReports,
} from "../../features/report/service";

// Runs once a day on Netlify's scheduler (see `config.schedule` below) and
// decides for itself whether today is a report day -- cron expressions
// can't express "the last day of the month" directly (months don't have a
// fixed length), so instead of separate weekly/monthly schedules this checks
// the calendar on every run and fires whichever report(s) apply. A day can
// be both (e.g. a month ending on a Saturday), so both run independently.
// See features/report/service/report-period.util.ts for the actual
// day-matching logic, and app/api/cron/send-admin-reports/route.ts for a
// manually-triggerable copy of the same thing (useful for local testing,
// since Netlify doesn't run scheduled functions locally on a real clock).
async function handler() {
  const now = new Date();
  const types: ReportType[] = [];

  if (isWeekendReportDay(now)) types.push("weekend");
  if (isMonthEndReportDay(now)) types.push("month_end");

  if (types.length === 0) {
    console.log("send-admin-reports: not a scheduled report day, skipping.");

    return new Response(JSON.stringify({ triggered: [] }), {
      headers: { "content-type": "application/json" },
    });
  }

  const results = await Promise.all(
    types.map((type) => sendAdminSummaryReports(type, now)),
  );

  results.forEach((result) => {
    console.log(
      `send-admin-reports (${result.type}): ${result.companiesProcessed} companies, ${result.reportsSent} reports sent, ${result.totalRecipients} recipients, ${result.failedCompanyIds.length} failed.`,
    );
  });

  return new Response(JSON.stringify({ triggered: types, results }), {
    headers: { "content-type": "application/json" },
  });
}

export default handler;

export const config: Config = {
  // Once a day, 07:00 UTC. The handler itself decides whether today is a
  // weekend (Saturday) or month-end report day.
  schedule: "0 7 * * *",
};
