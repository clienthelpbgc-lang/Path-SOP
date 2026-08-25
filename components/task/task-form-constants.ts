import { REPEAT_UNITS } from "@/features/task/constants/repeat-unit.constant";

// Shared by the "New task" and "Edit task" forms.
export const WEEKDAYS = [
  { value: 0, label: "Sun" },
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
] as const;

export const REPEAT_UNIT_LABELS: Record<(typeof REPEAT_UNITS)[number], string> = {
  day: "Day(s)",
  week: "Week(s)",
  month: "Month(s)",
};

export const WEIGHTAGE_OPTIONS = Array.from({ length: 10 }, (_, index) => index + 1);
