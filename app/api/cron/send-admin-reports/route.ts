import { REPORT_TYPES, type ReportType } from "@/features/report/constants/report-type.constant";
import {
  isMonthEndReportDay,
  isWeekendReportDay,
  sendAdminSummaryReports,
} from "@/features/report/service";
import { BadRequestError } from "@/lib/errors";
import { assertValidCronSecret } from "@/lib/route-helpers/assert-cron-secret";
import { routeHandler } from "@/lib/route-helpers/route-handler";

function resolveReportTypes(request: Request, now: Date): ReportType[] {
  const requested = new URL(request.url).searchParams.get("type");

  if (requested) {
    if (!REPORT_TYPES.includes(requested as ReportType)) {
      throw new BadRequestError(`Unknown report type: ${requested}`);
    }

    return [requested as ReportType];
  }

  const types: ReportType[] = [];
  if (isWeekendReportDay(now)) types.push("weekend");
  if (isMonthEndReportDay(now)) types.push("month_end");

  return types;
}

// The Netlify scheduled function (netlify/functions/send-admin-reports.ts)
// is what actually runs this daily in production -- see it for why a single
// daily schedule (rather than separate weekly/monthly cron expressions)
// drives both report types. This route exists alongside it so the same
// logic can be triggered manually -- for local testing, or from any other
// scheduler -- with a curl request carrying the CRON_SECRET bearer token.
// `?type=weekend|month_end` forces a specific report outside its normal day.
export const GET = routeHandler(async (request) => {
  assertValidCronSecret(request);

  const now = new Date();
  const types = resolveReportTypes(request, now);

  const results = await Promise.all(
    types.map((type) => sendAdminSummaryReports(type, now)),
  );

  return { triggered: types, results };
});
