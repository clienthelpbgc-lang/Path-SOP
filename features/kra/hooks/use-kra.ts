"use client";

import { useQuery } from "@tanstack/react-query";

import { getKraRequest } from "@/features/kra/hooks/kra.api";
import { kraKeys } from "@/features/kra/hooks/kra.keys";

export function useKra(id: string) {
  return useQuery({
    queryKey: kraKeys.detail(id),
    queryFn: () => getKraRequest(id),
    enabled: Boolean(id),
  });
}
