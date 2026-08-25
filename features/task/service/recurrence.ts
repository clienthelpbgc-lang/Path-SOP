import type { RepeatUnit } from "@/features/task/constants/repeat-unit.constant";

// Pure date math for recurring tasks. No DB access here so the scheduling
// rules can be unit-tested and reasoned about independently of the
// generation job in generate-recurring-tasks.service.ts.

/**
 * Computes the next occurrence's start date from a given start date, per the
 * task's repeat cadence. Time-of-day is preserved from `fromStart`.
 */
export function computeNextOccurrenceStart(
  fromStart: Date,
  unit: RepeatUnit,
  interval: number,
  daysOfWeek: number[] | null | undefined,
): Date {
  const next = new Date(fromStart);

  if (unit === "day") {
    next.setDate(next.getDate() + interval);
    return next;
  }

  if (unit === "week") {
    const days = [...(daysOfWeek ?? [])].sort((a, b) => a - b);

    if (days.length === 0) {
      next.setDate(next.getDate() + interval * 7);
      return next;
    }

    // Multiple weekdays within one cycle (e.g. "every week on Mon & Wed")
    // are walked in order before jumping to the next cycle: if a later
    // matching weekday remains in the current calendar week, use it;
    // otherwise jump `interval` weeks from this week's start (Sunday) and
    // land on the earliest matching weekday there.
    const fromDow = fromStart.getDay();
    const sameWeekMatch = days.find((day) => day > fromDow);

    if (sameWeekMatch !== undefined) {
      next.setDate(next.getDate() + (sameWeekMatch - fromDow));
      return next;
    }

    const daysToNextCycleWeekStart = interval * 7 - fromDow;
    next.setDate(next.getDate() + daysToNextCycleWeekStart + days[0]);
    return next;
  }

  // month -- clamps to the target month's last day instead of overflowing
  // (e.g. Jan 31 + 1 month lands on Feb 28/29, not Mar 3).
  const targetMonthIndex = fromStart.getMonth() + interval;
  const targetYear = fromStart.getFullYear() + Math.floor(targetMonthIndex / 12);
  const targetMonth = ((targetMonthIndex % 12) + 12) % 12;
  const daysInTargetMonth = new Date(targetYear, targetMonth + 1, 0).getDate();

  next.setFullYear(
    targetYear,
    targetMonth,
    Math.min(fromStart.getDate(), daysInTargetMonth),
  );
  return next;
}

type RecurrenceFields = {
  startAt: Date;
  repeatUnit: RepeatUnit;
  repeatInterval: number;
  repeatDaysOfWeek: number[] | null;
  repeatEndsAt: Date | null;
};

/**
 * Computes when a repeating task should next spawn its successor, or `null`
 * if the next occurrence would fall on/after `repeatEndsAt` (series over).
 * Used both to seed a task's own `nextRunAt` on create/update, and to seed
 * the newly-spawned successor's `nextRunAt` after generation.
 */
export function computeNextRunAt(task: RecurrenceFields): Date | null {
  const nextStart = computeNextOccurrenceStart(
    task.startAt,
    task.repeatUnit,
    task.repeatInterval,
    task.repeatDaysOfWeek,
  );

  if (task.repeatEndsAt && nextStart >= task.repeatEndsAt) {
    return null;
  }

  return nextStart;
}
