"use client";

import { useState } from "react";
import { ListTodo, Loader2, Target } from "lucide-react";

import { useAdminDashboardStats } from "@/features/dashboard/hooks";
import type { DashboardPeriodKey } from "@/features/dashboard/types";
import {
  AdminLeaderboardCard,
  AdminLeaderboardCardSkeleton,
} from "@/components/dashboard/admin/admin-leaderboard-card";
import {
  AdminMemberWorkload,
  AdminMemberWorkloadSkeleton,
} from "@/components/dashboard/admin/admin-member-workload";
import {
  AdminOverallLeaderboardCard,
  AdminOverallLeaderboardCardSkeleton,
} from "@/components/dashboard/admin/admin-overall-leaderboard-card";
import {
  AdminTeamKraStatsCard,
  AdminTeamKraStatsCardSkeleton,
} from "@/components/dashboard/admin/admin-team-kra-stats-card";
import {
  AdminTeamTaskStatsCard,
  AdminTeamTaskStatsCardSkeleton,
} from "@/components/dashboard/admin/admin-team-task-stats-card";
import { PeriodSelector } from "@/components/dashboard/period-selector";
import { cn } from "@/lib/utils";

// One request (scoped to the selected period) backs every section below,
// instead of each one fetching independently.
export function AdminDashboardOverview() {
  const [period, setPeriod] = useState<DashboardPeriodKey>("last_week");
  const { data, isLoading, isFetching } = useAdminDashboardStats(period);

  // keepPreviousData means switching periods doesn't trigger the full
  // skeleton below (isLoading stays false) -- this spinner is the only
  // feedback that a refetch is happening while the stale data is shown.
  const header = (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          Admin Dashboard
        </h2>
        <p className="text-sm text-muted-foreground">
          Company-wide task health and team workload.
        </p>
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
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <AdminTeamTaskStatsCardSkeleton />
          <AdminTeamKraStatsCardSkeleton />
        </div>
        <AdminMemberWorkloadSkeleton />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <AdminLeaderboardCardSkeleton title="Task Leaderboard" />
          <AdminLeaderboardCardSkeleton title="KRA Leaderboard" />
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
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <AdminTeamTaskStatsCard stats={data.teamTaskStats} />
          <AdminTeamKraStatsCard stats={data.teamKraStats} />
        </div>
        <AdminMemberWorkload members={data.memberWorkload} />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <AdminLeaderboardCard
            title="Task Leaderboard"
            icon={ListTodo}
            entries={data.taskLeaderboard}
            emptyDescription="Once tasks are assigned and completed, rankings show up here."
          />
          <AdminLeaderboardCard
            title="KRA Leaderboard"
            icon={Target}
            entries={data.kraLeaderboard}
            emptyDescription="Once KRAs are assigned and completed, rankings show up here."
          />
          <AdminOverallLeaderboardCard entries={data.overallLeaderboard} />
        </div>
      </div>
    </div>
  );
}
