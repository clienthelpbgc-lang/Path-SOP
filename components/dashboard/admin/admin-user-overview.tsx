"use client";

import { AlertTriangle } from "lucide-react";

import { useAdminUserOverview } from "@/features/dashboard/hooks";
import { DashboardPeriodPerformance } from "@/components/dashboard/dashboard-period-performance";
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
import { PagePlaceholder } from "@/components/layout/page-placeholder";
import { ReportDownloadButtons } from "@/components/dashboard/report-download-buttons";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getAvatarColor } from "@/lib/avatar";
import { cn } from "@/lib/utils";

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function UserHeaderSkeleton() {
  return (
    <div className="flex items-center gap-4">
      <div className="size-10 animate-pulse rounded-full bg-muted" />
      <div className="flex flex-col gap-2">
        <div className="h-5 w-40 animate-pulse rounded bg-muted" />
        <div className="h-4 w-56 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}

// Same data as the personal dashboard, viewed by an admin for one team
// member -- reuses the exact same section components since the shape is
// identical.
export function AdminUserOverview({ userId }: { userId: string }) {
  const { data, isLoading, isError } = useAdminUserOverview(userId);

  if (isError) {
    return (
      <PagePlaceholder
        icon={AlertTriangle}
        title="Couldn't load this member"
        description="They may not exist in your company anymore."
      />
    );
  }

  if (isLoading || !data) {
    return (
      <div className="flex flex-col gap-6">
        <UserHeaderSkeleton />
        <DashboardPeriodPerformance userId={userId} />
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
        <DashboardWeeklyCompletionChartSkeleton />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-4">
          <Avatar size="lg">
            <AvatarFallback
              className={`text-white ${getAvatarColor(data.user.id)}`}
            >
              {initials(data.user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-foreground">
                {data.user.name}
              </h3>
              <Badge
                variant="outline"
                className={cn(
                  "border-transparent",
                  data.user.role === "ADMIN"
                    ? "bg-amber-500/10 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400"
                    : "bg-accent text-accent-foreground",
                )}
              >
                {data.user.role === "ADMIN" ? "Admin" : "User"}
              </Badge>
              {!data.user.isActive && (
                <Badge variant="outline" className="border-transparent bg-muted text-muted-foreground">
                  Inactive
                </Badge>
              )}
            </div>
            <span className="text-sm text-muted-foreground">
              {data.user.email}
            </span>
          </div>
        </div>
        <ReportDownloadButtons userId={data.user.id} />
      </div>

      <DashboardPeriodPerformance userId={data.user.id} />

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
      <DashboardWeeklyCompletionChart points={data.weeklyCompletion} />
    </div>
  );
}
