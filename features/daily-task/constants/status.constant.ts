export const TASK_STATUSES = [
  "PENDING",
  "IN_PROGRESS",
  "SUBMITTED",
  "COMPLETED",
  "MISSED",
  "REJECTED",
] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  PENDING: "Pending",
  IN_PROGRESS: "In Progress",
  SUBMITTED: "Submitted",
  COMPLETED: "Completed",
  MISSED: "Missed",
  REJECTED: "Rejected",
};

export const TASK_STATUS_BADGE_CLASSES: Record<TaskStatus, string> = {
  PENDING: "bg-muted text-muted-foreground",
  IN_PROGRESS: "bg-accent text-accent-foreground",
  SUBMITTED:
    "bg-amber-500/10 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
  COMPLETED:
    "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
  MISSED: "bg-destructive/10 text-destructive",
  REJECTED: "bg-destructive/10 text-destructive",
};
