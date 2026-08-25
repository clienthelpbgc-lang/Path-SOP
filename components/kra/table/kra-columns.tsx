"use client";

import { Repeat } from "lucide-react";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";

import type { Kra } from "@/features/kra/types";
import { KRA_TYPE_LABELS } from "@/components/kra/kra-form-constants";
import { KraRowActions } from "@/components/kra/kra-row-actions";
import { KraStatusBadge } from "@/components/kra/kra-status-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function formatDate(value: string | Date) {
  // Fixed locale, not `undefined`: the server and browser can have
  // different default locales, which would cause a hydration mismatch.
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const columnHelper = createColumnHelper<Kra>();

type GetKraColumnsOptions = {
  userNames: Map<string, string>;
  // Hidden on the regular "My KRAs" view, where the assignee is always the
  // current user -- shown only on the admin's company-wide view.
  showAssigneeColumn: boolean;
  // The actions column only exists on the KRA Admin view -- see KraList.
  // Within it, KraRowActions further restricts edit/delete to rows the
  // current admin is themself assigned to.
  canManage: boolean;
  currentUserId: string;
};

export function getKraColumns({
  userNames,
  showAssigneeColumn,
  canManage,
  currentUserId,
}: GetKraColumnsOptions): ColumnDef<Kra, unknown>[] {
  const columns = [
    columnHelper.accessor("title", {
      header: "Title",
      cell: ({ row }) => (
        <div className="flex flex-col gap-0.5">
          <span className="flex items-center gap-1.5 font-medium text-foreground">
            {row.original.repeat && (
              <Repeat
                className="size-3.5 shrink-0 text-muted-foreground"
                aria-label="Repeats every period"
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
            <span className="text-muted-foreground">Unknown</span>
          );
        },
      }),
    columnHelper.accessor("assignedBy", {
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
    columnHelper.accessor("type", {
      header: "Type",
      cell: ({ getValue }) => (
        <span className="text-foreground">{KRA_TYPE_LABELS[getValue()]}</span>
      ),
    }),
    columnHelper.display({
      id: "period",
      header: "Period",
      cell: ({ row }) => (
        <span className="text-foreground">
          {formatDate(row.original.periodStart)} –{" "}
          {formatDate(row.original.periodEnd)}
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
    columnHelper.accessor("status", {
      header: "Status",
      cell: ({ getValue }) => <KraStatusBadge status={getValue()} />,
    }),
    canManage &&
      columnHelper.display({
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <KraRowActions kra={row.original} currentUserId={currentUserId} />
        ),
      }),
  ];

  return columns.filter(
    (column): column is ColumnDef<Kra, unknown> => column !== false,
  );
}
