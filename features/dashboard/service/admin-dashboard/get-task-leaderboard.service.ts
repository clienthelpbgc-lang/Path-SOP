import { buildLeaderboard } from "../leaderboard.util";
import type { DashboardPeriod } from "../period-presets.util";
import { getTaskWeightageByUser } from "../weightage-by-user.query";
import type { AdminLeaderboardEntry } from "../../types/admin-dashboard/admin-dashboard-overview.type";

// Task-only, weightage-based ranking for a given period ("today" .. "all
// time"), independent of the KRA side.
export async function getTaskLeaderboard(
  companyId: string,
  period: DashboardPeriod,
  limit?: number,
): Promise<AdminLeaderboardEntry[]> {
  const taskWeightageByUser = await getTaskWeightageByUser(companyId, period);
  return buildLeaderboard(taskWeightageByUser, limit);
}
