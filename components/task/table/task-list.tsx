"use client";

import { useState } from "react";
import { ListChecks, X } from "lucide-react";
import type { RowSelectionState } from "@tanstack/react-table";

import { useTasks } from "@/features/task/hooks";
import type { Task } from "@/features/task/types";
import { canCompleteTask } from "@/features/task/utils/can-complete-task";
import { useUsers } from "@/features/user/hooks";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { PagePlaceholder } from "@/components/layout/page-placeholder";
import { BulkCompleteTasksDialog } from "@/components/task/bulk-complete-tasks-dialog";
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
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 20;

type TaskSelectionBarProps = {
  count: number;
  onComplete: () => void;
  onClear: () => void;
};

function TaskSelectionBar({ count, onComplete, onClear }: TaskSelectionBarProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-2.5">
      <p className="text-sm font-medium text-foreground">
        {count} task{count === 1 ? "" : "s"} selected
      </p>
      <div className="flex items-center gap-2">
        <Button type="button" size="sm" onClick={onComplete}>
          Mark complete
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Clear selection"
          onClick={onClear}
        >
          <X />
        </Button>
      </div>
    </div>
  );
}

type TaskListProps = {
  currentUserId: string;
  // "mine" (default) scopes the list to tasks assigned to the current user,
  // matching the regular Tasks page. "all" is for the admin-only overview:
  // every task in the company, filterable down to one assignee at a time.
  scope?: "mine" | "all";
  // Admin-only "Repeating Tasks" page: shows only tasks currently repeating,
  // with a "Stop repeating" button per row.
  onlyRepeating?: boolean;
};

export function TaskList({
  currentUserId,
  scope = "mine",
  onlyRepeating = false,
}: TaskListProps) {
  const [filters, setFilters] = useState<TaskFilters>(EMPTY_TASK_FILTERS);
  const [page, setPage] = useState(1);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [bulkCompleteOpen, setBulkCompleteOpen] = useState(false);
  const debouncedSearch = useDebouncedValue(filters.search, 300);

  // Selection is scoped to what's currently on screen -- once the page or
  // filters change, stale row ids in `rowSelection` would silently apply to
  // whatever tasks happen to land on those ids next.
  function handleFiltersChange(patch: Partial<TaskFilters>) {
    setFilters((prev) => ({ ...prev, ...patch }));
    setPage(1);
    setRowSelection({});
  }

  function handlePageChange(nextPage: number) {
    setPage(nextPage);
    setRowSelection({});
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
    isRepeating: onlyRepeating ? "true" : undefined,
  });
  const tasks: Task[] = data?.data ?? [];

  const usersQuery = useUsers({ limit: 100 });
  const userNames = new Map(
    (usersQuery.data?.data ?? []).map((user) => [user.id, user.name]),
  );

  const showAssigneeColumn = scope === "all";
  // Bulk-complete only makes sense where rows carry a real, completable
  // status -- the "Repeating Tasks" view already opts out of that (see
  // showScheduleColumns above).
  const enableSelection = !onlyRepeating;

  const columns = getTaskColumns({
    userNames,
    showAssigneeColumn,
    currentUserId,
    showStopRepeating: onlyRepeating,
    showScheduleColumns: !onlyRepeating,
    enableSelection,
  });

  const selectedTasks = tasks.filter((task) => rowSelection[task.id]);

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
              : onlyRepeating
                ? "Repeating tasks across your company will show up here."
                : scope === "all"
                  ? "Tasks created across your company will show up here."
                  : "Tasks assigned to you will show up here."
          }
        />
      ) : (
        <>
          {selectedTasks.length > 0 && (
            <TaskSelectionBar
              count={selectedTasks.length}
              onComplete={() => setBulkCompleteOpen(true)}
              onClear={() => setRowSelection({})}
            />
          )}

          <TaskTable
            columns={columns}
            data={tasks}
            isLoading={isLoading}
            onRowClick={(task) => setSelectedTaskId(task.id)}
            rowSelection={enableSelection ? rowSelection : undefined}
            onRowSelectionChange={enableSelection ? setRowSelection : undefined}
            isRowSelectable={
              enableSelection
                ? (task) => canCompleteTask(task, currentUserId)
                : undefined
            }
          />
          {data && (
            <TaskPagination
              pagination={data.pagination}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}

      <TaskDetailsSheet
        taskId={selectedTaskId}
        onOpenChange={(open) => {
          if (!open) setSelectedTaskId(null);
        }}
      />

      <BulkCompleteTasksDialog
        tasks={bulkCompleteOpen ? selectedTasks : null}
        onOpenChange={setBulkCompleteOpen}
        onCompleted={() => setRowSelection({})}
      />
    </div>
  );
}
