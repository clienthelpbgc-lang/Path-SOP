"use client";

import { useState } from "react";
import { Copy, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import type { Kra } from "@/features/kra/types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CreateKraTemplateDialog } from "@/components/kra/create-kra-template-dialog";
import { DeleteKraDialog } from "@/components/kra/delete-kra-dialog";
import { EditKraDialog } from "@/components/kra/edit-kra-dialog";

type DialogKind = "edit" | "delete" | "template" | null;

type KraRowActionsProps = {
  kra: Kra;
  currentUserId: string;
};

// Only ever rendered on the KRA Admin view. Even there, an admin can only
// edit/delete a KRA assigned to themself -- KRAs assigned to other people
// show no actions at all, matching what the server enforces.
export function KraRowActions({ kra, currentUserId }: KraRowActionsProps) {
  const [openDialog, setOpenDialog] = useState<DialogKind>(null);

  if (kra.assignedTo !== currentUserId) {
    return null;
  }

  return (
    <div onClick={(event) => event.stopPropagation()}>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button variant="ghost" size="icon-sm" />}
          aria-label="KRA actions"
        >
          <MoreHorizontal />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-auto min-w-40">
          <DropdownMenuItem onClick={() => setOpenDialog("edit")}>
            <Pencil />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpenDialog("template")}>
            <Copy />
            Create template
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setOpenDialog("delete")}
          >
            <Trash2 />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditKraDialog
        key={openDialog === "edit" ? kra.id : "edit-kra-dialog"}
        kra={openDialog === "edit" ? kra : null}
        onOpenChange={(open) => !open && setOpenDialog(null)}
      />
      <DeleteKraDialog
        kra={openDialog === "delete" ? kra : null}
        onOpenChange={(open) => !open && setOpenDialog(null)}
      />
      <CreateKraTemplateDialog
        kra={openDialog === "template" ? kra : null}
        onOpenChange={(open) => !open && setOpenDialog(null)}
      />
    </div>
  );
}
