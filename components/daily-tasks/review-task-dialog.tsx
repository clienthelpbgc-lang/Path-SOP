"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { useUpdateDailyTask } from "@/features/daily-task/hooks";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type ReviewAction = "COMPLETED" | "REJECTED";

const ACTION_COPY: Record<
  ReviewAction,
  { title: string; description: string; cta: string; ctaPending: string }
> = {
  COMPLETED: {
    title: "Approve this task",
    description: "Mark this submission as completed.",
    cta: "Approve",
    ctaPending: "Approving...",
  },
  REJECTED: {
    title: "Reject this task",
    description: "Send this task back as rejected.",
    cta: "Reject",
    ctaPending: "Rejecting...",
  },
};

export function ReviewTaskDialog({
  taskId,
  taskTitle,
  action,
  onOpenChange,
}: {
  taskId: string;
  taskTitle: string;
  action: ReviewAction | null;
  onOpenChange: (action: null) => void;
}) {
  const [remark, setRemark] = useState("");
  const { mutate, isPending } = useUpdateDailyTask();

  function handleOpenChange(open: boolean) {
    if (!open) {
      onOpenChange(null);
      setRemark("");
    }
  }

  function handleConfirm() {
    if (!action) return;

    mutate(
      {
        id: taskId,
        data: {
          status: action,
          adminRemark: remark.trim() ? remark.trim() : undefined,
        },
      },
      { onSuccess: () => handleOpenChange(false) },
    );
  }

  const copy = action ? ACTION_COPY[action] : null;

  return (
    <Dialog open={action !== null} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{copy?.title}</DialogTitle>
          <DialogDescription className="truncate">
            {copy?.description} &mdash; {taskTitle}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="reviewRemark">
            Remark{" "}
            <span className="font-normal text-muted-foreground">
              (optional)
            </span>
          </Label>
          <Textarea
            id="reviewRemark"
            rows={3}
            placeholder="Add a note for the assignee"
            value={remark}
            onChange={(event) => setRemark(event.target.value)}
          />
        </div>

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
            variant={action === "REJECTED" ? "destructive" : "default"}
            onClick={handleConfirm}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="animate-spin" />
                {copy?.ctaPending}
              </>
            ) : (
              copy?.cta
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
