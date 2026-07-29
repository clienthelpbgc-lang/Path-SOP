import type { ListUsersQueryInput } from "@/features/user/types";

export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (query: ListUsersQueryInput) => [...userKeys.lists(), query] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};
