import {
  DASHBOARD_PERIOD_KEYS,
  type DashboardPeriodKey,
} from "@/features/dashboard/types/dashboard-period.type";

import { startOfDay, startOfDaysAgo, startOfNextDay } from "./date-range.util";

export { DASHBOARD_PERIOD_KEYS, type DashboardPeriodKey };

export type DashboardPeriod = {
  start: Date | null;
  end: Date;
  label: string;
};

const PERIOD_LABELS: Record<DashboardPeriodKey, string> = {
  today: "Today",
  last_week: "Last 7 days",
  last_month: "Last month",
  last_3_months: "Last 3 months",
  last_6_months: "Last 6 months",
  last_year: "Last year",
  all_time: "All time",
};

function monthsAgo(date: Date, months: number): Date {
  return startOfDay(
    new Date(date.getFullYear(), date.getMonth() - months, date.getDate()),
  );
}

export function getDashboardPeriod(
  key: DashboardPeriodKey,
  now: Date = new Date(),
): DashboardPeriod {
  const end = startOfNextDay(now);
  const label = PERIOD_LABELS[key];

  switch (key) {
    case "today":
      return { start: startOfDay(now), end, label };
    case "last_week":
      return { start: startOfDaysAgo(now, 6), end, label };
    case "last_month":
      return { start: monthsAgo(now, 1), end, label };
    case "last_3_months":
      return { start: monthsAgo(now, 3), end, label };
    case "last_6_months":
      return { start: monthsAgo(now, 6), end, label };
    case "last_year":
      return { start: monthsAgo(now, 12), end, label };
    case "all_time":
      return { start: null, end, label };
  }
}
