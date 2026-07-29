"use client";

import { useQuery } from "@tanstack/react-query";

import { getDailyTaskRequest } from "@/features/daily-task/hooks/daily-task.api";
import { dailyTaskKeys } from "@/features/daily-task/hooks/daily-task.keys";

export function useDailyTask(id: string) {
  return useQuery({
    queryKey: dailyTaskKeys.detail(id),
    queryFn: () => getDailyTaskRequest(id),
    enabled: Boolean(id),
  });
}
