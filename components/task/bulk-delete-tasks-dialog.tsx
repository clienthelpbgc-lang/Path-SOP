"use client";

import { Loader2 } from "lucide-react";

import { useBulkDeleteTasks } from "@/features/task/hooks";
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

// Long selections are summarized rather than listed in full.
const MAX_LISTED_TITLES = 5;

type BulkDeleteTasksDialogProps = {
  // Non-empty to open the dialog, matching BulkCompleteTasksDialog.
  tasks: Task[] | null;
  onOpenChange: (open: boolean) => void;
  // Fired only once the mutation succeeds, so the caller clears its row
  // selection on a real delete but not on a plain Cancel.
  onDeleted?: () => void;
};

export function BulkDeleteTasksDialog({
  tasks,
  onOpenChange,
  onDeleted,
}: BulkDeleteTasksDialogProps) {
  const { mutate, isPending } = useBulkDeleteTasks();
  const count = tasks?.length ?? 0;
  const listedTasks = tasks?.slice(0, MAX_LISTED_TITLES) ?? [];
  const hiddenCount = count - listedTasks.length;

  function handleOpenChange(open: boolean) {
    // Closing mid-request would leave the user unsure what got deleted.
    if (isPending) return;
    onOpenChange(open);
  }

  function handleDelete() {
    if (!tasks || tasks.length === 0) return;

    mutate(
      tasks.map((task) => task.id),
      {
        onSuccess: () => {
          onOpenChange(false);
          onDeleted?.();
        },
      },
    );
  }

  return (
    <Dialog open={count > 0} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Delete {count} task{count === 1 ? "" : "s"}
          </DialogTitle>
          <DialogDescription>
            This will permanently delete{" "}
            {count === 1 ? "this task" : `these ${count} tasks`}, along with
            their checklists, reminders and attachments. This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>

        <ul className="flex flex-col gap-1 rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm">
          {listedTasks.map((task) => (
            <li key={task.id} className="truncate text-foreground">
              {task.title}
            </li>
          ))}
          {hiddenCount > 0 && (
            <li className="text-muted-foreground">and {hiddenCount} more</li>
          )}
        </ul>

        <DialogFooter className="mt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
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
              `Delete ${count} task${count === 1 ? "" : "s"}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
