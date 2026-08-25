"use client";

import { useState } from "react";
import { ListChecks } from "lucide-react";

import { useTasks } from "@/features/task/hooks";
import type { Task } from "@/features/task/types";
import { useUsers } from "@/features/user/hooks";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { PagePlaceholder } from "@/components/layout/page-placeholder";
import {
  EMPTY_TASK_FILTERS,
  hasActiveTaskFilters,
  TaskTableTools,
  type TaskFilters,
} from "@/components/task/table/task-table-tools";
import { getTaskColumns } from "@/components/task/table/task-columns";
import { TaskPagination } from "@/components/task/table/task-pagination";
import { TaskTable } from "@/components/task/table/task-table";
import { TaskDetailsSheet } from "@/components/task/task-details-sheet";

const PAGE_SIZE = 20;

type TaskListProps = {
  currentUserId: string;
  // "mine" (default) scopes the list to tasks assigned to the current user,
  // matching the regular Tasks page. "all" is for the admin-only overview:
  // every task in the company, filterable down to one assignee at a time.
  scope?: "mine" | "all";
};

export function TaskList({ currentUserId, scope = "mine" }: TaskListProps) {
  const [filters, setFilters] = useState<TaskFilters>(EMPTY_TASK_FILTERS);
  const [page, setPage] = useState(1);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const debouncedSearch = useDebouncedValue(filters.search, 300);

  function handleFiltersChange(patch: Partial<TaskFilters>) {
    setFilters((prev) => ({ ...prev, ...patch }));
    setPage(1);
  }

  const { data, isLoading } = useTasks({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
    assignedTo: scope === "mine" ? currentUserId : filters.assignedTo,
    status:
      filters.statusTab === "all" || filters.statusTab === "overdue"
        ? undefined
        : filters.statusTab,
    // Pending/In progress tabs exclude overdue tasks so every task lives
    // under exactly one tab, matching the status badge shown per row.
    overdue:
      filters.statusTab === "overdue"
        ? "true"
        : filters.statusTab === "pending" || filters.statusTab === "in_progress"
          ? "false"
          : undefined,
    dueDateFrom: filters.dateRange.from,
    dueDateTo: filters.dateRange.to,
  });
  const tasks: Task[] = data?.data ?? [];

  const usersQuery = useUsers({ limit: 100 });
  const userNames = new Map(
    (usersQuery.data?.data ?? []).map((user) => [user.id, user.name]),
  );

  const showAssigneeColumn = scope === "all";

  const columns = getTaskColumns({
    userNames,
    showAssigneeColumn,
    currentUserId,
  });

  return (
    <div className="flex flex-col gap-4">
      <TaskTableTools
        filters={filters}
        onFiltersChange={handleFiltersChange}
        showAssigneeFilter={scope === "all"}
      />

      {!isLoading && tasks.length === 0 ? (
        <PagePlaceholder
          icon={ListChecks}
          title="No tasks found"
          description={
            hasActiveTaskFilters(filters)
              ? "Try a different search term or filter."
              : scope === "all"
                ? "Tasks created across your company will show up here."
                : "Tasks assigned to you will show up here."
          }
        />
      ) : (
        <>
          <TaskTable
            columns={columns}
            data={tasks}
            isLoading={isLoading}
            onRowClick={(task) => setSelectedTaskId(task.id)}
          />
          {data && (
            <TaskPagination pagination={data.pagination} onPageChange={setPage} />
          )}
        </>
      )}

      <TaskDetailsSheet
        taskId={selectedTaskId}
        onOpenChange={(open) => {
          if (!open) setSelectedTaskId(null);
        }}
      />
    </div>
  );
}
