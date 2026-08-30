import { and, desc, eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { tasks } from "@/features/task/schema";
import { users } from "@/features/user/schema";
import { translateDatabaseError } from "@/lib/errors/db-error";

import type { AdminMemberWorkload } from "../../types/admin-dashboard/admin-dashboard-overview.type";

// Per-member open/overdue task counts, most loaded first -- a live snapshot
// (not period-scoped) of who's currently carrying the most work, same query
// previously inlined in getAdminDashboardOverview.
export async function getTeamWorkload(
  companyId: string,
): Promise<AdminMemberWorkload[]> {
  const now = new Date();
  const openCountExpr = sql<number>`count(${tasks.id}) filter (where ${tasks.status} in ('pending', 'in_progress'))::int`;
  const overdueCountExpr = sql<number>`count(${tasks.id}) filter (where ${tasks.status} in ('pending', 'in_progress') and ${tasks.dueAt} < ${now.toISOString()})::int`;

  try {
    return await db
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
      .orderBy(desc(overdueCountExpr), desc(openCountExpr));
  } catch (error) {
    translateDatabaseError(error);
  }
}
