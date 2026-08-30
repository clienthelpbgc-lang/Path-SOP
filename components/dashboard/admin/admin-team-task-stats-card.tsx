import { ListTodo } from "lucide-react";

import type { TeamTaskStats } from "@/features/dashboard/types";
import { getScoreTier, SCORE_TIERS } from "@/components/dashboard/score-tier";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

function Stat({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: number;
  valueClassName?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <span
        className={cn(
          "text-2xl font-semibold tracking-tight",
          valueClassName ?? "text-foreground",
        )}
      >
        {value}
      </span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

export function AdminTeamTaskStatsCard({ stats }: { stats: TeamTaskStats }) {
  const tier = SCORE_TIERS[getScoreTier(stats.teamTaskCompletionRate)];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <CardTitle className="flex items-center gap-1.5">
          <ListTodo className="size-4 text-muted-foreground" />
          Team Tasks
        </CardTitle>
        <span
          className={cn(
            "shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold",
            tier.bg,
            tier.text,
          )}
        >
          {stats.teamTaskCompletionRate}%
        </span>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Assigned" value={stats.totalAssigned} />
        <Stat
          label="Completed"
          value={stats.totalCompleted}
          valueClassName="text-emerald-600 dark:text-emerald-400"
        />
        <Stat
          label="Pending"
          value={stats.totalPending}
          valueClassName="text-amber-600 dark:text-amber-400"
        />
        <Stat
          label="Overdue"
          value={stats.totalOverdue}
          valueClassName="text-red-600 dark:text-red-400"
        />
      </CardContent>
    </Card>
  );
}

export function AdminTeamTaskStatsCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <CardTitle className="flex items-center gap-1.5">
          <ListTodo className="size-4 text-muted-foreground" />
          Team Tasks
        </CardTitle>
        <div className="h-5 w-10 animate-pulse rounded-full bg-muted" />
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <div className="h-7 w-10 animate-pulse rounded bg-muted" />
            <div className="h-3 w-14 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
