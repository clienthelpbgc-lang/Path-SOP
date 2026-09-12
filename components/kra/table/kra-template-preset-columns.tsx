"use client";

import { Repeat } from "lucide-react";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";

import type { KraTemplatePreset } from "@/features/kra/types";
import { KRA_TYPE_LABELS } from "@/components/kra/kra-form-constants";
import { KraTemplatePresetRowActions } from "@/components/kra/kra-template-preset-row-actions";

const columnHelper = createColumnHelper<KraTemplatePreset>();

// Company-facing columns -- unlike kra-template-columns, there's no
// Status/Created column since tenants only ever see active presets.
export function getKraTemplatePresetColumns(): ColumnDef<
  KraTemplatePreset,
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
    columnHelper.accessor("type", {
      header: "Type",
      cell: ({ getValue }) => (
        <span className="text-foreground">{KRA_TYPE_LABELS[getValue()]}</span>
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
    columnHelper.accessor("repeat", {
      header: "Repeats",
      cell: ({ getValue }) =>
        getValue() ? (
          <span className="flex items-center gap-1.5 text-foreground">
            <Repeat className="size-3.5 shrink-0 text-muted-foreground" />
            Every period
          </span>
        ) : (
          <span className="text-muted-foreground">One-time</span>
        ),
    }),
    columnHelper.display({
      id: "actions",
      header: "",
      cell: ({ row }) => <KraTemplatePresetRowActions preset={row.original} />,
    }),
  ];

  return columns as ColumnDef<KraTemplatePreset, unknown>[];
}
