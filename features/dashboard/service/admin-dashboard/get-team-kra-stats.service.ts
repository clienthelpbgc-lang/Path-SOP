import { and, eq, gte, lt, sql } from "drizzle-orm";

import { db } from "@/db";
import { kras } from "@/features/kra/schema";
import { translateDatabaseError } from "@/lib/errors/db-error";

import type { DashboardPeriod } from "../period-presets.util";
import type { TeamKraStats } from "../../types/admin-dashboard/team-kra-stats.type";

function rate(total: number, completed: number): number {
  return total > 0 ? Math.round((completed / total) * 100) : 0;
}

export async function getTeamKraStats(
  companyId: string,
  period: DashboardPeriod,
): Promise<TeamKraStats> {
  const kraDateFilter = period.start
    ? and(gte(kras.periodEnd, period.start), lt(kras.periodEnd, period.end))
    : lt(kras.periodEnd, period.end);

  try {
    const [stats] = await db
      .select({
        totalKraAssigned: sql<number>`count(*)::int`,
        totalKraCompleted: sql<number>`count(*) filter (where ${kras.status} = 'completed')::int`,
        totalKraNotCompleted: sql<number>`count(*) filter (where ${kras.status} = 'not_completed')::int`,
      })
      .from(kras)
      .where(and(eq(kras.companyId, companyId), kraDateFilter));

    return {
      periodLabel: period.label,
      totalKraAssigned: stats.totalKraAssigned,
      totalKraCompleted: stats.totalKraCompleted,
      totalKraNotCompleted: stats.totalKraNotCompleted,
      teamKraCompletionRate: rate(stats.totalKraAssigned, stats.totalKraCompleted),
    };
  } catch (error) {
    translateDatabaseError(error);
  }
}
