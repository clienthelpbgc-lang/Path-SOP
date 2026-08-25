export const REMINDER_STATUSES = [
  "scheduled",
  "sent",
  "failed",
  "cancelled",
] as const;

export type ReminderStatus = (typeof REMINDER_STATUSES)[number];
