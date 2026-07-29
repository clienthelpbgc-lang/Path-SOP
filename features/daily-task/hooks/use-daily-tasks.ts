"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { getDailyTasks } from "@/features/daily-task/hooks/daily-task.api";
import { dailyTaskKeys } from "@/features/daily-task/hooks/daily-task.keys";
import type { ListDailyTasksQueryInput } from "@/features/daily-task/types";

export function useDailyTasks(query: ListDailyTasksQueryInput = {}) {
  return useQuery({
    queryKey: dailyTaskKeys.list(query),
    queryFn: () => getDailyTasks(query),
    placeholderData: keepPreviousData,
  });
}
