import type { ListDailyTasksQueryInput } from "@/features/daily-task/types";

export const dailyTaskKeys = {
  all: ["daily-tasks"] as const,
  lists: () => [...dailyTaskKeys.all, "list"] as const,
  list: (query: ListDailyTasksQueryInput) =>
    [...dailyTaskKeys.lists(), query] as const,
  details: () => [...dailyTaskKeys.all, "detail"] as const,
  detail: (id: string) => [...dailyTaskKeys.details(), id] as const,
};
