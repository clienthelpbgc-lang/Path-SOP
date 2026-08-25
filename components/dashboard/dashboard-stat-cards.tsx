import { CheckCircle2, ListTodo, Target } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { DashboardStats } from "@/features/dashboard/types";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatCardConfig = {
  key: keyof DashboardStats;
  label: string;
  icon: LucideIcon;
  iconClassName: string;
};

const STAT_CARDS: StatCardConfig[] = [
  {
    key: "tasksAssignedToday",
    label: "Tasks Assigned Today",
    icon: ListTodo,
    iconClassName:
      "bg-blue-500/10 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400",
  },
  {
    key: "tasksCompletedThisMonth",
    label: "Tasks Completed This Month",
    icon: CheckCircle2,
    iconClassName:
      "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
  },
  {
    key: "krasAssignedCurrent",
    label: "KRAs Assigned (Current)",
    icon: Target,
    iconClassName:
      "bg-violet-500/10 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400",
  },
];

export function DashboardStatCards({ stats }: { stats: DashboardStats }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {STAT_CARDS.map((card) => (
        <Card key={card.key}>
          <CardContent className="flex items-center gap-4">
            <div
              className={cn(
                "flex size-11 shrink-0 items-center justify-center rounded-full",
                card.iconClassName,
              )}
            >
              <card.icon className="size-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-semibold tracking-tight text-foreground">
                {stats[card.key]}
              </span>
              <span className="text-sm text-muted-foreground">
                {card.label}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function DashboardStatCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {STAT_CARDS.map((card) => (
        <Card key={card.key}>
          <CardContent className="flex items-center gap-4">
            <div className="size-11 shrink-0 animate-pulse rounded-full bg-muted" />
            <div className="flex flex-col gap-2">
              <div className="h-7 w-12 animate-pulse rounded bg-muted" />
              <div className="h-4 w-32 animate-pulse rounded bg-muted" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
