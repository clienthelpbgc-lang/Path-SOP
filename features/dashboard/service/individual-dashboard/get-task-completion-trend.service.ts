import { and, eq, gte, lt } from "drizzle-orm";

import { db } from "@/db";
import { tasks } from "@/features/task/schema";
import { translateDatabaseError } from "@/lib/errors/db-error";

import { dayKey, startOfDaysAgo, startOfNextDay } from "../date-range.util";

const TREND_DAYS = 7;

export async function getTaskCompletionTrend(
  companyId: string,
  userId: string,
): Promise<number[]> {
  const now = new Date();
  const weekStart = startOfDaysAgo(now, TREND_DAYS - 1);
  const tomorrowStart = startOfNextDay(now);
  const days = Array.from({ length: TREND_DAYS }, (_, i) => {
    const day = new Date(weekStart);
    day.setDate(day.getDate() + i);
    return day;
  });

  try {
    const completedTasks = await db
      .select({ completedAt: tasks.completedAt })
      .from(tasks)
      .where(
        and(
          eq(tasks.companyId, companyId),
          eq(tasks.assignedTo, userId),
          eq(tasks.status, "completed"),
          gte(tasks.completedAt, weekStart),
          lt(tasks.completedAt, tomorrowStart),
        ),
      );

    const counts = new Map(days.map((day) => [dayKey(day), 0]));
    for (const task of completedTasks) {
      if (!task.completedAt) continue;
      const key = dayKey(new Date(task.completedAt));
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    return days.map((day) => counts.get(dayKey(day)) ?? 0);
  } catch (error) {
    translateDatabaseError(error);
  }
}
