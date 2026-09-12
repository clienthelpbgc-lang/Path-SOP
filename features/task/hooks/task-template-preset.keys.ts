import type { ListTaskTemplatePresetsQueryInput } from "@/features/task/types";

export const taskTemplatePresetKeys = {
  all: ["task-template-presets"] as const,
  lists: () => [...taskTemplatePresetKeys.all, "list"] as const,
  list: (query: ListTaskTemplatePresetsQueryInput) =>
    [...taskTemplatePresetKeys.lists(), query] as const,
  active: () => [...taskTemplatePresetKeys.all, "active"] as const,
  details: () => [...taskTemplatePresetKeys.all, "detail"] as const,
  detail: (id: string) => [...taskTemplatePresetKeys.details(), id] as const,
};
