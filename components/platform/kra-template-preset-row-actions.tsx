"use client";

import { useState } from "react";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import type { KraTemplatePreset } from "@/features/kra/types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeleteKraTemplatePresetDialog } from "@/components/platform/delete-kra-template-preset-dialog";
import { EditKraTemplatePresetDialog } from "@/components/platform/edit-kra-template-preset-dialog";
import { HardDeleteKraTemplatePresetDialog } from "@/components/platform/hard-delete-kra-template-preset-dialog";

type DialogKind = "edit" | "delete" | "hard-delete" | null;

type KraTemplatePresetRowActionsProps = {
  preset: KraTemplatePreset;
};

// No "Assign KRA" item here -- platform admins don't have company KRAs to
// assign, only manage the preset itself (compare KraTemplateRowActions).
export function KraTemplatePresetRowActions({
  preset,
}: KraTemplatePresetRowActionsProps) {
  const [openDialog, setOpenDialog] = useState<DialogKind>(null);

  return (
    <div onClick={(event) => event.stopPropagation()}>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button variant="ghost" size="icon-sm" />}
          aria-label="Preset actions"
        >
          <MoreHorizontal />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-auto min-w-44">
          <DropdownMenuItem onClick={() => setOpenDialog("edit")}>
            <Pencil />
            Edit
          </DropdownMenuItem>
          {preset.isActive && (
            <DropdownMenuItem
              variant="destructive"
              onClick={() => setOpenDialog("delete")}
            >
              <Trash2 />
              Deactivate
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

      <EditKraTemplatePresetDialog
        key={openDialog === "edit" ? preset.id : "edit-kra-preset-dialog"}
        preset={openDialog === "edit" ? preset : null}
        onOpenChange={(open) => !open && setOpenDialog(null)}
      />
      <DeleteKraTemplatePresetDialog
        preset={openDialog === "delete" ? preset : null}
        onOpenChange={(open) => !open && setOpenDialog(null)}
      />
      <HardDeleteKraTemplatePresetDialog
        preset={openDialog === "hard-delete" ? preset : null}
        onOpenChange={(open) => !open && setOpenDialog(null)}
      />
    </div>
  );
}
