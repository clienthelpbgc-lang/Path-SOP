import type { dailyTasks } from "@/features/daily-task/schema";

export type DailyTask = typeof dailyTasks.$inferSelect;
export type NewDailyTask = typeof dailyTasks.$inferInsert;
