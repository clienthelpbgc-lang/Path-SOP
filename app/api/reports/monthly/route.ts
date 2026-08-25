import { getReportData } from "@/features/reports/service/get-report-data.service";
import { getMonthlyPeriod } from "@/features/reports/service/period.util";
import { buildReportFilename } from "@/features/reports/service/report-filename.util";
import { renderReportPdf } from "@/features/reports/pdf/render-report-pdf";
import { fileRouteHandler } from "@/lib/route-helpers/file-route-handler";
import { getCurrentUser } from "@/lib/session";

export const GET = fileRouteHandler(async (request) => {
  const currentUser = await getCurrentUser();
  const { searchParams } = new URL(request.url);

  const targetUserId = searchParams.get("userId") || currentUser.id;
  // Defaults to the last full calendar month -- the most useful "monthly
  // report" ask (the current month is still in progress). Pass offset=0 for
  // the current month to date instead.
  const offsetParam = searchParams.get("offset");
  const offset = offsetParam === null ? 1 : Math.max(0, Number(offsetParam) || 0);

  const period = getMonthlyPeriod(offset);
  const data = await getReportData(
    currentUser.companyId,
    currentUser.company.name,
    currentUser.id,
    currentUser.role,
    targetUserId,
    period,
  );

  const pdf = await renderReportPdf(data);
  const filename = buildReportFilename("monthly", data.user.name, period.start);

  return new Response(new Blob([Uint8Array.from(pdf)]), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
});
