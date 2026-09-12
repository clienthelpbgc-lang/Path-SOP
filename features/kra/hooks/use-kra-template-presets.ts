"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { getKraTemplatePresets } from "@/features/kra/hooks/kra-template-preset.api";
import { kraTemplatePresetKeys } from "@/features/kra/hooks/kra-template-preset.keys";
import type { ListKraTemplatePresetsQueryInput } from "@/features/kra/types";

// Platform-admin-facing, paginated -- see use-company-kra-template-presets
// for the tenant-facing, unpaginated read.
export function useKraTemplatePresets(
  query: ListKraTemplatePresetsQueryInput = {},
) {
  return useQuery({
    queryKey: kraTemplatePresetKeys.list(query),
    queryFn: () => getKraTemplatePresets(query),
    placeholderData: keepPreviousData,
  });
}
