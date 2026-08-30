import { and, eq, gte, lt, sql } from "drizzle-orm";

import { db } from "@/db";
import { tasks } from "@/features/task/schema";
import { translateDatabaseError } from "@/lib/errors/db-error";

import type { DashboardPeriod } from "../period-presets.util";
import type { TaskCompletionAnalytics } from "../../types/individual-dashboard/task-completion-analytics.type";

function rate(total: number, completed: number): number {
  return total > 0 ? Math.round((completed / total) * 100) : 0;
}

// "Completed in time" means the task was marked completed at or before its
// due date -- a task finished late still counts toward totalAssignedTask
// but not toward totalCompletedTaskInTime.
export async function getTaskCompletionAnalytics(
  companyId: string,
  userId: string,
  period: DashboardPeriod,
): Promise<TaskCompletionAnalytics> {
  const now = new Date();

  try {
    const taskDateFilter = period.start
      ? and(gte(tasks.dueAt, period.start), lt(tasks.dueAt, period.end))
      : lt(tasks.dueAt, period.end);

    const [stats] = await db
      .select({
        total: sql<number>`count(*)::int`,
        completedInTime: sql<number>`count(*) filter (where ${tasks.status} = 'completed' and ${tasks.completedAt} <= ${tasks.dueAt})::int`,
        overdue: sql<number>`count(*) filter (where ${tasks.status} in ('pending', 'in_progress') and ${tasks.dueAt} < ${now.toISOString()})::int`,
      })
      .from(tasks)
      .where(
        and(
          eq(tasks.companyId, companyId),
          eq(tasks.assignedTo, userId),
          taskDateFilter,
        ),
      );

    return {
      periodLabel: period.label,
      totalAssignedTask: stats.total,
      totalCompletedTaskInTime: stats.completedInTime,
      totalOverdueTask: stats.overdue,
      percentageOfCompletion: rate(stats.total, stats.completedInTime),
    };
  } catch (error) {
    translateDatabaseError(error);
  }
}
