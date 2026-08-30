import type {
  AdminLeaderboardEntry,
  AdminMemberWorkload,
  AdminOverallLeaderboardEntry,
} from "./admin-dashboard-overview.type";
import type { TeamKraStats } from "./team-kra-stats.type";
import type { TeamTaskStats } from "./team-task-stats.type";

export interface AdminDashboardStats {
  periodLabel: string;
  teamTaskStats: TeamTaskStats;
  teamKraStats: TeamKraStats;
  overallLeaderboard: AdminOverallLeaderboardEntry[];
  taskLeaderboard: AdminLeaderboardEntry[];
  kraLeaderboard: AdminLeaderboardEntry[];
  memberWorkload: AdminMemberWorkload[];
}
