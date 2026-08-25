import { and, count, desc, eq, gte, lt, lte, sql } from "drizzle-orm";

import { db } from "@/db";
import { kras } from "@/features/kra/schema";
import { tasks } from "@/features/task/schema";
import { users } from "@/features/user/schema";
import { translateDatabaseError } from "@/lib/errors/db-error";

import {
  dayKey,
  startOfDay,
  startOfDaysAgo,
  startOfMonth,
  startOfNextDay,
  startOfNextMonth,
} from "./date-range.util";
import { weightageRate, type WeightageTotals } from "./score.util";
import type {
  DashboardOverview,
  DashboardPerformanceScore,
  DashboardWeeklyCompletionPoint,
} from "../types";

// Everything the dashboard's sections need, fetched as one batch of parallel
// queries instead of one request per widget.
const RECENT_LIMIT = 3;
const LEADERBOARD_LIMIT = 5;
const WEEK_LENGTH = 7;
const PARTY_COLUMNS = { id: true, name: true, email: true } as const;

// Weightage-weighted completion, split 50/50 between tasks and KRAs -- a
// task or KRA worth more (higher weightage) counts for more of the score.
function computePerformanceScore(
  taskWeightage: WeightageTotals,
  kraWeightage: WeightageTotals,
): DashboardPerformanceScore {
  const taskScore = weightageRate(taskWeightage);
  const kraScore = weightageRate(kraWeightage);

  return {
    score: Math.round(taskScore * 0.5 + kraScore * 0.5),
    taskScore,
    kraScore,
  };
}

function buildWeeklyCompletion(
  weekDays: Date[],
  weekTasks: { status: string; dueAt: Date }[],
): DashboardWeeklyCompletionPoint[] {
  const buckets = new Map(
    weekDays.map((day) => [dayKey(day), { total: 0, completed: 0 }]),
  );

  for (const task of weekTasks) {
    const bucket = buckets.get(dayKey(new Date(task.dueAt)));
    if (!bucket) continue;
    bucket.total += 1;
    if (task.status === "completed") bucket.completed += 1;
  }

  return weekDays.map((day) => {
    const { total, completed } = buckets.get(dayKey(day))!;
    return {
      date: dayKey(day),
      label: new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(day),
      total,
      completed,
      rate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  });
}

export async function getDashboardOverview(
  companyId: string,
  userId: string,
): Promise<DashboardOverview> {
  const now = new Date();
  const todayStart = startOfDay(now);
  const tomorrowStart = startOfNextDay(now);
  const monthStart = startOfMonth(now);
  const nextMonthStart = startOfNextMonth(now);
  const weekStart = startOfDaysAgo(now, WEEK_LENGTH - 1);
  const weekDays = Array.from({ length: WEEK_LENGTH }, (_, i) => {
    const day = new Date(weekStart);
    day.setDate(day.getDate() + i);
    return day;
  });

  try {
    const [
      [tasksAssignedToday],
      [tasksCompletedThisMonth],
      [krasAssignedCurrent],
      recentTasks,
      recentKras,
      weekTasks,
      leaderboard,
      [taskWeightage],
      [kraWeightage],
    ] = await Promise.all([
      db
        .select({ total: count() })
        .from(tasks)
        .where(
          and(
            eq(tasks.companyId, companyId),
            eq(tasks.assignedTo, userId),
            gte(tasks.startAt, todayStart),
            lt(tasks.startAt, tomorrowStart),
          ),
        ),
      db
        .select({ total: count() })
        .from(tasks)
        .where(
          and(
            eq(tasks.companyId, companyId),
            eq(tasks.assignedTo, userId),
            eq(tasks.status, "completed"),
            gte(tasks.completedAt, monthStart),
            lt(tasks.completedAt, nextMonthStart),
          ),
        ),
      db
        .select({ total: count() })
        .from(kras)
        .where(
          and(
            eq(kras.companyId, companyId),
            eq(kras.assignedTo, userId),
            eq(kras.status, "assigned"),
            lte(kras.periodStart, now),
            gte(kras.periodEnd, now),
          ),
        ),
      db.query.tasks.findMany({
        where: and(
          eq(tasks.companyId, companyId),
          eq(tasks.assignedTo, userId),
        ),
        orderBy: desc(tasks.createdAt),
        limit: RECENT_LIMIT,
        columns: { id: true, title: true, status: true, dueAt: true },
        with: { creator: { columns: PARTY_COLUMNS } },
      }),
      db.query.kras.findMany({
        where: and(eq(kras.companyId, companyId), eq(kras.assignedTo, userId)),
        orderBy: desc(kras.createdAt),
        limit: RECENT_LIMIT,
        columns: {
          id: true,
          title: true,
          status: true,
          type: true,
          periodEnd: true,
        },
        with: { assigner: { columns: PARTY_COLUMNS } },
      }),
      db
        .select({ status: tasks.status, dueAt: tasks.dueAt })
        .from(tasks)
        .where(
          and(
            eq(tasks.companyId, companyId),
            eq(tasks.assignedTo, userId),
            gte(tasks.dueAt, weekStart),
            lt(tasks.dueAt, tomorrowStart),
          ),
        ),
      db
        .select({
          userId: users.id,
          name: users.name,
          completedCount: count(tasks.id),
        })
        .from(tasks)
        .innerJoin(users, eq(tasks.assignedTo, users.id))
        .where(
          and(
            eq(tasks.companyId, companyId),
            eq(tasks.status, "completed"),
            gte(tasks.completedAt, monthStart),
            lt(tasks.completedAt, nextMonthStart),
          ),
        )
        .groupBy(users.id, users.name)
        .orderBy(desc(count(tasks.id)))
        .limit(LEADERBOARD_LIMIT),
      db
        .select({
          total: sql<number>`coalesce(sum(${tasks.weightage}), 0)::int`,
          completed: sql<number>`coalesce(sum(${tasks.weightage}) filter (where ${tasks.status} = 'completed'), 0)::int`,
        })
        .from(tasks)
        .where(
          and(eq(tasks.companyId, companyId), eq(tasks.assignedTo, userId)),
        ),
      db
        .select({
          total: sql<number>`coalesce(sum(${kras.weightage}), 0)::int`,
          completed: sql<number>`coalesce(sum(${kras.weightage}) filter (where ${kras.status} = 'completed'), 0)::int`,
        })
        .from(kras)
        .where(and(eq(kras.companyId, companyId), eq(kras.assignedTo, userId))),
    ]);

    return {
      stats: {
        tasksAssignedToday: tasksAssignedToday.total,
        tasksCompletedThisMonth: tasksCompletedThisMonth.total,
        krasAssignedCurrent: krasAssignedCurrent.total,
      },
      performanceScore: computePerformanceScore(taskWeightage, kraWeightage),
      recentTasks: recentTasks.map((task) => ({
        id: task.id,
        title: task.title,
        status: task.status,
        dueAt: task.dueAt,
        assignedBy: task.creator,
      })),
      recentKras: recentKras.map((kra) => ({
        id: kra.id,
        title: kra.title,
        status: kra.status,
        type: kra.type,
        periodEnd: kra.periodEnd,
        assignedBy: kra.assigner,
      })),
      weeklyCompletion: buildWeeklyCompletion(weekDays, weekTasks),
      leaderboard,
    };
  } catch (error) {
    translateDatabaseError(error);
  }
}
