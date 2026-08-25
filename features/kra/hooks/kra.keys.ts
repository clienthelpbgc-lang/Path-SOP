import type { ListKrasQueryInput } from "@/features/kra/types";

export const kraKeys = {
  all: ["kras"] as const,
  lists: () => [...kraKeys.all, "list"] as const,
  list: (query: ListKrasQueryInput) => [...kraKeys.lists(), query] as const,
  details: () => [...kraKeys.all, "detail"] as const,
  detail: (id: string) => [...kraKeys.details(), id] as const,
};
