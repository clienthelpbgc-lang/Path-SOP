"use client";

import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";

export type KraTemplateFilters = {
  search: string;
};

export const EMPTY_KRA_TEMPLATE_FILTERS: KraTemplateFilters = {
  search: "",
};

export function hasActiveKraTemplateFilters(
  filters: KraTemplateFilters,
): boolean {
  return filters.search !== "";
}

type KraTemplateTableToolsProps = {
  filters: KraTemplateFilters;
  onFiltersChange: (patch: Partial<KraTemplateFilters>) => void;
};

export function KraTemplateTableTools({
  filters,
  onFiltersChange,
}: KraTemplateTableToolsProps) {
  return (
    <div className="relative w-full sm:max-w-xs">
      <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder="Search templates..."
        value={filters.search}
        onChange={(event) => onFiltersChange({ search: event.target.value })}
        className="pl-8"
      />
    </div>
  );
}
