import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const CHART_HEIGHT = "h-28";
const TREND_DAYS = 7;

// The trend is just raw counts, oldest day first -- labels are derived
// client-side from "today" backwards since the API doesn't send dates.
function getLastNDaysLabels(n: number): string[] {
  const today = new Date();
  return Array.from({ length: n }, (_, i) => {
    const day = new Date(today);
    day.setDate(day.getDate() - (n - 1 - i));
    return new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(day);
  });
}

export function TaskCompletionTrendChart({ trend }: { trend: number[] }) {
  const labels = getLastNDaysLabels(trend.length || TREND_DAYS);
  const max = Math.max(1, ...trend);
  const hasAny = trend.some((count) => count > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Task Completion · Last 7 Days</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex h-40 items-end gap-3">
          {trend.map((count, index) => (
            <div key={index} className="flex flex-1 flex-col items-center gap-2">
              <span className="text-xs font-medium text-foreground">
                {count}
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
                    count > 0 ? "bg-primary" : "bg-transparent",
                  )}
                  style={{ height: `${(count / max) * 100}%` }}
                  title={`${count} completed`}
                />
              </div>
              <span className="text-xs text-muted-foreground">
                {labels[index]}
              </span>
            </div>
          ))}
        </div>
        {!hasAny && (
          <p className="mt-4 text-center text-sm text-muted-foreground">
            No tasks completed in the last 7 days.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export function TaskCompletionTrendChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Task Completion · Last 7 Days</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex h-40 items-end gap-3">
          {Array.from({ length: TREND_DAYS }, (_, i) => (
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
