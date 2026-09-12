"use client";

import { useState } from "react";
import { LayoutTemplate } from "lucide-react";

import { useTaskTemplatePresets } from "@/features/task/hooks";
import type { TaskTemplatePreset } from "@/features/task/types";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { PagePlaceholder } from "@/components/layout/page-placeholder";
import {
  EMPTY_TASK_TEMPLATE_PRESET_FILTERS,
  hasActiveTaskTemplatePresetFilters,
  TaskTemplatePresetTableTools,
  type TaskTemplatePresetFilters,
} from "@/components/platform/table/task-template-preset-table-tools";
import { getTaskTemplatePresetColumns } from "@/components/platform/table/task-template-preset-columns";
import { TaskTemplatePresetPagination } from "@/components/platform/table/task-template-preset-pagination";
import { TaskTemplatePresetTable } from "@/components/platform/table/task-template-preset-table";

const PAGE_SIZE = 20;

export function TaskTemplatePresetList() {
  const [filters, setFilters] = useState<TaskTemplatePresetFilters>(
    EMPTY_TASK_TEMPLATE_PRESET_FILTERS,
  );
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(filters.search, 300);

  function handleFiltersChange(patch: Partial<TaskTemplatePresetFilters>) {
    setFilters((prev) => ({ ...prev, ...patch }));
    setPage(1);
  }

  const { data, isLoading } = useTaskTemplatePresets({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
  });
  const presets: TaskTemplatePreset[] = data?.data ?? [];

  const columns = getTaskTemplatePresetColumns();

  return (
    <div className="flex flex-col gap-4">
      <TaskTemplatePresetTableTools
        filters={filters}
        onFiltersChange={handleFiltersChange}
      />

      {!isLoading && presets.length === 0 ? (
        <PagePlaceholder
          icon={LayoutTemplate}
          title="No task presets found"
          description={
            hasActiveTaskTemplatePresetFilters(filters)
              ? "Try a different search term."
              : "Create a preset to make it available to every company."
          }
        />
      ) : (
        <>
          <TaskTemplatePresetTable
            columns={columns}
            data={presets}
            isLoading={isLoading}
          />
          {data && (
            <TaskTemplatePresetPagination
              pagination={data.pagination}
              onPageChange={setPage}
            />
          )}
        </>
      )}
    </div>
  );
}
