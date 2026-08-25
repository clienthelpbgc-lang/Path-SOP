"use client";

import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import Link from "next/link";

import type { UserRole } from "@/features/user/constants/role.constant";
import type { User } from "@/features/user/types";
import { MemberRowActions } from "@/components/team/member-row-actions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const ROLE_BADGE_CLASSES: Record<UserRole, string> = {
  ADMIN:
    "bg-amber-500/10 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
  USER: "bg-accent text-accent-foreground",
};

const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: "Admin",
  USER: "User",
};

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

const columnHelper = createColumnHelper<User>();

type GetTeamMemberColumnsOptions = {
  // Row actions (change role/delete) are admin-only.
  canManage: boolean;
};

export function getTeamMemberColumns({
  canManage,
}: GetTeamMemberColumnsOptions): ColumnDef<User, unknown>[] {
  const columns = [
    columnHelper.accessor("name", {
      header: "Name",
      cell: ({ row }) => {
        const nameContent = (
          <div className="flex items-center gap-2.5">
            <Avatar size="sm">
              <AvatarFallback>{initials(row.original.name)}</AvatarFallback>
            </Avatar>
            <span className="font-medium text-foreground">
              {row.original.name}
            </span>
          </div>
        );

        // Admins can drill into a member's task/KRA status; regular members
        // just see the list.
        return canManage ? (
          <Link
            href={`/admin-dashboard/${row.original.id}`}
            className="hover:underline"
          >
            {nameContent}
          </Link>
        ) : (
          nameContent
        );
      },
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
    columnHelper.accessor("role", {
      header: "Role",
      cell: ({ getValue }) => {
        const role = getValue() as UserRole;

        return (
          <Badge
            variant="outline"
            className={cn("border-transparent", ROLE_BADGE_CLASSES[role])}
          >
            {ROLE_LABELS[role]}
          </Badge>
        );
      },
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
    canManage &&
      columnHelper.display({
        id: "actions",
        header: "",
        cell: ({ row }) => <MemberRowActions member={row.original} />,
      }),
  ];

  return columns.filter(
    (column): column is ColumnDef<User, unknown> => column !== false,
  );
}
