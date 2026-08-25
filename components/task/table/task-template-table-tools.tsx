"use client";

import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";

export type TaskTemplateFilters = {
  search: string;
};

export const EMPTY_TASK_TEMPLATE_FILTERS: TaskTemplateFilters = {
  search: "",
};

export function hasActiveTaskTemplateFilters(
  filters: TaskTemplateFilters,
): boolean {
  return filters.search !== "";
}

type TaskTemplateTableToolsProps = {
  filters: TaskTemplateFilters;
  onFiltersChange: (patch: Partial<TaskTemplateFilters>) => void;
};

export function TaskTemplateTableTools({
  filters,
  onFiltersChange,
}: TaskTemplateTableToolsProps) {
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
