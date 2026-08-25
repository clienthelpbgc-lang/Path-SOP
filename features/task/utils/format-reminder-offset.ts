const MINUTES_PER_HOUR = 60;
const MINUTES_PER_DAY = 60 * 24;

// Picks the largest whole unit that divides the given number of minutes
// evenly, so "120" renders as "2 hours" rather than "120 minutes".
export function formatMinutesDuration(minutes: number): string {
  const magnitude = Math.abs(Math.round(minutes));

  if (magnitude === 0) {
    return "0 minutes";
  }

  if (magnitude % MINUTES_PER_DAY === 0) {
    const days = magnitude / MINUTES_PER_DAY;
    return `${days} ${days === 1 ? "day" : "days"}`;
  }

  if (magnitude % MINUTES_PER_HOUR === 0) {
    const hours = magnitude / MINUTES_PER_HOUR;
    return `${hours} ${hours === 1 ? "hour" : "hours"}`;
  }

  return `${magnitude} ${magnitude === 1 ? "minute" : "minutes"}`;
}

// Reminders store a single signed `offsetMinutes` (negative = before the
// anchor, positive = after) rather than separate direction/unit fields, so
// this describes the direction in words on top of the duration.
export function formatReminderOffset(offsetMinutes: number): string {
  if (offsetMinutes === 0) {
    return "at";
  }

  const direction = offsetMinutes < 0 ? "before" : "after";
  return `${formatMinutesDuration(offsetMinutes)} ${direction}`;
}
