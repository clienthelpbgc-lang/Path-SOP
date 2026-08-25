import { getReportData } from "@/features/reports/service/get-report-data.service";
import { getWeeklyPeriod } from "@/features/reports/service/period.util";
import { buildReportFilename } from "@/features/reports/service/report-filename.util";
import { renderReportPdf } from "@/features/reports/pdf/render-report-pdf";
import { fileRouteHandler } from "@/lib/route-helpers/file-route-handler";
import { getCurrentUser } from "@/lib/session";

export const GET = fileRouteHandler(async (request) => {
  const currentUser = await getCurrentUser();
  const { searchParams } = new URL(request.url);

  const targetUserId = searchParams.get("userId") || currentUser.id;
  const offset = Math.max(0, Number(searchParams.get("offset")) || 0);

  const period = getWeeklyPeriod(offset);
  const data = await getReportData(
    currentUser.companyId,
    currentUser.company.name,
    currentUser.id,
    currentUser.role,
    targetUserId,
    period,
  );

  const pdf = await renderReportPdf(data);
  const filename = buildReportFilename("weekly", data.user.name, period.start);

  return new Response(new Blob([Uint8Array.from(pdf)]), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
});
