import { and, eq } from "drizzle-orm";

import { systemDb } from "@/db";
import { companies } from "@/features/company/schema";
import { users } from "@/features/user/schema";
import { sendAdminReportEmail } from "@/lib/notifications/send-admin-report-email";

import { REPORT_TYPE_LABELS, type ReportType } from "../constants/report-type.constant";
import { getCompanyReportStats } from "./get-company-report-stats.service";
import { getReportPeriod } from "./report-period.util";

function buildDashboardUrl(): string | null {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;

  return baseUrl ? `${baseUrl.replace(/\/$/, "")}/admin-dashboard` : null;
}

function formatGeneratedAt(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export type SendCompanyAdminReportResult = {
  companyId: string;
  recipientCount: number;
  sent: boolean;
};

// The scheduler function every report path funnels through -- computes one
// company's stats for the requested period and emails every active admin in
// a single message. Used both by the cross-company cron sweep
// (send-admin-summary-reports.service.ts) and by the "send now" route
// (app/api/report/send-now/route.ts), which calls this directly for just
// the requesting admin's own company.
export async function sendCompanyAdminReport(
  companyId: string,
  type: ReportType,
  now: Date = new Date(),
): Promise<SendCompanyAdminReportResult> {
  const [[company], admins] = await Promise.all([
    systemDb.select().from(companies).where(eq(companies.id, companyId)).limit(1),
    systemDb
      .select({ id: users.id, email: users.email })
      .from(users)
      .where(
        and(
          eq(users.companyId, companyId),
          eq(users.role, "ADMIN"),
          eq(users.isActive, true),
        ),
      ),
  ]);

  if (!company || admins.length === 0) {
    return { companyId, recipientCount: 0, sent: false };
  }

  const period = getReportPeriod(type, now);
  const stats = await getCompanyReportStats(companyId, period);

  await sendAdminReportEmail({
    to: admins.map((admin) => admin.email),
    companyName: company.name,
    reportTitle: REPORT_TYPE_LABELS[type],
    periodLabel: `Summary for ${period.label}`,
    generatedAtLabel: formatGeneratedAt(now),
    stats,
    dashboardUrl: buildDashboardUrl(),
  });

  return { companyId, recipientCount: admins.length, sent: true };
}
