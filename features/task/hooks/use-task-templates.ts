"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { getTaskTemplates } from "@/features/task/hooks/task-template.api";
import { taskTemplateKeys } from "@/features/task/hooks/task-template.keys";
import type { ListTaskTemplatesQueryInput } from "@/features/task/types";

export function useTaskTemplates(query: ListTaskTemplatesQueryInput = {}) {
  return useQuery({
    queryKey: taskTemplateKeys.list(query),
    queryFn: () => getTaskTemplates(query),
    placeholderData: keepPreviousData,
  });
}
