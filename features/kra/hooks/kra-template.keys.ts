import type { ListKraTemplatesQueryInput } from "@/features/kra/types";

export const kraTemplateKeys = {
  all: ["kra-templates"] as const,
  lists: () => [...kraTemplateKeys.all, "list"] as const,
  list: (query: ListKraTemplatesQueryInput) =>
    [...kraTemplateKeys.lists(), query] as const,
  details: () => [...kraTemplateKeys.all, "detail"] as const,
  detail: (id: string) => [...kraTemplateKeys.details(), id] as const,
};
