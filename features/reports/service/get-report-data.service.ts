import { and, eq, gte, lt } from "drizzle-orm";

import { db } from "@/db";
import { kras } from "@/features/kra/schema";
import { tasks } from "@/features/task/schema";
import type { UserRole } from "@/features/user/constants/role.constant";
import { users } from "@/features/user/schema";
import { ForbiddenError, NotFoundError } from "@/lib/errors";
import { translateDatabaseError } from "@/lib/errors/db-error";

import type { ReportPeriod } from "./period.util";
import type { ReportData, ReportWeightageStats } from "../types/report-data.type";

function rate(total: number, completed: number): number {
  return total > 0 ? Math.round((completed / total) * 100) : 0;
}

export async function getReportData(
  companyId: string,
  companyName: string,
  currentUserId: string,
  currentUserRole: UserRole,
  targetUserId: string,
  period: ReportPeriod,
): Promise<ReportData> {
  // A regular user can only pull their own report; only an admin can pull
  // a report for someone else on the team.
  if (currentUserRole !== "ADMIN" && targetUserId !== currentUserId) {
    throw new ForbiddenError("You can only download your own report.");
  }

  try {
    const [targetUser] = await db
      .select({ id: users.id, name: users.name, email: users.email })
      .from(users)
      .where(and(eq(users.id, targetUserId), eq(users.companyId, companyId)))
      .limit(1);

    if (!targetUser) {
      throw new NotFoundError("User not found.");
    }

    const [taskRows, kraRows] = await Promise.all([
      db
        .select({
          id: tasks.id,
          title: tasks.title,
          status: tasks.status,
          dueAt: tasks.dueAt,
          weightage: tasks.weightage,
        })
        .from(tasks)
        .where(
          and(
            eq(tasks.companyId, companyId),
            eq(tasks.assignedTo, targetUserId),
            gte(tasks.dueAt, period.start),
            lt(tasks.dueAt, period.end),
          ),
        )
        .orderBy(tasks.dueAt),
      db
        .select({
          id: kras.id,
          title: kras.title,
          status: kras.status,
          type: kras.type,
          periodStart: kras.periodStart,
          periodEnd: kras.periodEnd,
          weightage: kras.weightage,
        })
        .from(kras)
        .where(
          and(
            eq(kras.companyId, companyId),
            eq(kras.assignedTo, targetUserId),
            gte(kras.periodEnd, period.start),
            lt(kras.periodEnd, period.end),
          ),
        )
        .orderBy(kras.periodEnd),
    ]);

    const taskStats = buildStats(
      taskRows.map((row) => ({
        weightage: row.weightage,
        isComplete: row.status === "completed",
      })),
    );
    const kraStats = buildStats(
      kraRows.map((row) => ({
        weightage: row.weightage,
        isComplete: row.status === "completed",
      })),
    );

    const taskScore = rate(taskStats.total, taskStats.completed);
    const kraScore = rate(kraStats.total, kraStats.completed);

    return {
      companyName,
      user: targetUser,
      periodLabel: period.label,
      periodStart: period.start,
      periodEnd: period.end,
      generatedAt: new Date(),
      performanceScore: {
        score: Math.round(taskScore * 0.5 + kraScore * 0.5),
        taskScore,
        kraScore,
      },
      taskStats: { ...taskStats, rate: taskScore },
      kraStats: { ...kraStats, rate: kraScore },
      tasks: taskRows,
      kras: kraRows,
    };
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof ForbiddenError) {
      throw error;
    }

    translateDatabaseError(error);
  }
}

function buildStats(
  rows: { weightage: number; isComplete: boolean }[],
): Omit<ReportWeightageStats, "rate"> {
  return rows.reduce(
    (acc, row) => ({
      total: acc.total + row.weightage,
      completed: acc.completed + (row.isComplete ? row.weightage : 0),
    }),
    { total: 0, completed: 0 },
  );
}
