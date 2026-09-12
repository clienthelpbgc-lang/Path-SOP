"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { getTaskTemplatePresets } from "@/features/task/hooks/task-template-preset.api";
import { taskTemplatePresetKeys } from "@/features/task/hooks/task-template-preset.keys";
import type { ListTaskTemplatePresetsQueryInput } from "@/features/task/types";

// Platform-admin-facing, paginated -- see use-company-task-template-presets
// for the tenant-facing, unpaginated read.
export function useTaskTemplatePresets(
  query: ListTaskTemplatePresetsQueryInput = {},
) {
  return useQuery({
    queryKey: taskTemplatePresetKeys.list(query),
    queryFn: () => getTaskTemplatePresets(query),
    placeholderData: keepPreviousData,
  });
}
