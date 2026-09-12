"use client";

import { useQuery } from "@tanstack/react-query";

import { getCompanyTaskTemplatePresets } from "@/features/task/hooks/task-template-preset.api";
import { taskTemplatePresetKeys } from "@/features/task/hooks/task-template-preset.keys";

export function useCompanyTaskTemplatePresets() {
  return useQuery({
    queryKey: taskTemplatePresetKeys.active(),
    queryFn: getCompanyTaskTemplatePresets,
  });
}
