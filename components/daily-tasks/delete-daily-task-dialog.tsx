"use client";

import { Loader2, Trash2 } from "lucide-react";

import { useDeleteDailyTask } from "@/features/daily-task/hooks";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function DeleteDailyTaskDialog({
  taskId,
  taskTitle,
}: {
  taskId: string;
  taskTitle: string;
}) {
  const { mutate, isPending } = useDeleteDailyTask();

  return (
    <Dialog>
      <DialogTrigger
        render={<Button variant="ghost" size="icon-sm" />}
      >
        <Trash2 />
        <span className="sr-only">Delete task</span>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete this task?</DialogTitle>
          <DialogDescription className="truncate">
            &quot;{taskTitle}&quot; will be permanently deleted. This can&apos;t
            be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-2">
          <DialogClose render={<Button type="button" variant="outline" />}>
            Cancel
          </DialogClose>
          <Button
            type="button"
            variant="destructive"
            onClick={() => mutate(taskId)}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
