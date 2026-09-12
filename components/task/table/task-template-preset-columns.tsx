"use client";

import { Bell, ListChecks, Repeat } from "lucide-react";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";

import type { TaskTemplatePreset } from "@/features/task/types";
import { REPEAT_UNIT_LABELS } from "@/components/task/task-form-constants";
import { TaskTemplatePresetRowActions } from "@/components/task/task-template-preset-row-actions";

function RepeatSummary({ preset }: { preset: TaskTemplatePreset }) {
  if (!preset.isRepeating || !preset.repeatUnit) {
    return <span className="text-muted-foreground">One-time</span>;
  }

  const interval = preset.repeatInterval ?? 1;
  const unitLabel = REPEAT_UNIT_LABELS[preset.repeatUnit];

  return (
    <span className="flex items-center gap-1.5 text-foreground">
      <Repeat className="size-3.5 shrink-0 text-muted-foreground" />
      Every {interval} {unitLabel}
    </span>
  );
}

const columnHelper = createColumnHelper<TaskTemplatePreset>();

// Company-facing columns -- unlike task-template-columns, there's no
// Status/Created column since tenants only ever see active presets.
export function getTaskTemplatePresetColumns(): ColumnDef<
  TaskTemplatePreset,
  unknown
>[] {
  const columns = [
    columnHelper.accessor("name", {
      header: "Name",
      cell: ({ row }) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-medium text-foreground">
            {row.original.name}
          </span>
          <span className="max-w-64 truncate text-xs text-muted-foreground">
            {row.original.title}
          </span>
        </div>
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
    columnHelper.accessor("checklist", {
      header: "Checklist",
      cell: ({ getValue }) => (
        <span className="flex items-center gap-1.5 text-foreground">
          <ListChecks className="size-3.5 shrink-0 text-muted-foreground" />
          {getValue().length}
        </span>
      ),
    }),
    columnHelper.accessor("reminders", {
      header: "Reminders",
      cell: ({ getValue }) => (
        <span className="flex items-center gap-1.5 text-foreground">
          <Bell className="size-3.5 shrink-0 text-muted-foreground" />
          {getValue().length}
        </span>
      ),
    }),
    columnHelper.display({
      id: "repeats",
      header: "Repeats",
      cell: ({ row }) => <RepeatSummary preset={row.original} />,
    }),
    columnHelper.display({
      id: "actions",
      header: "",
      cell: ({ row }) => <TaskTemplatePresetRowActions preset={row.original} />,
    }),
  ];

  return columns as ColumnDef<TaskTemplatePreset, unknown>[];
}
