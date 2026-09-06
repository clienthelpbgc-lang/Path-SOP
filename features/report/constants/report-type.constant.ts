export const REPORT_TYPES = ["weekend", "month_end"] as const;

export type ReportType = (typeof REPORT_TYPES)[number];

export const REPORT_TYPE_LABELS: Record<ReportType, string> = {
  weekend: "Weekend Summary",
  month_end: "Month-End Summary",
};
