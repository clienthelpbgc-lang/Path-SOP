import { eq } from "drizzle-orm";

import { systemDb } from "@/db";
import { companies } from "@/features/company/schema";

import type { ReportType } from "../constants/report-type.constant";
import { sendCompanyAdminReport } from "./send-company-admin-report.service";

export type SendAdminSummaryReportsResult = {
  type: ReportType;
  companiesProcessed: number;
  reportsSent: number;
  totalRecipients: number;
  failedCompanyIds: string[];
};

/**
 * The scheduler entry point: fans a single report type (weekend or
 * month-end) out across every active company, independent of any
 * request-scoped tenant session. Meant to be invoked periodically -- see
 * netlify/functions/send-admin-reports.ts and
 * app/api/cron/send-admin-reports/route.ts -- rather than from request
 * handlers directly. Each company is handled independently so one failure
 * doesn't block the rest of the run.
 */
export async function sendAdminSummaryReports(
  type: ReportType,
  now: Date = new Date(),
): Promise<SendAdminSummaryReportsResult> {
  const activeCompanies = await systemDb
    .select({ id: companies.id })
    .from(companies)
    .where(eq(companies.isActive, true));

  let reportsSent = 0;
  let totalRecipients = 0;
  const failedCompanyIds: string[] = [];

  for (const company of activeCompanies) {
    try {
      const result = await sendCompanyAdminReport(company.id, type, now);

      if (result.sent) {
        reportsSent += 1;
        totalRecipients += result.recipientCount;
      }
    } catch (error) {
      console.error(
        `Failed to send ${type} report for company ${company.id}.`,
        error,
      );
      failedCompanyIds.push(company.id);
    }
  }

  return {
    type,
    companiesProcessed: activeCompanies.length,
    reportsSent,
    totalRecipients,
    failedCompanyIds,
  };
}
