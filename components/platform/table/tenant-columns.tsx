"use client";

import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { Building2 } from "lucide-react";

import type { Company } from "@/features/company/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { TenantRowActions } from "@/components/platform/table/tenant-row-actions";
import { cn } from "@/lib/utils";

const columnHelper = createColumnHelper<Company>();

function formatDate(value: string | Date) {
  // Fixed locale, not `undefined`: the server and browser can have different
  // default locales, which would cause a hydration mismatch.
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function getTenantColumns(): ColumnDef<Company, unknown>[] {
  const columns = [
    columnHelper.accessor("name", {
      header: "Tenant",
      cell: ({ row }) => (
        <div className="flex items-center gap-2.5">
          <Avatar size="sm" className="rounded-md after:rounded-md">
            <AvatarImage
              src={row.original.logo ?? undefined}
              alt={row.original.name}
              className="rounded-md object-contain"
            />
            <AvatarFallback className="rounded-md">
              <Building2 className="size-3.5" />
            </AvatarFallback>
          </Avatar>
          <span className="font-medium text-foreground">
            {row.original.name}
          </span>
        </div>
      ),
    }),
    columnHelper.display({
      id: "contact",
      header: "Contact",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="text-foreground">{row.original.email}</span>
          {row.original.phone && (
            <span className="text-xs text-muted-foreground">
              {row.original.phone}
            </span>
          )}
        </div>
      ),
    }),
    columnHelper.accessor("isActive", {
      header: "Status",
      cell: ({ getValue }) => (
        <Badge
          variant="outline"
          className={cn(
            "border-transparent",
            getValue()
              ? "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400"
              : "bg-muted text-muted-foreground",
          )}
        >
          {getValue() ? "Active" : "Inactive"}
        </Badge>
      ),
    }),
    columnHelper.accessor("createdAt", {
      header: "Date added",
      cell: ({ getValue }) => (
        <span className="text-muted-foreground">{formatDate(getValue())}</span>
      ),
    }),
    columnHelper.display({
      id: "actions",
      header: "",
      cell: ({ row }) => <TenantRowActions tenant={row.original} />,
    }),
  ];

  return columns as ColumnDef<Company, unknown>[];
}
