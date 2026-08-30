import { and, eq, gte, lt, sql } from "drizzle-orm";

import { db } from "@/db";
import { kras } from "@/features/kra/schema";
import { tasks } from "@/features/task/schema";
import { users } from "@/features/user/schema";
import { translateDatabaseError } from "@/lib/errors/db-error";

import type { UserWeightageRow } from "./leaderboard.util";
import type { DashboardPeriod } from "./period-presets.util";

const taskTotalWeightageExpr = sql<number>`coalesce(sum(${tasks.weightage}), 0)::int`;
const taskCompletedWeightageExpr = sql<number>`coalesce(sum(${tasks.weightage}) filter (where ${tasks.status} = 'completed'), 0)::int`;
const kraTotalWeightageExpr = sql<number>`coalesce(sum(${kras.weightage}), 0)::int`;
const kraCompletedWeightageExpr = sql<number>`coalesce(sum(${kras.weightage}) filter (where ${kras.status} = 'completed'), 0)::int`;

// Per-user task weightage totals for a period -- shared by every
// task-side leaderboard (task-only, overall) so the query only lives once.
export async function getTaskWeightageByUser(
  companyId: string,
  period: DashboardPeriod,
): Promise<UserWeightageRow[]> {
  const taskDateFilter = period.start
    ? and(gte(tasks.dueAt, period.start), lt(tasks.dueAt, period.end))
    : lt(tasks.dueAt, period.end);

  try {
    return await db
      .select({
        userId: users.id,
        name: users.name,
        total: taskTotalWeightageExpr,
        completed: taskCompletedWeightageExpr,
      })
      .from(users)
      .leftJoin(
        tasks,
        and(
          eq(tasks.assignedTo, users.id),
          eq(tasks.companyId, companyId),
          taskDateFilter,
        ),
      )
      .where(and(eq(users.companyId, companyId), eq(users.isActive, true)))
      .groupBy(users.id, users.name);
  } catch (error) {
    translateDatabaseError(error);
  }
}

// Per-user KRA weightage totals for a period -- shared by every KRA-side
// leaderboard (kra-only, overall) so the query only lives once.
export async function getKraWeightageByUser(
  companyId: string,
  period: DashboardPeriod,
): Promise<UserWeightageRow[]> {
  const kraDateFilter = period.start
    ? and(gte(kras.periodEnd, period.start), lt(kras.periodEnd, period.end))
    : lt(kras.periodEnd, period.end);

  try {
    return await db
      .select({
        userId: users.id,
        name: users.name,
        total: kraTotalWeightageExpr,
        completed: kraCompletedWeightageExpr,
      })
      .from(users)
      .leftJoin(
        kras,
        and(
          eq(kras.assignedTo, users.id),
          eq(kras.companyId, companyId),
          kraDateFilter,
        ),
      )
      .where(and(eq(users.companyId, companyId), eq(users.isActive, true)))
      .groupBy(users.id, users.name);
  } catch (error) {
    translateDatabaseError(error);
  }
}
