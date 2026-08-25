import type { KraStatus } from "@/features/kra/constants/kra-status.constant";
import type { KraType } from "@/features/kra/constants/kra-type.constant";
import type { KraParty } from "@/features/kra/types";
import type { TaskStatus } from "@/features/task/constants/task-status.constant";
import type { TaskParty } from "@/features/task/types";

import type { DashboardStats } from "./dashboard-stats.type";

export interface DashboardRecentTask {
  id: string;
  title: string;
  status: TaskStatus;
  dueAt: Date;
  assignedBy: TaskParty;
}

export interface DashboardRecentKra {
  id: string;
  title: string;
  status: KraStatus;
  type: KraType;
  periodEnd: Date;
  assignedBy: KraParty;
}

export interface DashboardWeeklyCompletionPoint {
  date: string;
  label: string;
  total: number;
  completed: number;
  rate: number;
}

export interface DashboardLeaderboardEntry {
  userId: string;
  name: string;
  completedCount: number;
}

export interface DashboardPerformanceScore {
  score: number;
  taskScore: number;
  kraScore: number;
}

export interface DashboardOverview {
  stats: DashboardStats;
  performanceScore: DashboardPerformanceScore;
  recentTasks: DashboardRecentTask[];
  recentKras: DashboardRecentKra[];
  weeklyCompletion: DashboardWeeklyCompletionPoint[];
  leaderboard: DashboardLeaderboardEntry[];
}
