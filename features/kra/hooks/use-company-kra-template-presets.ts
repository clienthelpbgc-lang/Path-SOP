"use client";

import { useQuery } from "@tanstack/react-query";

import { getCompanyKraTemplatePresets } from "@/features/kra/hooks/kra-template-preset.api";
import { kraTemplatePresetKeys } from "@/features/kra/hooks/kra-template-preset.keys";

export function useCompanyKraTemplatePresets() {
  return useQuery({
    queryKey: kraTemplatePresetKeys.active(),
    queryFn: getCompanyKraTemplatePresets,
  });
}
