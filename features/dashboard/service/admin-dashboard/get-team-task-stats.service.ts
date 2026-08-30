import { and, eq, gte, lt, sql } from "drizzle-orm";

import { db } from "@/db";
import { tasks } from "@/features/task/schema";
import { translateDatabaseError } from "@/lib/errors/db-error";

import type { DashboardPeriod } from "../period-presets.util";
import type { TeamTaskStats } from "../../types/admin-dashboard/team-task-stats.type";

function rate(total: number, completed: number): number {
  return total > 0 ? Math.round((completed / total) * 100) : 0;
}

// Company-wide task counts for a given period -- "pending" covers both
// pending and in_progress statuses (there's no third open state); "overdue"
// is the subset of those still open whose due date has already passed.
export async function getTeamTaskStats(
  companyId: string,
  period: DashboardPeriod,
): Promise<TeamTaskStats> {
  const now = new Date();
  const taskDateFilter = period.start
    ? and(gte(tasks.dueAt, period.start), lt(tasks.dueAt, period.end))
    : lt(tasks.dueAt, period.end);

  try {
    const [stats] = await db
      .select({
        totalAssigned: sql<number>`count(*)::int`,
        totalCompleted: sql<number>`count(*) filter (where ${tasks.status} = 'completed')::int`,
        totalPending: sql<number>`count(*) filter (where ${tasks.status} in ('pending', 'in_progress'))::int`,
        totalOverdue: sql<number>`count(*) filter (where ${tasks.status} in ('pending', 'in_progress') and ${tasks.dueAt} < ${now.toISOString()})::int`,
      })
      .from(tasks)
      .where(and(eq(tasks.companyId, companyId), taskDateFilter));

    return {
      periodLabel: period.label,
      totalAssigned: stats.totalAssigned,
      totalCompleted: stats.totalCompleted,
      totalPending: stats.totalPending,
      totalOverdue: stats.totalOverdue,
      teamTaskCompletionRate: rate(stats.totalAssigned, stats.totalCompleted),
    };
  } catch (error) {
    translateDatabaseError(error);
  }
}
