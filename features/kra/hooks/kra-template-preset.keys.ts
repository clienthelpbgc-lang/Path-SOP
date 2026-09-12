import type { ListKraTemplatePresetsQueryInput } from "@/features/kra/types";

export const kraTemplatePresetKeys = {
  all: ["kra-template-presets"] as const,
  lists: () => [...kraTemplatePresetKeys.all, "list"] as const,
  list: (query: ListKraTemplatePresetsQueryInput) =>
    [...kraTemplatePresetKeys.lists(), query] as const,
  active: () => [...kraTemplatePresetKeys.all, "active"] as const,
  details: () => [...kraTemplatePresetKeys.all, "detail"] as const,
  detail: (id: string) => [...kraTemplatePresetKeys.details(), id] as const,
};
