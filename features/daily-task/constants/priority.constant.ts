export const TASK_PRIORITIES = [1, 2, 3, 4] as const;

export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  1: "P1",
  2: "P2",
  3: "P3",
  4: "P4",
};

export const TASK_PRIORITY_BADGE_CLASSES: Record<TaskPriority, string> = {
  1: "bg-destructive/10 text-destructive",
  2: "bg-amber-500/10 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
  3: "bg-accent text-accent-foreground",
  4: "bg-muted text-muted-foreground",
};
