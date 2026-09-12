"use client";

import { useState } from "react";
import { Copy, ListPlus, MoreHorizontal } from "lucide-react";

import type { TaskTemplatePreset } from "@/features/task/types";
import { taskTemplatePresetToTemplateLike } from "@/features/task/utils/task-template-preset-to-like";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CreateTaskDialog } from "@/components/task/create-task-dialog";
import { DuplicateTaskTemplatePresetDialog } from "@/components/task/duplicate-task-template-preset-dialog";

type DialogKind = "create-task" | "duplicate" | null;

type TaskTemplatePresetRowActionsProps = {
  preset: TaskTemplatePreset;
};

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
        <DropdownMenuContent align="end" className="w-auto min-w-48">
          <DropdownMenuItem onClick={() => setOpenDialog("create-task")}>
            <ListPlus />
            Use preset
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpenDialog("duplicate")}>
            <Copy />
            Duplicate to my templates
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CreateTaskDialog
        key={openDialog === "create-task" ? preset.id : "create-task-dialog"}
        template={
          openDialog === "create-task"
            ? taskTemplatePresetToTemplateLike(preset)
            : null
        }
        open={openDialog === "create-task"}
        onOpenChange={(open) => !open && setOpenDialog(null)}
      />
      <DuplicateTaskTemplatePresetDialog
        preset={openDialog === "duplicate" ? preset : null}
        onOpenChange={(open) => !open && setOpenDialog(null)}
      />
    </div>
  );
}
