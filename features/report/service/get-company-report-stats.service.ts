import { and, desc, eq, gte, lt, sql } from "drizzle-orm";

import { systemDb } from "@/db";
import { tasks } from "@/features/task/schema";
import { users } from "@/features/user/schema";
import { translateDatabaseError } from "@/lib/errors/db-error";

import type { ReportPeriod } from "./report-period.util";

export type ReportTopPerformer = {
  userId: string;
  name: string;
  completedCount: number;
};

export type CompanyReportStats = {
  totalAssigned: number;
  totalCompleted: number;
  totalPending: number;
  totalOverdue: number;
  completionRate: number;
  topPerformers: ReportTopPerformer[];
};

const TOP_PERFORMER_LIMIT = 3;

function rate(total: number, completed: number): number {
  return total > 0 ? Math.round((completed / total) * 100) : 0;
}

// Mirrors getTeamTaskStats' shape (features/dashboard/service/admin-dashboard)
// but queries via systemDb rather than the RLS-scoped `db`, since this is
// meant to be called from a scheduled job with no request-bound tenant
// session to scope to -- see send-company-admin-report.service.ts.
export async function getCompanyReportStats(
  companyId: string,
  period: ReportPeriod,
): Promise<CompanyReportStats> {
  const now = new Date();
  const dateFilter = and(
    gte(tasks.dueAt, period.start),
    lt(tasks.dueAt, period.end),
  );

  try {
    const [[totals], topPerformers] = await Promise.all([
      systemDb
        .select({
          totalAssigned: sql<number>`count(*)::int`,
          totalCompleted: sql<number>`count(*) filter (where ${tasks.status} = 'completed')::int`,
          totalPending: sql<number>`count(*) filter (where ${tasks.status} in ('pending', 'in_progress'))::int`,
          totalOverdue: sql<number>`count(*) filter (where ${tasks.status} in ('pending', 'in_progress') and ${tasks.dueAt} < ${now.toISOString()})::int`,
        })
        .from(tasks)
        .where(and(eq(tasks.companyId, companyId), dateFilter)),
      systemDb
        .select({
          userId: users.id,
          name: users.name,
          completedCount: sql<number>`count(*)::int`,
        })
        .from(tasks)
        .innerJoin(users, eq(tasks.assignedTo, users.id))
        .where(
          and(
            eq(tasks.companyId, companyId),
            eq(tasks.status, "completed"),
            dateFilter,
          ),
        )
        .groupBy(users.id, users.name)
        .orderBy(desc(sql`count(*)`))
        .limit(TOP_PERFORMER_LIMIT),
    ]);

    return {
      totalAssigned: totals.totalAssigned,
      totalCompleted: totals.totalCompleted,
      totalPending: totals.totalPending,
      totalOverdue: totals.totalOverdue,
      completionRate: rate(totals.totalAssigned, totals.totalCompleted),
      topPerformers,
    };
  } catch (error) {
    translateDatabaseError(error);
  }
}
