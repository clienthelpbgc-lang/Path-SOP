"use client";

import { useState } from "react";
import { Repeat } from "lucide-react";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";

import type { Task } from "@/features/task/types";
import { StopRepeatingTaskDialog } from "@/components/task/stop-repeating-task-dialog";
import { TaskRowActions } from "@/components/task/task-row-actions";
import {
  TaskStatusBadge,
  getEffectiveTaskStatus,
} from "@/components/task/task-status-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function formatDateTime(value: string | Date) {
  // Fixed locale, not `undefined`: the server and browser can have different
  // default locales, which would cause a hydration mismatch.
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function StopRepeatingCell({ task }: { task: Task }) {
  const [dialogOpen, setDialogOpen] = useState(false);

  if (!task.isRepeating) {
    return <span className="text-muted-foreground">—</span>;
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={(event) => {
          event.stopPropagation();
          setDialogOpen(true);
        }}
      >
        Stop repeating
      </Button>
      <StopRepeatingTaskDialog
        task={dialogOpen ? task : null}
        onOpenChange={setDialogOpen}
      />
    </>
  );
}

const columnHelper = createColumnHelper<Task>();

type GetTaskColumnsOptions = {
  userNames: Map<string, string>;
  // Hidden on the regular "My Task" view, where the assignee is always the
  // current user -- shown only on the admin's company-wide view.
  showAssigneeColumn: boolean;
  currentUserId: string;
  // Admin-only "Repeating Tasks" view: adds a dedicated button to stop a
  // series regardless of the underlying task's status, bypassing the
  // pending-only edit lock in TaskRowActions.
  showStopRepeating?: boolean;
  // Hidden on the "Repeating Tasks" view, where every row is the same
  // still-open live occurrence -- schedule/status columns say nothing
  // useful there and just crowd out the stop-repeating action.
  showScheduleColumns?: boolean;
};

export function getTaskColumns({
  userNames,
  showAssigneeColumn,
  currentUserId,
  showStopRepeating = false,
  showScheduleColumns = true,
}: GetTaskColumnsOptions): ColumnDef<Task, unknown>[] {
  const columns = [
    columnHelper.accessor("title", {
      header: "Title",
      cell: ({ row }) => (
        <div className="flex flex-col gap-0.5">
          <span className="flex items-center gap-1.5 font-medium text-foreground">
            {row.original.isRepeating && (
              <Repeat
                className="size-3.5 shrink-0 text-muted-foreground"
                aria-label="Repeating task"
              />
            )}
            {row.original.title}
          </span>
          {row.original.description && (
            <span className="max-w-64 truncate text-xs text-muted-foreground">
              {row.original.description}
            </span>
          )}
        </div>
      ),
    }),
    showAssigneeColumn &&
      columnHelper.accessor("assignedTo", {
        id: "assignedTo",
        header: "Assignee",
        cell: ({ getValue }) => {
          const name = userNames.get(getValue());

          return name ? (
            <div className="flex items-center gap-2.5">
              <Avatar size="sm">
                <AvatarFallback>{initials(name)}</AvatarFallback>
              </Avatar>
              <span className="text-foreground">{name}</span>
            </div>
          ) : (
            <span className="text-muted-foreground">Unassigned</span>
          );
        },
      }),
    columnHelper.accessor("createdBy", {
      id: "assignedBy",
      header: "Assigned by",
      cell: ({ getValue }) => (
        <span className="text-foreground">
          {userNames.get(getValue()) ?? (
            <span className="text-muted-foreground">Unknown</span>
          )}
        </span>
      ),
    }),
    columnHelper.accessor("weightage", {
      header: "Weightage",
      cell: ({ getValue }) => (
        <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1.5 text-xs font-medium text-foreground">
          {getValue()}
        </span>
      ),
    }),
    showScheduleColumns &&
      columnHelper.accessor("startAt", {
        id: "startAt",
        header: "Start date",
        cell: ({ getValue }) => (
          <span className="text-foreground">
            {formatDateTime(getValue() as unknown as string)}
          </span>
        ),
      }),
    showScheduleColumns &&
      columnHelper.accessor("dueAt", {
        id: "dueAt",
        header: "Due date",
        cell: ({ getValue }) => (
          <span className="text-foreground">
            {formatDateTime(getValue() as unknown as string)}
          </span>
        ),
      }),
    showScheduleColumns &&
      columnHelper.display({
        id: "status",
        header: "Status",
        cell: ({ row }) => (
          <TaskStatusBadge status={getEffectiveTaskStatus(row.original)} />
        ),
      }),
    showStopRepeating &&
      columnHelper.display({
        id: "stopRepeating",
        header: "",
        cell: ({ row }) => <StopRepeatingCell task={row.original} />,
      }),
    columnHelper.display({
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <TaskRowActions task={row.original} currentUserId={currentUserId} />
      ),
    }),
  ];

  return columns.filter(
    (column): column is ColumnDef<Task, unknown> => column !== false,
  );
}
