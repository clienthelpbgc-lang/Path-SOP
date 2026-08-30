import type { UserRole } from "@/features/user/constants/role.constant";
import { ForbiddenError } from "@/lib/errors";

import { getOverallLeaderboard } from "../individual-dashboard/get-overall-leaderboard.service";
import { getKraLeaderboard } from "./get-kra-leaderboard.service";
import { getTeamKraStats } from "./get-team-kra-stats.service";
import { getTeamTaskStats } from "./get-team-task-stats.service";
import { getTeamWorkload } from "./get-team-workload.service";
import { getTaskLeaderboard } from "./get-task-leaderboard.service";
import type { DashboardPeriod } from "../period-presets.util";
import type { AdminDashboardStats } from "../../types/admin-dashboard/admin-dashboard-stats.type";

export async function getAdminDashboardStats(
  companyId: string,
  currentUserRole: UserRole,
  period: DashboardPeriod,
): Promise<AdminDashboardStats> {
  if (currentUserRole !== "ADMIN") {
    throw new ForbiddenError("Only admins can view this dashboard.");
  }

  const [
    teamTaskStats,
    teamKraStats,
    overallLeaderboard,
    taskLeaderboard,
    kraLeaderboard,
    memberWorkload,
  ] = await Promise.all([
    getTeamTaskStats(companyId, period),
    getTeamKraStats(companyId, period),
    getOverallLeaderboard(companyId, period),
    getTaskLeaderboard(companyId, period),
    getKraLeaderboard(companyId, period),
    getTeamWorkload(companyId),
  ]);

  return {
    periodLabel: period.label,
    teamTaskStats,
    teamKraStats,
    overallLeaderboard,
    taskLeaderboard,
    kraLeaderboard,
    memberWorkload,
  };
}
