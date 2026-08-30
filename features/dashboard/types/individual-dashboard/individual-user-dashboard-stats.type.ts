import type { AdminOverallLeaderboardEntry } from "../admin-dashboard/admin-dashboard-overview.type";
import type {
  DashboardRecentKra,
  DashboardRecentTask,
} from "../dashboard-overview.type";
import type { KraCompletionAnalytics } from "./kra-completion-analytics.type";
import type { TaskCompletionAnalytics } from "./task-completion-analytics.type";

export interface DashboardOverallScore {
  score: number;
  taskScore: number;
  kraScore: number;
}

export interface IndividualUserDashboardStats {
  periodLabel: string;
  taskCompletion: TaskCompletionAnalytics;
  kraCompletion: KraCompletionAnalytics;
  overallScore: DashboardOverallScore;
  recentTasks: DashboardRecentTask[];
  recentKras: DashboardRecentKra[];
  taskCompletionTrend: number[];
  overallLeaderboard: AdminOverallLeaderboardEntry[];
}
