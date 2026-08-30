import { ListTodo } from "lucide-react";

import type { TaskCompletionAnalytics } from "@/features/dashboard/types";
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

export function TaskCompletionCard({
  data,
}: {
  data: TaskCompletionAnalytics;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-1.5">
          <ListTodo className="size-4 text-muted-foreground" />
          Tasks
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-3 gap-2">
        <Stat
          label="Completed"
          value={data.totalCompletedTaskInTime}
          valueClassName="text-emerald-600 dark:text-emerald-400"
        />
        <Stat
          label="Overdue"
          value={data.totalOverdueTask}
          valueClassName="text-red-600 dark:text-red-400"
        />
        <Stat label="Total Assigned" value={data.totalAssignedTask} />
      </CardContent>
    </Card>
  );
}

export function TaskCompletionCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-1.5">
          <ListTodo className="size-4 text-muted-foreground" />
          Tasks
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-3 gap-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <div className="h-7 w-10 animate-pulse rounded bg-muted" />
            <div className="h-3 w-16 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
