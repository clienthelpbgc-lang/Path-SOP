export const REMINDER_ANCHORS = ["start", "due"] as const;

export type ReminderAnchor = (typeof REMINDER_ANCHORS)[number];
