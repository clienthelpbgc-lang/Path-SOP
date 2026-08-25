"use client";

import { useQuery } from "@tanstack/react-query";

import { getTaskRequest } from "@/features/task/hooks/task.api";
import { taskKeys } from "@/features/task/hooks/task.keys";

export function useTask(id: string) {
  return useQuery({
    queryKey: taskKeys.detail(id),
    queryFn: () => getTaskRequest(id),
    enabled: Boolean(id),
  });
}
