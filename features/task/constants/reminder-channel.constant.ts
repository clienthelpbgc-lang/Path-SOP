export const REMINDER_CHANNELS = ["whatsapp", "email"] as const;

export type ReminderChannel = (typeof REMINDER_CHANNELS)[number];
