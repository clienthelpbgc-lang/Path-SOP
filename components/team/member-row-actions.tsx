"use client";

import { useState } from "react";
import { MoreHorizontal, ShieldCheck, ShieldOff, Trash2 } from "lucide-react";

import type { UserRole } from "@/features/user/constants/role.constant";
import type { User } from "@/features/user/types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChangeRoleDialog } from "@/components/team/change-role-dialog";
import { DeleteMemberDialog } from "@/components/team/delete-member-dialog";

type MemberRowActionsProps = {
  member: User;
};

export function MemberRowActions({ member }: MemberRowActionsProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [changeRoleOpen, setChangeRoleOpen] = useState(false);

  const nextRole: UserRole = member.role === "ADMIN" ? "USER" : "ADMIN";

  return (
    <div onClick={(event) => event.stopPropagation()}>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button variant="ghost" size="icon-sm" />}
          aria-label="Member actions"
        >
          <MoreHorizontal />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-auto min-w-48">
          <DropdownMenuItem onClick={() => setChangeRoleOpen(true)}>
            {nextRole === "ADMIN" ? <ShieldCheck /> : <ShieldOff />}
            {nextRole === "ADMIN" ? "Make admin" : "Make user"}
          </DropdownMenuItem>
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

      <ChangeRoleDialog
        member={changeRoleOpen ? member : null}
        nextRole={nextRole}
        onOpenChange={setChangeRoleOpen}
      />
      <DeleteMemberDialog
        member={deleteOpen ? member : null}
        onOpenChange={setDeleteOpen}
      />
    </div>
  );
}
