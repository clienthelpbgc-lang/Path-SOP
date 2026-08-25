import { and, eq, gte, lt, sql } from "drizzle-orm";

import { db } from "@/db";
import { kras } from "@/features/kra/schema";
import { tasks } from "@/features/task/schema";
import type { UserRole } from "@/features/user/constants/role.constant";
import { users } from "@/features/user/schema";
import { ForbiddenError, NotFoundError } from "@/lib/errors";
import { translateDatabaseError } from "@/lib/errors/db-error";

import type { DashboardPeriod } from "./period-presets.util";
import type { PeriodPerformance } from "../types/period-performance.type";

function rate(total: number, completed: number): number {
  return total > 0 ? Math.round((completed / total) * 100) : 0;
}

// Same permission model as getAdminUserOverview: a regular user can only
// see their own numbers; an admin can pull anyone's, including another
// admin's -- there's no "team members only" restriction on the target.
export async function getPeriodPerformance(
  companyId: string,
  currentUserId: string,
  currentUserRole: UserRole,
  targetUserId: string,
  period: DashboardPeriod,
): Promise<PeriodPerformance> {
  if (currentUserRole !== "ADMIN" && targetUserId !== currentUserId) {
    throw new ForbiddenError("You can only view your own performance.");
  }

  try {
    const [targetUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.id, targetUserId), eq(users.companyId, companyId)))
      .limit(1);

    if (!targetUser) {
      throw new NotFoundError("User not found.");
    }

    const taskDateFilter = period.start
      ? and(gte(tasks.dueAt, period.start), lt(tasks.dueAt, period.end))
      : lt(tasks.dueAt, period.end);
    const kraDateFilter = period.start
      ? and(gte(kras.periodEnd, period.start), lt(kras.periodEnd, period.end))
      : lt(kras.periodEnd, period.end);

    const [[taskWeightage], [kraWeightage]] = await Promise.all([
      db
        .select({
          total: sql<number>`coalesce(sum(${tasks.weightage}), 0)::int`,
          completed: sql<number>`coalesce(sum(${tasks.weightage}) filter (where ${tasks.status} = 'completed'), 0)::int`,
        })
        .from(tasks)
        .where(
          and(
            eq(tasks.companyId, companyId),
            eq(tasks.assignedTo, targetUserId),
            taskDateFilter,
          ),
        ),
      db
        .select({
          total: sql<number>`coalesce(sum(${kras.weightage}), 0)::int`,
          completed: sql<number>`coalesce(sum(${kras.weightage}) filter (where ${kras.status} = 'completed'), 0)::int`,
        })
        .from(kras)
        .where(
          and(
            eq(kras.companyId, companyId),
            eq(kras.assignedTo, targetUserId),
            kraDateFilter,
          ),
        ),
    ]);

    const taskRate = rate(taskWeightage.total, taskWeightage.completed);
    const kraRate = rate(kraWeightage.total, kraWeightage.completed);

    return {
      periodLabel: period.label,
      taskStats: { ...taskWeightage, rate: taskRate },
      kraStats: { ...kraWeightage, rate: kraRate },
      performanceScore: {
        score: Math.round(taskRate * 0.5 + kraRate * 0.5),
        taskScore: taskRate,
        kraScore: kraRate,
      },
    };
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof ForbiddenError) {
      throw error;
    }

    translateDatabaseError(error);
  }
}
