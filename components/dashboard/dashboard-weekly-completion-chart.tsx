import type { DashboardWeeklyCompletionPoint } from "@/features/dashboard/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const CHART_HEIGHT = "h-28";

export function DashboardWeeklyCompletionChart({
  points,
}: {
  points: DashboardWeeklyCompletionPoint[];
}) {
  const hasAnyTasks = points.some((point) => point.total > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Task Completion Rate</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex h-40 items-end gap-3">
          {points.map((point) => (
            <div
              key={point.date}
              className="flex flex-1 flex-col items-center gap-2"
            >
              <span className="text-xs font-medium text-foreground">
                {point.total > 0 ? `${point.rate}%` : "–"}
              </span>
              <div
                className={cn(
                  "flex w-full items-end overflow-hidden rounded-md bg-muted/50",
                  CHART_HEIGHT,
                )}
              >
                <div
                  className={cn(
                    "w-full rounded-md transition-all",
                    point.total > 0 ? "bg-primary" : "bg-transparent",
                  )}
                  style={{ height: `${point.rate}%` }}
                  title={`${point.completed}/${point.total} tasks completed`}
                />
              </div>
              <span className="text-xs text-muted-foreground">
                {point.label}
              </span>
            </div>
          ))}
        </div>
        {!hasAnyTasks && (
          <p className="mt-4 text-center text-sm text-muted-foreground">
            No tasks due this week yet.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export function DashboardWeeklyCompletionChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Task Completion Rate</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex h-40 items-end gap-3">
          {Array.from({ length: 7 }, (_, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-2">
              <div
                className={cn(
                  "w-full animate-pulse rounded-md bg-muted",
                  CHART_HEIGHT,
                )}
              />
              <div className="h-3 w-6 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
