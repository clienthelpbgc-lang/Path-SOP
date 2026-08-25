"use client";

import { useState } from "react";
import { LayoutTemplate } from "lucide-react";

import { useTaskTemplates } from "@/features/task/hooks";
import type { TaskTemplate } from "@/features/task/types";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { PagePlaceholder } from "@/components/layout/page-placeholder";
import {
  EMPTY_TASK_TEMPLATE_FILTERS,
  hasActiveTaskTemplateFilters,
  TaskTemplateTableTools,
  type TaskTemplateFilters,
} from "@/components/task/table/task-template-table-tools";
import { getTaskTemplateColumns } from "@/components/task/table/task-template-columns";
import { TaskTemplatePagination } from "@/components/task/table/task-template-pagination";
import { TaskTemplateTable } from "@/components/task/table/task-template-table";

const PAGE_SIZE = 20;

export function TaskTemplateList() {
  const [filters, setFilters] = useState<TaskTemplateFilters>(
    EMPTY_TASK_TEMPLATE_FILTERS,
  );
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(filters.search, 300);

  function handleFiltersChange(patch: Partial<TaskTemplateFilters>) {
    setFilters((prev) => ({ ...prev, ...patch }));
    setPage(1);
  }

  const { data, isLoading } = useTaskTemplates({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
  });
  const templates: TaskTemplate[] = data?.data ?? [];

  const columns = getTaskTemplateColumns();

  return (
    <div className="flex flex-col gap-4">
      <TaskTemplateTableTools
        filters={filters}
        onFiltersChange={handleFiltersChange}
      />

      {!isLoading && templates.length === 0 ? (
        <PagePlaceholder
          icon={LayoutTemplate}
          title="No task templates found"
          description={
            hasActiveTaskTemplateFilters(filters)
              ? "Try a different search term."
              : "Save a task as a template to see it here."
          }
        />
      ) : (
        <>
          <TaskTemplateTable
            columns={columns}
            data={templates}
            isLoading={isLoading}
          />
          {data && (
            <TaskTemplatePagination
              pagination={data.pagination}
              onPageChange={setPage}
            />
          )}
        </>
      )}
    </div>
  );
}
