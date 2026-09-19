"use client";

import { Loader2 } from "lucide-react";

import { useBulkCompleteTasks } from "@/features/task/hooks";
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

type BulkCompleteTasksDialogProps = {
  // Non-empty to open the dialog, matching the null-to-close convention used
  // by the single-task complete/delete/stop-repeating dialogs.
  tasks: Task[] | null;
  onOpenChange: (open: boolean) => void;
  // Fired only once the mutation actually succeeds, distinct from
  // onOpenChange(false) which also fires on a plain Cancel -- lets the
  // caller clear its row-selection state only on a real completion.
  onCompleted?: () => void;
};

export function BulkCompleteTasksDialog({
  tasks,
  onOpenChange,
  onCompleted,
}: BulkCompleteTasksDialogProps) {
  const { mutate, isPending } = useBulkCompleteTasks();
  const count = tasks?.length ?? 0;

  function handleComplete() {
    if (!tasks || tasks.length === 0) return;

    mutate(tasks, {
      onSuccess: () => {
        onOpenChange(false);
        onCompleted?.();
      },
    });
  }

  return (
    <Dialog open={count > 0} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Complete {count} task{count === 1 ? "" : "s"}</DialogTitle>
          <DialogDescription>
            Mark {count === 1 ? "this task" : `these ${count} tasks`} as
            completed. This cannot be undone.
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
          <Button type="button" onClick={handleComplete} disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="animate-spin" />
                Completing...
              </>
            ) : (
              "Mark complete"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
