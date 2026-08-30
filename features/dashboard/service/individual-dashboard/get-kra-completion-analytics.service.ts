import { and, eq, gte, lt, sql } from "drizzle-orm";

import { db } from "@/db";
import { kras } from "@/features/kra/schema";
import { translateDatabaseError } from "@/lib/errors/db-error";

import type { DashboardPeriod } from "../period-presets.util";
import type { KraCompletionAnalytics } from "../../types/individual-dashboard/kra-completion-analytics.type";

function rate(total: number, completed: number): number {
  return total > 0 ? Math.round((completed / total) * 100) : 0;
}
export async function getKraCompletionAnalytics(
  companyId: string,
  userId: string,
  period: DashboardPeriod,
): Promise<KraCompletionAnalytics> {
  try {
    const kraDateFilter = period.start
      ? and(gte(kras.periodEnd, period.start), lt(kras.periodEnd, period.end))
      : lt(kras.periodEnd, period.end);

    const [stats] = await db
      .select({
        total: sql<number>`count(*)::int`,
        completedInTime: sql<number>`count(*) filter (where ${kras.status} = 'completed' and ${kras.updatedAt} <= ${kras.periodEnd})::int`,
        notCompleted: sql<number>`count(*) filter (where ${kras.status} = 'not_completed')::int`,
      })
      .from(kras)
      .where(
        and(
          eq(kras.companyId, companyId),
          eq(kras.assignedTo, userId),
          kraDateFilter,
        ),
      );

    return {
      periodLabel: period.label,
      totalAssignedKra: stats.total,
      totalCompletedKraInTime: stats.completedInTime,
      totalKraNotCompleted: stats.notCompleted,
      percentageOfCompletion: rate(stats.total, stats.completedInTime),
    };
  } catch (error) {
    translateDatabaseError(error);
  }
}
