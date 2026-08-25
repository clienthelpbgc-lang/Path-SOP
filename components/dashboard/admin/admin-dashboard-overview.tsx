"use client";

import { ListTodo, Target } from "lucide-react";

import { useAdminDashboardOverview } from "@/features/dashboard/hooks";
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
  AdminTaskHealthCards,
  AdminTaskHealthCardsSkeleton,
} from "@/components/dashboard/admin/admin-task-health-cards";

// One request backs every section below, instead of each one fetching
// independently.
export function AdminDashboardOverview() {
  const { data, isLoading } = useAdminDashboardOverview();

  if (isLoading || !data) {
    return (
      <div className="flex flex-col gap-6">
        <AdminTaskHealthCardsSkeleton />
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
      <AdminTaskHealthCards taskHealth={data.taskHealth} />
      <AdminMemberWorkload members={data.memberWorkload} />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <AdminLeaderboardCard
          title="Task Leaderboard"
          icon={ListTodo}
          entries={data.taskLeaderboard ?? []}
          emptyDescription="Once tasks are assigned and completed, rankings show up here."
        />
        <AdminLeaderboardCard
          title="KRA Leaderboard"
          icon={Target}
          entries={data.kraLeaderboard ?? []}
          emptyDescription="Once KRAs are assigned and completed, rankings show up here."
        />
        <AdminOverallLeaderboardCard entries={data.overallLeaderboard ?? []} />
      </div>
    </div>
  );
}
