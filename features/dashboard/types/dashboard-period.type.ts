export const DASHBOARD_PERIOD_KEYS = [
  "today",
  "last_week",
  "last_month",
  "last_3_months",
  "last_6_months",
  "last_year",
  "all_time",
] as const;

export type DashboardPeriodKey = (typeof DASHBOARD_PERIOD_KEYS)[number];
