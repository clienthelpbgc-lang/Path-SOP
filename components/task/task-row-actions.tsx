"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Copy,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";

import type { Task } from "@/features/task/types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CompleteTaskDialog } from "@/components/task/complete-task-dialog";
import { CreateTaskTemplateDialog } from "@/components/task/create-task-template-dialog";
import { DeleteTaskDialog } from "@/components/task/delete-task-dialog";
import { EditTaskDialog } from "@/components/task/edit-task-dialog";

type DialogKind = "complete" | "edit" | "delete" | "template" | null;

type TaskRowActionsProps = {
  task: Task;
  currentUserId: string;
};

export function TaskRowActions({ task, currentUserId }: TaskRowActionsProps) {
  const [openDialog, setOpenDialog] = useState<DialogKind>(null);

  const isAssignee = task.assignedTo === currentUserId;
  const isCreator = task.createdBy === currentUserId;
  const isPending = task.status === "pending";

  const canComplete = isAssignee && task.status !== "completed";
  const canEdit = isCreator && isPending;
  const canDelete = isCreator && isPending;
  const canCreateTemplate = isCreator;

  if (!canComplete && !canEdit && !canDelete && !canCreateTemplate) {
    return null;
  }

  return (
    <div onClick={(event) => event.stopPropagation()}>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button variant="ghost" size="icon-sm" />}
          aria-label="Task actions"
        >
          <MoreHorizontal />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-auto min-w-44">
          {canComplete && (
            <DropdownMenuItem onClick={() => setOpenDialog("complete")}>
              <CheckCircle2 />
              Complete task
            </DropdownMenuItem>
          )}
          {canEdit && (
            <DropdownMenuItem onClick={() => setOpenDialog("edit")}>
              <Pencil />
              Edit
            </DropdownMenuItem>
          )}
          {canCreateTemplate && (
            <DropdownMenuItem onClick={() => setOpenDialog("template")}>
              <Copy />
              Create template
            </DropdownMenuItem>
          )}
          {canDelete && (
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

      <CompleteTaskDialog
        task={openDialog === "complete" ? task : null}
        onOpenChange={(open) => !open && setOpenDialog(null)}
      />
      <EditTaskDialog
        key={openDialog === "edit" ? task.id : "edit-task-dialog"}
        task={openDialog === "edit" ? task : null}
        onOpenChange={(open) => !open && setOpenDialog(null)}
      />
      <DeleteTaskDialog
        task={openDialog === "delete" ? task : null}
        onOpenChange={(open) => !open && setOpenDialog(null)}
      />
      <CreateTaskTemplateDialog
        task={openDialog === "template" ? task : null}
        onOpenChange={(open) => !open && setOpenDialog(null)}
      />
    </div>
  );
}
