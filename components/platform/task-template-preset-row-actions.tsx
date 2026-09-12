"use client";

import { useState } from "react";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import type { TaskTemplatePreset } from "@/features/task/types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeleteTaskTemplatePresetDialog } from "@/components/platform/delete-task-template-preset-dialog";
import { EditTaskTemplatePresetDialog } from "@/components/platform/edit-task-template-preset-dialog";
import { HardDeleteTaskTemplatePresetDialog } from "@/components/platform/hard-delete-task-template-preset-dialog";

type DialogKind = "edit" | "delete" | "hard-delete" | null;

type TaskTemplatePresetRowActionsProps = {
  preset: TaskTemplatePreset;
};

// No "Create task" item here -- platform admins don't have company tasks to
// create, only manage the preset itself (compare TaskTemplateRowActions).
export function TaskTemplatePresetRowActions({
  preset,
}: TaskTemplatePresetRowActionsProps) {
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

      <EditTaskTemplatePresetDialog
        key={openDialog === "edit" ? preset.id : "edit-preset-dialog"}
        preset={openDialog === "edit" ? preset : null}
        onOpenChange={(open) => !open && setOpenDialog(null)}
      />
      <DeleteTaskTemplatePresetDialog
        preset={openDialog === "delete" ? preset : null}
        onOpenChange={(open) => !open && setOpenDialog(null)}
      />
      <HardDeleteTaskTemplatePresetDialog
        preset={openDialog === "hard-delete" ? preset : null}
        onOpenChange={(open) => !open && setOpenDialog(null)}
      />
    </div>
  );
}
