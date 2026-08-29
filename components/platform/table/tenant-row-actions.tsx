"use client";

import { useState } from "react";
import { MoreHorizontal, Power, PowerOff, Trash2 } from "lucide-react";

import type { Company } from "@/features/company/types";
import { useUpdateCompany } from "@/features/company/hooks";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeleteTenantDialog } from "@/components/platform/delete-tenant-dialog";

type TenantRowActionsProps = {
  tenant: Company;
};

export function TenantRowActions({ tenant }: TenantRowActionsProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { mutate: update, isPending } = useUpdateCompany();

  return (
    <div onClick={(event) => event.stopPropagation()}>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button variant="ghost" size="icon-sm" disabled={isPending} />}
          aria-label="Tenant actions"
        >
          <MoreHorizontal />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-auto min-w-48">
          {tenant.isActive ? (
            <DropdownMenuItem
              onClick={() =>
                update({ id: tenant.id, input: { isActive: false } })
              }
            >
              <PowerOff />
              Deactivate
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              onClick={() =>
                update({ id: tenant.id, input: { isActive: true } })
              }
            >
              <Power />
              Reactivate
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteTenantDialog
        tenant={deleteOpen ? tenant : null}
        onOpenChange={setDeleteOpen}
      />
    </div>
  );
}
