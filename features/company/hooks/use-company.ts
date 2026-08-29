"use client";

import { useQuery } from "@tanstack/react-query";

import { getCompanyRequest } from "@/features/company/hooks/company.api";
import { companyKeys } from "@/features/company/hooks/company.keys";

export function useCompany(id: string) {
  return useQuery({
    queryKey: companyKeys.detail(id),
    queryFn: () => getCompanyRequest(id),
    enabled: Boolean(id),
  });
}
