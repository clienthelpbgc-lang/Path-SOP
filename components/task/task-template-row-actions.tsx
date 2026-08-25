"use client";

import { useState } from "react";
import { ListPlus, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import type { TaskTemplate } from "@/features/task/types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CreateTaskDialog } from "@/components/task/create-task-dialog";
import { DeleteTaskTemplateDialog } from "@/components/task/delete-task-template-dialog";
import { EditTaskTemplateDialog } from "@/components/task/edit-task-template-dialog";

type DialogKind = "create-task" | "edit" | "delete" | null;

type TaskTemplateRowActionsProps = {
  template: TaskTemplate;
};

export function TaskTemplateRowActions({
  template,
}: TaskTemplateRowActionsProps) {
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
            <DropdownMenuItem onClick={() => setOpenDialog("create-task")}>
              <ListPlus />
              Create task
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => setOpenDialog("edit")}>
            <Pencil />
            Edit
          </DropdownMenuItem>
          {template.isActive && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => setOpenDialog("delete")}
              >
                <Trash2 />
                Delete
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <CreateTaskDialog
        key={openDialog === "create-task" ? template.id : "create-task-dialog"}
        template={openDialog === "create-task" ? template : null}
        open={openDialog === "create-task"}
        onOpenChange={(open) => !open && setOpenDialog(null)}
      />
      <EditTaskTemplateDialog
        key={openDialog === "edit" ? template.id : "edit-template-dialog"}
        template={openDialog === "edit" ? template : null}
        onOpenChange={(open) => !open && setOpenDialog(null)}
      />
      <DeleteTaskTemplateDialog
        template={openDialog === "delete" ? template : null}
        onOpenChange={(open) => !open && setOpenDialog(null)}
      />
    </div>
  );
}
