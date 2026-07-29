"use client";

import { useState } from "react";
import { ListChecks } from "lucide-react";

import { useDailyTasks } from "@/features/daily-task/hooks";
import type { DailyTask, ListDailyTasksQueryInput } from "@/features/daily-task/types";
import {
  TASK_PRIORITIES,
  TASK_PRIORITY_LABELS,
  type TaskPriority,
} from "@/features/daily-task/constants/priority.constant";
import {
  TASK_STATUSES,
  TASK_STATUS_LABELS,
  type TaskStatus,
} from "@/features/daily-task/constants/status.constant";
import { formatAssignedAt, getTodayRange } from "@/features/daily-task/utils";
import { cn } from "@/lib/utils";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PagePlaceholder } from "@/components/layout/page-placeholder";
import { PriorityBadge, StatusBadge } from "@/components/daily-tasks/daily-task-badges";
import { DailyTaskRowActions } from "@/components/daily-tasks/daily-task-row-actions";
import { DailyTasksBulkToolbar } from "@/components/daily-tasks/daily-tasks-bulk-toolbar";
import { DailyTaskDetailsSheet } from "@/components/daily-tasks/daily-task-details-sheet";

type DateScope = "today" | "all";

const SELECTABLE_STATUSES: TaskStatus[] = ["PENDING", "IN_PROGRESS"];

function isSelectable(task: DailyTask) {
  return SELECTABLE_STATUSES.includes(task.status);
}

export function DailyTasksTable({ currentUserId }: { currentUserId: string }) {
  const [status, setStatus] = useState<TaskStatus | "ALL">("ALL");
  const [priority, setPriority] = useState<TaskPriority | "ALL">("ALL");
  const [dateScope, setDateScope] = useState<DateScope>("today");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [detailsTaskId, setDetailsTaskId] = useState<string | null>(null);

  function updateFilter<T>(setter: (value: T) => void, value: T) {
    setSelectedIds(new Set());
    setter(value);
  }

  const query: ListDailyTasksQueryInput = {
    assignedTo: currentUserId,
    limit: 50,
    ...(status !== "ALL" ? { status } : {}),
    ...(priority !== "ALL" ? { priority } : {}),
    ...(dateScope === "today"
      ? (() => {
          const { from, to } = getTodayRange();
          return { dueDateFrom: from, dueDateTo: to };
        })()
      : {}),
  };

  const { data, isLoading } = useDailyTasks(query);
  const tasks = data?.data ?? [];
  const selectableTasks = tasks.filter(isSelectable);
  const selectedTasks = tasks.filter((task) => selectedIds.has(task.id));

  const allSelected =
    selectableTasks.length > 0 &&
    selectableTasks.every((task) => selectedIds.has(task.id));
  const someSelected = selectedIds.size > 0 && !allSelected;

  function toggleAll(checked: boolean) {
    setSelectedIds(
      checked ? new Set(selectableTasks.map((task) => task.id)) : new Set(),
    );
  }

  function toggleOne(taskId: string, checked: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(taskId);
      } else {
        next.delete(taskId);
      }
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center rounded-lg border border-input p-0.5">
          {(["today", "all"] as const).map((scope) => (
            <Button
              key={scope}
              type="button"
              size="sm"
              variant={dateScope === scope ? "default" : "ghost"}
              className="h-7"
              onClick={() => updateFilter(setDateScope, scope)}
            >
              {scope === "today" ? "Today" : "All time"}
            </Button>
          ))}
        </div>

        <Select
          value={status}
          onValueChange={(value) =>
            updateFilter(setStatus, value as TaskStatus | "ALL")
          }
        >
          <SelectTrigger className="h-7 w-40">
            <SelectValue placeholder="Status">
              {(value: TaskStatus | "ALL") =>
                value === "ALL" ? "All statuses" : TASK_STATUS_LABELS[value]
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All statuses</SelectItem>
            {TASK_STATUSES.map((value) => (
              <SelectItem key={value} value={value}>
                {TASK_STATUS_LABELS[value]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={String(priority)}
          onValueChange={(value) =>
            updateFilter(
              setPriority,
              value === "ALL" ? "ALL" : (Number(value) as TaskPriority),
            )
          }
        >
          <SelectTrigger className="h-7 w-36">
            <SelectValue placeholder="Priority">
              {(value: string) =>
                value === "ALL"
                  ? "All priorities"
                  : TASK_PRIORITY_LABELS[Number(value) as TaskPriority]
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All priorities</SelectItem>
            {TASK_PRIORITIES.map((value) => (
              <SelectItem key={value} value={String(value)}>
                {TASK_PRIORITY_LABELS[value]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedIds.size > 0 && (
        <DailyTasksBulkToolbar
          selectedTasks={selectedTasks}
          onClearSelection={() => setSelectedIds(new Set())}
        />
      )}

      {!isLoading && tasks.length === 0 ? (
        <PagePlaceholder
          icon={ListChecks}
          title={
            dateScope === "today"
              ? "No tasks due today"
              : "No tasks match these filters"
          }
          description="Tasks assigned to you will show up here once they're created."
        />
      ) : (
        <div className="rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-10">
                  <Checkbox
                    checked={allSelected}
                    indeterminate={someSelected}
                    onCheckedChange={(checked) => toggleAll(checked === true)}
                    disabled={selectableTasks.length === 0}
                    aria-label="Select all tasks"
                  />
                </TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned at</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? Array.from({ length: 4 }).map((_, index) => (
                    <TableRow key={index} className="hover:bg-transparent">
                      <TableCell colSpan={6}>
                        <div className="h-5 w-full animate-pulse rounded bg-muted" />
                      </TableCell>
                    </TableRow>
                  ))
                : tasks.map((task) => (
                    <TableRow
                      key={task.id}
                      className="cursor-pointer"
                      onClick={() => setDetailsTaskId(task.id)}
                    >
                      <TableCell onClick={(event) => event.stopPropagation()}>
                        <Checkbox
                          checked={selectedIds.has(task.id)}
                          onCheckedChange={(checked) =>
                            toggleOne(task.id, checked === true)
                          }
                          disabled={!isSelectable(task)}
                          aria-label={`Select ${task.title}`}
                        />
                      </TableCell>
                      <TableCell
                        className={cn(
                          "max-w-xs truncate font-medium text-foreground",
                          (task.status === "COMPLETED" ||
                            task.status === "REJECTED" ||
                            task.status === "MISSED") &&
                            "text-muted-foreground line-through decoration-muted-foreground/50",
                        )}
                      >
                        {task.title}
                      </TableCell>
                      <TableCell>
                        <PriorityBadge priority={task.priority as TaskPriority} />
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={task.status} />
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatAssignedAt(task.createdAt)}
                      </TableCell>
                      <TableCell
                        className="text-right"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <DailyTaskRowActions
                          task={task}
                          currentUserId={currentUserId}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </div>
      )}

      <DailyTaskDetailsSheet
        taskId={detailsTaskId}
        onOpenChange={(open) => {
          if (!open) {
            setDetailsTaskId(null);
          }
        }}
      />
    </div>
  );
}
