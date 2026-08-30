import { getKraCompletionAnalytics } from "./get-kra-completion-analytics.service";
import { getOverallLeaderboard } from "./get-overall-leaderboard.service";
import { getRecentAssignedKras } from "./get-recent-assigned-kras.service";
import { getRecentAssignedTasks } from "./get-recent-assigned-tasks.service";
import { getTaskCompletionAnalytics } from "./get-task-completion-analytics.service";
import { getTaskCompletionTrend } from "./get-task-completion-trend.service";
import type { DashboardPeriod } from "../period-presets.util";
import type { IndividualUserDashboardStats } from "../../types";

export async function getIndividualUserDashboardStats(
  companyId: string,
  userId: string,
  period: DashboardPeriod,
): Promise<IndividualUserDashboardStats> {
  const [
    taskCompletion,
    kraCompletion,
    recentTasks,
    recentKras,
    taskCompletionTrend,
    overallLeaderboard,
  ] = await Promise.all([
    getTaskCompletionAnalytics(companyId, userId, period),
    getKraCompletionAnalytics(companyId, userId, period),
    getRecentAssignedTasks(companyId, userId, period),
    getRecentAssignedKras(companyId, userId, period),
    getTaskCompletionTrend(companyId, userId),
    getOverallLeaderboard(companyId, period),
  ]);

  const taskScore = taskCompletion.percentageOfCompletion;
  const kraScore = kraCompletion.percentageOfCompletion;

  return {
    periodLabel: period.label,
    taskCompletion,
    kraCompletion,
    overallScore: {
      score: Math.round(taskScore * 0.5 + kraScore * 0.5),
      taskScore,
      kraScore,
    },
    recentTasks,
    recentKras,
    taskCompletionTrend,
    overallLeaderboard,
  };
}
