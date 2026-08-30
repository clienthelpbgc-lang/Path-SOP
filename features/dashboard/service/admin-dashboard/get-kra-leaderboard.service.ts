import { buildLeaderboard } from "../leaderboard.util";
import type { DashboardPeriod } from "../period-presets.util";
import { getKraWeightageByUser } from "../weightage-by-user.query";
import type { AdminLeaderboardEntry } from "../../types/admin-dashboard/admin-dashboard-overview.type";

// KRA-only, weightage-based ranking for a given period ("today" .. "all
// time"), independent of the task side.
export async function getKraLeaderboard(
  companyId: string,
  period: DashboardPeriod,
  limit?: number,
): Promise<AdminLeaderboardEntry[]> {
  const kraWeightageByUser = await getKraWeightageByUser(companyId, period);
  return buildLeaderboard(kraWeightageByUser, limit);
}
