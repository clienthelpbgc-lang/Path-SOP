"use client";

import { Repeat } from "lucide-react";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";

import type { KraTemplate } from "@/features/kra/types";
import { KRA_TYPE_LABELS } from "@/components/kra/kra-form-constants";
import { KraTemplateRowActions } from "@/components/kra/kra-template-row-actions";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function formatDate(value: string) {
  // Fixed locale, not `undefined`: the server and browser can have different
  // default locales, which would cause a hydration mismatch.
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const columnHelper = createColumnHelper<KraTemplate>();

export function getKraTemplateColumns(): ColumnDef<KraTemplate, unknown>[] {
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
    columnHelper.accessor("isActive", {
      header: "Status",
      cell: ({ row }) => (
        <div className="flex flex-col gap-0.5">
          <Badge
            variant="outline"
            className={cn(
              "w-fit border-transparent",
              row.original.isActive
                ? "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400"
                : "bg-muted text-muted-foreground",
            )}
          >
            {row.original.isActive ? "Active" : "Inactive"}
          </Badge>
          <span className="text-xs text-muted-foreground">
            Created {formatDate(row.original.createdAt as unknown as string)}
          </span>
        </div>
      ),
    }),
    columnHelper.display({
      id: "actions",
      header: "",
      cell: ({ row }) => <KraTemplateRowActions template={row.original} />,
    }),
  ];

  return columns as ColumnDef<KraTemplate, unknown>[];
}
