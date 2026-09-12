"use client";

import { useState } from "react";
import { ListPlus, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import type { KraTemplate } from "@/features/kra/types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CreateKraDialog } from "@/components/kra/create-kra-dialog";
import { DeleteKraTemplateDialog } from "@/components/kra/delete-kra-template-dialog";
import { EditKraTemplateDialog } from "@/components/kra/edit-kra-template-dialog";
import { HardDeleteKraTemplateDialog } from "@/components/kra/hard-delete-kra-template-dialog";

type DialogKind = "assign-kra" | "edit" | "delete" | "hard-delete" | null;

type KraTemplateRowActionsProps = {
  template: KraTemplate;
};

export function KraTemplateRowActions({
  template,
}: KraTemplateRowActionsProps) {
  const [openDialog, setOpenDialog] = useState<DialogKind>(null);

  return (
    <div onClick={(event) => event.stopPropagation()}>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button variant="ghost" size="icon-sm" />}
          aria-label="Template actions"
        >
          <MoreHorizontal />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-auto min-w-44">
          {template.isActive && (
            <DropdownMenuItem onClick={() => setOpenDialog("assign-kra")}>
              <ListPlus />
              Assign KRA
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => setOpenDialog("edit")}>
            <Pencil />
            Edit
          </DropdownMenuItem>
          {template.isActive && (
            <DropdownMenuItem
              variant="destructive"
              onClick={() => setOpenDialog("delete")}
            >
              <Trash2 />
              Delete
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setOpenDialog("hard-delete")}
          >
            <Trash2 />
            Delete permanently
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CreateKraDialog
        key={openDialog === "assign-kra" ? template.id : "assign-kra-dialog"}
        template={openDialog === "assign-kra" ? template : null}
        open={openDialog === "assign-kra"}
        onOpenChange={(open) => !open && setOpenDialog(null)}
      />
      <EditKraTemplateDialog
        key={openDialog === "edit" ? template.id : "edit-kra-template-dialog"}
        template={openDialog === "edit" ? template : null}
        onOpenChange={(open) => !open && setOpenDialog(null)}
      />
      <DeleteKraTemplateDialog
        template={openDialog === "delete" ? template : null}
        onOpenChange={(open) => !open && setOpenDialog(null)}
      />
      <HardDeleteKraTemplateDialog
        template={openDialog === "hard-delete" ? template : null}
        onOpenChange={(open) => !open && setOpenDialog(null)}
      />
    </div>
  );
}
