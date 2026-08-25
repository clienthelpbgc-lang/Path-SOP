import {
  startOfDaysAgo,
  startOfMonth,
  startOfNextDay,
  startOfNextMonth,
} from "@/features/dashboard/service/date-range.util";

export type ReportPeriod = {
  start: Date;
  end: Date;
  label: string;
};

const WEEK_LENGTH = 7;

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatMonth(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(date);
}

// offset=0 is the trailing 7 days ending today (matches the dashboard's own
// "Weekly Task Completion Rate" chart); offset=1 is the 7 days before that,
// and so on.
export function getWeeklyPeriod(offset: number, now: Date = new Date()): ReportPeriod {
  const end = startOfNextDay(startOfDaysAgo(now, WEEK_LENGTH * offset));
  const start = startOfDaysAgo(end, WEEK_LENGTH);

  const lastDayInRange = new Date(end);
  lastDayInRange.setDate(lastDayInRange.getDate() - 1);

  return {
    start,
    end,
    label: `${formatDate(start)} – ${formatDate(lastDayInRange)}`,
  };
}

// offset=0 is the current calendar month (tasks/KRAs due later this month
// will show as not-yet-completed if the report is generated mid-month);
// offset=1 is the last full calendar month, and so on.
export function getMonthlyPeriod(offset: number, now: Date = new Date()): ReportPeriod {
  const thisMonthStart = startOfMonth(now);

  let start = thisMonthStart;
  for (let i = 0; i < offset; i += 1) {
    start = startOfMonth(new Date(start.getFullYear(), start.getMonth() - 1, 1));
  }

  const end = startOfNextMonth(start);

  return {
    start,
    end,
    label: formatMonth(start),
  };
}
