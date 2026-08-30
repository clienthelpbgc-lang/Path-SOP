"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";

import { useDashboardStats } from "@/features/dashboard/hooks";
import type { DashboardPeriodKey } from "@/features/dashboard/types";
import {
  AdminOverallLeaderboardCard,
  AdminOverallLeaderboardCardSkeleton,
} from "@/components/dashboard/admin/admin-overall-leaderboard-card";
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
  KraCompletionCard,
  KraCompletionCardSkeleton,
} from "@/components/dashboard/kra-completion-card";
import { PeriodSelector } from "@/components/dashboard/period-selector";
import {
  TaskCompletionCard,
  TaskCompletionCardSkeleton,
} from "@/components/dashboard/task-completion-card";
import {
  TaskCompletionTrendChart,
  TaskCompletionTrendChartSkeleton,
} from "@/components/dashboard/task-completion-trend-chart";
import { cn } from "@/lib/utils";

// One request (scoped to the selected period) backs every section below,
// instead of each one fetching independently.
export function DashboardOverview({
  userId,
  title,
  description,
}: {
  userId: string;
  title: ReactNode;
  description: ReactNode;
}) {
  const [period, setPeriod] = useState<DashboardPeriodKey>("last_week");
  const { data, isLoading, isFetching } = useDashboardStats(userId, period);

  // keepPreviousData means switching periods doesn't trigger the full
  // skeleton below (isLoading stays false) -- this spinner is the only
  // feedback that a refetch is happening while the stale data is shown.
  const header = (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          {title}
        </h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="flex items-center gap-2">
        {isFetching && !isLoading && (
          <Loader2 className="size-4 animate-spin text-muted-foreground" />
        )}
        <PeriodSelector value={period} onValueChange={setPeriod} />
      </div>
    </div>
  );

  if (isLoading || !data) {
    return (
      <div className="flex flex-col gap-6">
        {header}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <TaskCompletionCardSkeleton />
          <KraCompletionCardSkeleton />
          <DashboardScoreCardSkeleton />
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <DashboardRecentTasksSkeleton />
          <DashboardRecentKrasSkeleton />
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <TaskCompletionTrendChartSkeleton />
          <AdminOverallLeaderboardCardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {header}
      <div
        className={cn(
          "flex flex-col gap-6 transition-opacity",
          isFetching && "opacity-60",
        )}
      >
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <TaskCompletionCard data={data.taskCompletion} />
          <KraCompletionCard data={data.kraCompletion} />
          <DashboardScoreCard performance={data.overallScore} />
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <DashboardRecentTasks tasks={data.recentTasks} />
          <DashboardRecentKras kras={data.recentKras} />
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <TaskCompletionTrendChart trend={data.taskCompletionTrend} />
          <AdminOverallLeaderboardCard entries={data.overallLeaderboard} />
        </div>
      </div>
    </div>
  );
}
