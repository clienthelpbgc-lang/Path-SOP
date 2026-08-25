import { AlertCircle, CalendarClock } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { AdminTaskHealth } from "@/features/dashboard/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const STATUS_SEGMENTS: {
  key: keyof AdminTaskHealth["statusBreakdown"];
  label: string;
  barClassName: string;
  dotClassName: string;
}[] = [
  {
    key: "pending",
    label: "Pending",
    barClassName: "bg-amber-500",
    dotClassName: "bg-amber-500",
  },
  {
    key: "in_progress",
    label: "In Progress",
    barClassName: "bg-blue-500",
    dotClassName: "bg-blue-500",
  },
  {
    key: "completed",
    label: "Completed",
    barClassName: "bg-emerald-500",
    dotClassName: "bg-emerald-500",
  },
];

function CountCard({
  icon: Icon,
  iconClassName,
  label,
  value,
}: {
  icon: LucideIcon;
  iconClassName: string;
  label: string;
  value: number;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4">
        <div
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-full",
            iconClassName,
          )}
        >
          <Icon className="size-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-2xl font-semibold tracking-tight text-foreground">
            {value}
          </span>
          <span className="text-sm text-muted-foreground">{label}</span>
        </div>
      </CardContent>
    </Card>
  );
}

export function AdminTaskHealthCards({
  taskHealth,
}: {
  taskHealth: AdminTaskHealth;
}) {
  const total =
    taskHealth.statusBreakdown.pending +
    taskHealth.statusBreakdown.in_progress +
    taskHealth.statusBreakdown.completed;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <CountCard
        icon={CalendarClock}
        iconClassName="bg-blue-500/10 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400"
        label="Open Tasks Due Today"
        value={taskHealth.dueToday}
      />
      <CountCard
        icon={AlertCircle}
        iconClassName="bg-red-500/10 text-red-600 dark:bg-red-500/15 dark:text-red-400"
        label="Overdue Tasks"
        value={taskHealth.overdue}
      />
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Task Status Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
            {STATUS_SEGMENTS.map((segment) => {
              const value = taskHealth.statusBreakdown[segment.key];
              const width = total > 0 ? (value / total) * 100 : 0;
              return (
                <div
                  key={segment.key}
                  className={segment.barClassName}
                  style={{ width: `${width}%` }}
                  title={`${segment.label}: ${value}`}
                />
              );
            })}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {STATUS_SEGMENTS.map((segment) => (
              <div
                key={segment.key}
                className="flex items-center gap-1.5 text-xs text-muted-foreground"
              >
                <span
                  className={cn("size-2 rounded-full", segment.dotClassName)}
                />
                {segment.label}
                <span className="font-medium text-foreground">
                  {taskHealth.statusBreakdown[segment.key]}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function AdminTaskHealthCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {[0, 1, 2].map((i) => (
        <Card key={i}>
          <CardContent className="flex items-center gap-4">
            <div className="size-11 shrink-0 animate-pulse rounded-full bg-muted" />
            <div className="flex flex-1 flex-col gap-2">
              <div className="h-7 w-12 animate-pulse rounded bg-muted" />
              <div className="h-4 w-32 animate-pulse rounded bg-muted" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
