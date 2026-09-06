import {
  startOfDaysAgo,
  startOfMonth,
  startOfNextDay,
  startOfNextMonth,
} from "@/features/dashboard/service/date-range.util";

import type { ReportType } from "../constants/report-type.constant";

export type ReportPeriod = {
  start: Date;
  end: Date;
  label: string;
};

function formatMonthLabel(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(date);
}

// "weekend" covers the 7 days up to and including today (meant to run on
// Saturday); "month_end" covers the current month to date (meant to run on
// the month's last day). See isWeekendReportDay / isMonthEndReportDay below
// for when each is actually due.
export function getReportPeriod(
  type: ReportType,
  now: Date = new Date(),
): ReportPeriod {
  const end = startOfNextDay(now);

  if (type === "weekend") {
    return { start: startOfDaysAgo(now, 6), end, label: "the past 7 days" };
  }

  return { start: startOfMonth(now), end, label: formatMonthLabel(now) };
}

// Saturdays close out the work week -- the weekend report summarizes the
// 7 days up to and including Saturday.
export function isWeekendReportDay(now: Date = new Date()): boolean {
  return now.getDay() === 6;
}

// True only on the last calendar day of the month (tomorrow rolls into the
// next month), so this is correct regardless of whether the month has 28-31
// days -- no need to special-case February etc.
export function isMonthEndReportDay(now: Date = new Date()): boolean {
  return startOfNextDay(now).getTime() === startOfNextMonth(now).getTime();
}
