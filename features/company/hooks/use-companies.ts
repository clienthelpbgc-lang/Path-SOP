"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { getCompanies } from "@/features/company/hooks/company.api";
import { companyKeys } from "@/features/company/hooks/company.keys";
import type { ListCompaniesQueryInput } from "@/features/company/types";

export function useCompanies(query: ListCompaniesQueryInput = {}) {
  return useQuery({
    queryKey: companyKeys.list(query),
    queryFn: () => getCompanies(query),
    placeholderData: keepPreviousData,
  });
}
