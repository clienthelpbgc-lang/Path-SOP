import { and, desc, eq, gte, lt } from "drizzle-orm";

import { db } from "@/db";
import { tasks } from "@/features/task/schema";
import { translateDatabaseError } from "@/lib/errors/db-error";

import type { DashboardPeriod } from "../period-presets.util";
import type { DashboardRecentTask } from "../../types";

const RECENT_ASSIGNED_LIMIT = 4;
const PARTY_COLUMNS = { id: true, name: true, email: true } as const;

// Last N tasks assigned to a user within the given period, most recently
// created first -- same shape/ordering as the recentTasks block in
// getDashboardOverview, just exposed as its own reusable, period-scoped
// function.
export async function getRecentAssignedTasks(
  companyId: string,
  userId: string,
  period: DashboardPeriod,
): Promise<DashboardRecentTask[]> {
  const createdAtFilter = period.start
    ? and(gte(tasks.createdAt, period.start), lt(tasks.createdAt, period.end))
    : lt(tasks.createdAt, period.end);

  try {
    const recentTasks = await db.query.tasks.findMany({
      where: and(
        eq(tasks.companyId, companyId),
        eq(tasks.assignedTo, userId),
        createdAtFilter,
      ),
      orderBy: desc(tasks.createdAt),
      limit: RECENT_ASSIGNED_LIMIT,
      columns: { id: true, title: true, status: true, dueAt: true },
      with: { creator: { columns: PARTY_COLUMNS } },
    });

    return recentTasks.map((task) => ({
      id: task.id,
      title: task.title,
      status: task.status,
      dueAt: task.dueAt,
      assignedBy: task.creator,
    }));
  } catch (error) {
    translateDatabaseError(error);
  }
}
