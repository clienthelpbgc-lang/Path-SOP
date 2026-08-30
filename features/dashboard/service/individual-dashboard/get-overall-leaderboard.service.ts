import { buildOverallLeaderboard } from "../leaderboard.util";
import type { DashboardPeriod } from "../period-presets.util";
import {
  getKraWeightageByUser,
  getTaskWeightageByUser,
} from "../weightage-by-user.query";
import type { AdminOverallLeaderboardEntry } from "../../types";

// Company-wide, weightage-based ranking for a given period -- same 50/50
// task+KRA split as buildOverallLeaderboard, but scoped to a time window
// instead of all-time (unlike getAdminDashboardOverview's version).
export async function getOverallLeaderboard(
  companyId: string,
  period: DashboardPeriod,
  limit?: number,
): Promise<AdminOverallLeaderboardEntry[]> {
  const [taskWeightageByUser, kraWeightageByUser] = await Promise.all([
    getTaskWeightageByUser(companyId, period),
    getKraWeightageByUser(companyId, period),
  ]);

  return buildOverallLeaderboard(taskWeightageByUser, kraWeightageByUser, limit);
}
