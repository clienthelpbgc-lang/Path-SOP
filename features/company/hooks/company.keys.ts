import type { ListCompaniesQueryInput } from "@/features/company/types";

export const companyKeys = {
  all: ["companies"] as const,
  lists: () => [...companyKeys.all, "list"] as const,
  list: (query: ListCompaniesQueryInput) =>
    [...companyKeys.lists(), query] as const,
  details: () => [...companyKeys.all, "detail"] as const,
  detail: (id: string) => [...companyKeys.details(), id] as const,
};
