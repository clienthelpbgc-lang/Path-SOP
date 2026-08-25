export interface AdminTaskHealth {
  dueToday: number;
  overdue: number;
  statusBreakdown: {
    pending: number;
    in_progress: number;
    completed: number;
  };
}

export interface AdminMemberWorkload {
  userId: string;
  name: string;
  openCount: number;
  overdueCount: number;
}

export interface AdminLeaderboardEntry {
  userId: string;
  name: string;
  completed: number;
  total: number;
  score: number;
}

export interface AdminOverallLeaderboardEntry {
  userId: string;
  name: string;
  taskScore: number;
  kraScore: number;
  score: number;
}

export interface AdminDashboardOverview {
  taskHealth: AdminTaskHealth;
  memberWorkload: AdminMemberWorkload[];
  taskLeaderboard: AdminLeaderboardEntry[];
  kraLeaderboard: AdminLeaderboardEntry[];
  overallLeaderboard: AdminOverallLeaderboardEntry[];
}
