"use client";

import { Loader2 } from "lucide-react";

import { useDeleteTask } from "@/features/task/hooks";
import type { Task } from "@/features/task/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type DeleteTaskDialogProps = {
  task: Task | null;
  onOpenChange: (open: boolean) => void;
};

export function DeleteTaskDialog({ task, onOpenChange }: DeleteTaskDialogProps) {
  const { mutate, isPending } = useDeleteTask();

  function handleDelete() {
    if (!task) return;

    mutate(task.id, { onSuccess: () => onOpenChange(false) });
  }

  return (
    <Dialog open={task !== null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete task</DialogTitle>
          <DialogDescription>
            This will permanently delete &quot;{task?.title}&quot;. This
            action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete task"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
