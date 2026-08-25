"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { getKraTemplates } from "@/features/kra/hooks/kra-template.api";
import { kraTemplateKeys } from "@/features/kra/hooks/kra-template.keys";
import type { ListKraTemplatesQueryInput } from "@/features/kra/types";

export function useKraTemplates(query: ListKraTemplatesQueryInput = {}) {
  return useQuery({
    queryKey: kraTemplateKeys.list(query),
    queryFn: () => getKraTemplates(query),
    placeholderData: keepPreviousData,
  });
}
