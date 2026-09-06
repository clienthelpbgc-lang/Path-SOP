function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "short",
  day: "numeric",
});

// The upcoming (or today's, if today qualifies) Saturday.
export function getNextWeekendReportDate(now: Date = new Date()): Date {
  const result = startOfDay(now);
  const daysUntilSaturday = (6 - result.getDay() + 7) % 7;
  result.setDate(result.getDate() + daysUntilSaturday);
  return result;
}

// The last day of the current month.
export function getNextMonthEndReportDate(now: Date = new Date()): Date {
  return new Date(now.getFullYear(), now.getMonth() + 1, 0);
}

export function formatReportDate(date: Date, now: Date = new Date()): string {
  const dayDiff = Math.round(
    (startOfDay(date).getTime() - startOfDay(now).getTime()) / 86_400_000,
  );

  if (dayDiff === 0) return "Today";
  if (dayDiff === 1) return "Tomorrow";

  return DATE_FORMATTER.format(date);
}
