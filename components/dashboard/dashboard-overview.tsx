"use client";

import { useDashboardOverview } from "@/features/dashboard/hooks";
import { DashboardPeriodPerformance } from "@/components/dashboard/dashboard-period-performance";
import {
  DashboardLeaderboard,
  DashboardLeaderboardSkeleton,
} from "@/components/dashboard/dashboard-leaderboard";
import {
  DashboardRecentKras,
  DashboardRecentKrasSkeleton,
} from "@/components/dashboard/dashboard-recent-kras";
import {
  DashboardRecentTasks,
  DashboardRecentTasksSkeleton,
} from "@/components/dashboard/dashboard-recent-tasks";
import {
  DashboardScoreCard,
  DashboardScoreCardSkeleton,
} from "@/components/dashboard/dashboard-score-card";
import {
  DashboardStatCards,
  DashboardStatCardsSkeleton,
} from "@/components/dashboard/dashboard-stat-cards";
import {
  DashboardWeeklyCompletionChart,
  DashboardWeeklyCompletionChartSkeleton,
} from "@/components/dashboard/dashboard-weekly-completion-chart";

// One request backs every section below, instead of each one fetching
// independently.
export function DashboardOverview({ currentUserId }: { currentUserId: string }) {
  const { data, isLoading } = useDashboardOverview();

  if (isLoading || !data) {
    return (
      <div className="flex flex-col gap-6">
        <DashboardPeriodPerformance />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
          <div className="lg:col-span-3">
            <DashboardStatCardsSkeleton />
          </div>
          <DashboardScoreCardSkeleton />
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <DashboardRecentTasksSkeleton />
          <DashboardRecentKrasSkeleton />
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <DashboardWeeklyCompletionChartSkeleton />
          <DashboardLeaderboardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <DashboardPeriodPerformance />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <div className="lg:col-span-3">
          <DashboardStatCards stats={data.stats} />
        </div>
        <DashboardScoreCard performance={data.performanceScore} />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <DashboardRecentTasks tasks={data.recentTasks} />
        <DashboardRecentKras kras={data.recentKras} />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <DashboardWeeklyCompletionChart points={data.weeklyCompletion} />
        <DashboardLeaderboard
          entries={data.leaderboard}
          currentUserId={currentUserId}
        />
      </div>
    </div>
  );
}
