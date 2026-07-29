"use client";

import { useState } from "react";
import { Loader2, X } from "lucide-react";

import { useBulkUpdateDailyTasks } from "@/features/daily-task/hooks";
import type { DailyTask } from "@/features/daily-task/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function DailyTasksBulkToolbar({
  selectedTasks,
  onClearSelection,
}: {
  selectedTasks: DailyTask[];
  onClearSelection: () => void;
}) {
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [remark, setRemark] = useState("");
  const { mutate, isPending } = useBulkUpdateDailyTasks();

  const count = selectedTasks.length;
  const statuses = new Set(selectedTasks.map((task) => task.status));
  const singleStatus = statuses.size === 1 ? [...statuses][0] : null;

  function onSubmitDialogChange(open: boolean) {
    setSubmitDialogOpen(open);
    if (!open) {
      setRemark("");
    }
  }

  function startAll() {
    mutate(
      { ids: selectedTasks.map((task) => task.id), status: "IN_PROGRESS" },
      { onSuccess: onClearSelection },
    );
  }

  function submitAll() {
    mutate(
      {
        ids: selectedTasks.map((task) => task.id),
        status: "SUBMITTED",
        userRemark: remark.trim() ? remark.trim() : undefined,
      },
      {
        onSuccess: () => {
          onClearSelection();
          onSubmitDialogChange(false);
        },
      },
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/50 px-3 py-2">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={onClearSelection}
        disabled={isPending}
      >
        <X />
        <span className="sr-only">Clear selection</span>
      </Button>

      <span className="text-sm font-medium text-foreground">
        {count} task{count === 1 ? "" : "s"} selected
      </span>

      <div className="ml-auto flex items-center gap-2">
        {singleStatus === "PENDING" && (
          <Button size="sm" onClick={startAll} disabled={isPending}>
            {isPending && <Loader2 className="animate-spin" />}
            Start all ({count})
          </Button>
        )}

        {singleStatus === "IN_PROGRESS" && (
          <Dialog open={submitDialogOpen} onOpenChange={onSubmitDialogChange}>
            <DialogTrigger render={<Button size="sm" />}>
              Submit all ({count})
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  Submit {count} task{count === 1 ? "" : "s"} for review
                </DialogTitle>
                <DialogDescription>
                  These tasks will be marked as submitted.
                </DialogDescription>
              </DialogHeader>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="bulkRemark">
                  Remark{" "}
                  <span className="font-normal text-muted-foreground">
                    (optional, applied to all)
                  </span>
                </Label>
                <Textarea
                  id="bulkRemark"
                  rows={3}
                  placeholder="Add a note for the reviewer"
                  value={remark}
                  onChange={(event) => setRemark(event.target.value)}
                />
              </div>

              <DialogFooter className="mt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onSubmitDialogChange(false)}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={submitAll}
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    `Submit all (${count})`
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {singleStatus !== "PENDING" && singleStatus !== "IN_PROGRESS" && (
          <span className="text-xs text-muted-foreground">
            Select tasks with the same status to perform a bulk action.
          </span>
        )}
      </div>
    </div>
  );
}
