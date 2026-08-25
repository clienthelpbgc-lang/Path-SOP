import type { taskReminders } from "@/features/task/schema";

export type TaskReminder = typeof taskReminders.$inferSelect;
export type NewTaskReminder = typeof taskReminders.$inferInsert;
