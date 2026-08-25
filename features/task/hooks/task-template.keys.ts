import type { ListTaskTemplatesQueryInput } from "@/features/task/types";

export const taskTemplateKeys = {
  all: ["task-templates"] as const,
  lists: () => [...taskTemplateKeys.all, "list"] as const,
  list: (query: ListTaskTemplatesQueryInput) =>
    [...taskTemplateKeys.lists(), query] as const,
  details: () => [...taskTemplateKeys.all, "detail"] as const,
  detail: (id: string) => [...taskTemplateKeys.details(), id] as const,
};
