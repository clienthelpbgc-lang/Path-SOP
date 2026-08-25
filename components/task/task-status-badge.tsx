import { AlertCircle, CheckCircle2, CircleDashed, Clock3 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { Task } from "@/features/task/types/task.type";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type EffectiveTaskStatus = "pending" | "in_progress" | "completed" | "overdue";

export function getEffectiveTaskStatus(
  task: Pick<Task, "status" | "dueAt">,
): EffectiveTaskStatus {
  if (task.status === "completed") return "completed";
  if (new Date(task.dueAt) < new Date()) return "overdue";
  return task.status as "pending" | "in_progress";
}

export const TASK_STATUS_LABELS: Record<EffectiveTaskStatus, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  completed: "Completed",
  overdue: "Overdue",
};

export const TASK_STATUS_ICONS: Record<EffectiveTaskStatus, LucideIcon> = {
  pending: Clock3,
  in_progress: CircleDashed,
  completed: CheckCircle2,
  overdue: AlertCircle,
};

export const TASK_STATUS_BADGE_CLASSES: Record<EffectiveTaskStatus, string> = {
  pending:
    "bg-amber-500/10 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
  in_progress:
    "bg-blue-500/10 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400",
  completed:
    "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
  overdue: "bg-red-500/10 text-red-600 dark:bg-red-500/15 dark:text-red-400",
};

export const TASK_STATUS_DOT_CLASSES: Record<EffectiveTaskStatus, string> = {
  pending: "bg-amber-500",
  in_progress: "bg-blue-500",
  completed: "bg-emerald-500",
  overdue: "bg-red-500",
};

export function TaskStatusBadge({
  status,
  className,
}: {
  status: EffectiveTaskStatus;
  className?: string;
}) {
  const Icon = TASK_STATUS_ICONS[status];

  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1 border-transparent",
        TASK_STATUS_BADGE_CLASSES[status],
        className,
      )}
    >
      <Icon className="size-3" />
      {TASK_STATUS_LABELS[status]}
    </Badge>
  );
}
