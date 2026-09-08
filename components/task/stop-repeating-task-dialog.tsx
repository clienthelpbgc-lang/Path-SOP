"use client";

import { Loader2 } from "lucide-react";

import { useStopRepeatingTask } from "@/features/task/hooks";
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

type StopRepeatingTaskDialogProps = {
  task: Task | null;
  onOpenChange: (open: boolean) => void;
};

export function StopRepeatingTaskDialog({
  task,
  onOpenChange,
}: StopRepeatingTaskDialogProps) {
  const { mutate, isPending } = useStopRepeatingTask();

  function handleStopRepeating() {
    if (!task) return;

    mutate(task.id, { onSuccess: () => onOpenChange(false) });
  }

  return (
    <Dialog open={task !== null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Stop repeating task</DialogTitle>
          <DialogDescription>
            &quot;{task?.title}&quot; will no longer generate future
            occurrences. The current occurrence and its history are
            unaffected.
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
            onClick={handleStopRepeating}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="animate-spin" />
                Stopping...
              </>
            ) : (
              "Stop repeating"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
