import { apiFetch } from "@/lib/api-client";
import type { ReportType } from "@/features/report/constants/report-type.constant";

export type SendReportNowResult = {
  companyId: string;
  recipientCount: number;
  sent: boolean;
};

export function sendReportNowRequest(type: ReportType) {
  return apiFetch<SendReportNowResult>("/api/report/send-now", {
    method: "POST",
    body: JSON.stringify({ type }),
  });
}
