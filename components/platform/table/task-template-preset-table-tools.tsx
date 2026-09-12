"use client";

import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { CreateTaskTemplatePresetDialog } from "@/components/platform/create-task-template-preset-dialog";

export type TaskTemplatePresetFilters = {
  search: string;
};

export const EMPTY_TASK_TEMPLATE_PRESET_FILTERS: TaskTemplatePresetFilters = {
  search: "",
};

export function hasActiveTaskTemplatePresetFilters(
  filters: TaskTemplatePresetFilters,
): boolean {
  return filters.search !== "";
}

type TaskTemplatePresetTableToolsProps = {
  filters: TaskTemplatePresetFilters;
  onFiltersChange: (patch: Partial<TaskTemplatePresetFilters>) => void;
};

export function TaskTemplatePresetTableTools({
  filters,
  onFiltersChange,
}: TaskTemplatePresetTableToolsProps) {
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
      <CreateTaskTemplatePresetDialog />
    </div>
  );
}
