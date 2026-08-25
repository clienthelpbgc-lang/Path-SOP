"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { getTasks } from "@/features/task/hooks/task.api";
import { taskKeys } from "@/features/task/hooks/task.keys";
import type { ListTasksQueryInput } from "@/features/task/types";

export function useTasks(query: ListTasksQueryInput = {}) {
  return useQuery({
    queryKey: taskKeys.list(query),
    queryFn: () => getTasks(query),
    placeholderData: keepPreviousData,
  });
}
