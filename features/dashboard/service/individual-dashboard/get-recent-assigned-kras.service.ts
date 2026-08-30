import { and, desc, eq, gte, lt } from "drizzle-orm";

import { db } from "@/db";
import { kras } from "@/features/kra/schema";
import { translateDatabaseError } from "@/lib/errors/db-error";

import type { DashboardPeriod } from "../period-presets.util";
import type { DashboardRecentKra } from "../../types";

const RECENT_ASSIGNED_LIMIT = 4;
const PARTY_COLUMNS = { id: true, name: true, email: true } as const;

// Last N kras assigned to a user within the given period, most recently
// created first -- same shape/ordering as the recentKras block in
// getDashboardOverview, just exposed as its own reusable, period-scoped
// function.
export async function getRecentAssignedKras(
  companyId: string,
  userId: string,
  period: DashboardPeriod,
): Promise<DashboardRecentKra[]> {
  const createdAtFilter = period.start
    ? and(gte(kras.createdAt, period.start), lt(kras.createdAt, period.end))
    : lt(kras.createdAt, period.end);

  try {
    const recentKras = await db.query.kras.findMany({
      where: and(
        eq(kras.companyId, companyId),
        eq(kras.assignedTo, userId),
        createdAtFilter,
      ),
      orderBy: desc(kras.createdAt),
      limit: RECENT_ASSIGNED_LIMIT,
      columns: {
        id: true,
        title: true,
        status: true,
        type: true,
        periodEnd: true,
      },
      with: { assigner: { columns: PARTY_COLUMNS } },
    });

    return recentKras.map((kra) => ({
      id: kra.id,
      title: kra.title,
      status: kra.status,
      type: kra.type,
      periodEnd: kra.periodEnd,
      assignedBy: kra.assigner,
    }));
  } catch (error) {
    translateDatabaseError(error);
  }
}
