import {
  TASK_PRIORITY_BADGE_CLASSES,
  TASK_PRIORITY_LABELS,
  type TaskPriority,
} from "@/features/daily-task/constants/priority.constant";
import {
  TASK_STATUS_BADGE_CLASSES,
  TASK_STATUS_LABELS,
  type TaskStatus,
} from "@/features/daily-task/constants/status.constant";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function StatusBadge({ status }: { status: TaskStatus }) {
  return (
    <Badge
      variant="outline"
      className={cn("border-transparent", TASK_STATUS_BADGE_CLASSES[status])}
    >
      {TASK_STATUS_LABELS[status]}
    </Badge>
  );
}

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "border-transparent",
        TASK_PRIORITY_BADGE_CLASSES[priority],
      )}
    >
      {TASK_PRIORITY_LABELS[priority]}
    </Badge>
  );
}
