"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  REPORT_TYPE_LABELS,
  type ReportType,
} from "@/features/report/constants/report-type.constant";
import { sendReportNowRequest } from "@/features/report/hooks/report.api";
import { ApiClientError } from "@/lib/api-client";

export function useSendReportNow() {
  return useMutation({
    mutationFn: (type: ReportType) => sendReportNowRequest(type),
    onSuccess: (result, type) => {
      if (!result.sent) {
        toast.warning(
          `${REPORT_TYPE_LABELS[type]} wasn't sent — no active admins found to receive it.`,
        );
        return;
      }

      toast.success(
        `${REPORT_TYPE_LABELS[type]} sent to ${result.recipientCount} admin${result.recipientCount === 1 ? "" : "s"}.`,
      );
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiClientError
          ? error.message
          : "Failed to send report. Please try again.",
      );
    },
  });
}
