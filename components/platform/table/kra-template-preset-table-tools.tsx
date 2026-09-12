"use client";

import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { CreateKraTemplatePresetDialog } from "@/components/platform/create-kra-template-preset-dialog";

export type KraTemplatePresetFilters = {
  search: string;
};

export const EMPTY_KRA_TEMPLATE_PRESET_FILTERS: KraTemplatePresetFilters = {
  search: "",
};

export function hasActiveKraTemplatePresetFilters(
  filters: KraTemplatePresetFilters,
): boolean {
  return filters.search !== "";
}

type KraTemplatePresetTableToolsProps = {
  filters: KraTemplatePresetFilters;
  onFiltersChange: (patch: Partial<KraTemplatePresetFilters>) => void;
};

export function KraTemplatePresetTableTools({
  filters,
  onFiltersChange,
}: KraTemplatePresetTableToolsProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="relative w-full sm:max-w-xs">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search presets..."
          value={filters.search}
          onChange={(event) => onFiltersChange({ search: event.target.value })}
          className="pl-8"
        />
      </div>
      <CreateKraTemplatePresetDialog />
    </div>
  );
}
