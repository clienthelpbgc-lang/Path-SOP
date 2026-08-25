"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { getKras } from "@/features/kra/hooks/kra.api";
import { kraKeys } from "@/features/kra/hooks/kra.keys";
import type { ListKrasQueryInput } from "@/features/kra/types";

export function useKras(query: ListKrasQueryInput = {}) {
  return useQuery({
    queryKey: kraKeys.list(query),
    queryFn: () => getKras(query),
    placeholderData: keepPreviousData,
  });
}
