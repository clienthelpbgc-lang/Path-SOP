import { and, count, desc, eq, gte, inArray, lt, sql } from "drizzle-orm";

import { db } from "@/db";
import { kras } from "@/features/kra/schema";
import { tasks } from "@/features/task/schema";
import type { UserRole } from "@/features/user/constants/role.constant";
import { users } from "@/features/user/schema";
import { ForbiddenError } from "@/lib/errors";
import { translateDatabaseError } from "@/lib/errors/db-error";

import { startOfDay, startOfNextDay } from "./date-range.util";
import { weightageRate } from "./score.util";
import type {
  AdminDashboardOverview,
  AdminLeaderboardEntry,
  AdminOverallLeaderboardEntry,
} from "../types";

// Same shape as the personal dashboard's stats query, but company-wide
// instead of scoped to one user.
const OPEN_STATUSES = ["pending", "in_progress"] as const;
const LEADERBOARD_LIMIT = 5;

type UserWeightageRow = {
  userId: string;
  name: string;
  total: number;
  completed: number;
};

function buildLeaderboard(rows: UserWeightageRow[]): AdminLeaderboardEntry[] {
  return rows
    .filter((row) => row.total > 0)
    .map((row) => ({
      userId: row.userId,
      name: row.name,
      completed: row.completed,
      total: row.total,
      score: weightageRate(row),
    }))
    .sort((a, b) => b.score - a.score || b.completed - a.completed)
    .slice(0, LEADERBOARD_LIMIT);
}

// Same 50/50 task+KRA split as the personal dashboard's performance score,
// applied per team member instead of just the current user.
function buildOverallLeaderboard(
  taskRows: UserWeightageRow[],
  kraRows: UserWeightageRow[],
): AdminOverallLeaderboardEntry[] {
  const byUser = new Map<
    string,
    { name: string; task: UserWeightageRow; kra: UserWeightageRow }
  >();

  for (const row of taskRows) {
    byUser.set(row.userId, {
      name: row.name,
      task: row,
      kra: { userId: row.userId, name: row.name, total: 0, completed: 0 },
    });
  }
  for (const row of kraRows) {
    const existing = byUser.get(row.userId);
    if (existing) {
      existing.kra = row;
    } else {
      byUser.set(row.userId, {
        name: row.name,
        task: { userId: row.userId, name: row.name, total: 0, completed: 0 },
        kra: row,
      });
    }
  }

  return Array.from(byUser.entries())
    .filter(([, entry]) => entry.task.total > 0 || entry.kra.total > 0)
    .map(([userId, entry]) => {
      const taskScore = weightageRate(entry.task);
      const kraScore = weightageRate(entry.kra);
      return {
        userId,
        name: entry.name,
        taskScore,
        kraScore,
        score: Math.round(taskScore * 0.5 + kraScore * 0.5),
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, LEADERBOARD_LIMIT);
}

export async function getAdminDashboardOverview(
  companyId: string,
  currentUserRole: UserRole,
): Promise<AdminDashboardOverview> {
  if (currentUserRole !== "ADMIN") {
    throw new ForbiddenError("Only admins can view this dashboard.");
  }

  const now = new Date();
  const todayStart = startOfDay(now);
  const tomorrowStart = startOfNextDay(now);

  const openCountExpr = sql<number>`count(${tasks.id}) filter (where ${tasks.status} in ('pending', 'in_progress'))::int`;
  const overdueCountExpr = sql<number>`count(${tasks.id}) filter (where ${tasks.status} in ('pending', 'in_progress') and ${tasks.dueAt} < ${now.toISOString()})::int`;
  const taskTotalWeightageExpr = sql<number>`coalesce(sum(${tasks.weightage}), 0)::int`;
  const taskCompletedWeightageExpr = sql<number>`coalesce(sum(${tasks.weightage}) filter (where ${tasks.status} = 'completed'), 0)::int`;
  const kraTotalWeightageExpr = sql<number>`coalesce(sum(${kras.weightage}), 0)::int`;
  const kraCompletedWeightageExpr = sql<number>`coalesce(sum(${kras.weightage}) filter (where ${kras.status} = 'completed'), 0)::int`;

  try {
    const [
      [dueToday],
      [overdue],
      statusRows,
      memberWorkload,
      taskWeightageByUser,
      kraWeightageByUser,
    ] = await Promise.all([
      db
        .select({ total: count() })
        .from(tasks)
        .where(
          and(
            eq(tasks.companyId, companyId),
            inArray(tasks.status, OPEN_STATUSES),
            gte(tasks.dueAt, todayStart),
            lt(tasks.dueAt, tomorrowStart),
          ),
        ),
      db
        .select({ total: count() })
        .from(tasks)
        .where(
          and(
            eq(tasks.companyId, companyId),
            inArray(tasks.status, OPEN_STATUSES),
            lt(tasks.dueAt, now),
          ),
        ),
      db
        .select({ status: tasks.status, total: count() })
        .from(tasks)
        .where(eq(tasks.companyId, companyId))
        .groupBy(tasks.status),
      db
        .select({
          userId: users.id,
          name: users.name,
          openCount: openCountExpr,
          overdueCount: overdueCountExpr,
        })
        .from(users)
        .leftJoin(
          tasks,
          and(eq(tasks.assignedTo, users.id), eq(tasks.companyId, companyId)),
        )
        .where(and(eq(users.companyId, companyId), eq(users.isActive, true)))
        .groupBy(users.id, users.name)
        .orderBy(desc(overdueCountExpr), desc(openCountExpr)),
      db
        .select({
          userId: users.id,
          name: users.name,
          total: taskTotalWeightageExpr,
          completed: taskCompletedWeightageExpr,
        })
        .from(users)
        .leftJoin(
          tasks,
          and(eq(tasks.assignedTo, users.id), eq(tasks.companyId, companyId)),
        )
        .where(and(eq(users.companyId, companyId), eq(users.isActive, true)))
        .groupBy(users.id, users.name),
      db
        .select({
          userId: users.id,
          name: users.name,
          total: kraTotalWeightageExpr,
          completed: kraCompletedWeightageExpr,
        })
        .from(users)
        .leftJoin(
          kras,
          and(eq(kras.assignedTo, users.id), eq(kras.companyId, companyId)),
        )
        .where(and(eq(users.companyId, companyId), eq(users.isActive, true)))
        .groupBy(users.id, users.name),
    ]);

    const statusBreakdown = { pending: 0, in_progress: 0, completed: 0 };
    for (const row of statusRows) {
      statusBreakdown[row.status] = row.total;
    }

    return {
      taskHealth: {
        dueToday: dueToday.total,
        overdue: overdue.total,
        statusBreakdown,
      },
      memberWorkload,
      taskLeaderboard: buildLeaderboard(taskWeightageByUser),
      kraLeaderboard: buildLeaderboard(kraWeightageByUser),
      overallLeaderboard: buildOverallLeaderboard(
        taskWeightageByUser,
        kraWeightageByUser,
      ),
    };
  } catch (error) {
    translateDatabaseError(error);
  }
}
