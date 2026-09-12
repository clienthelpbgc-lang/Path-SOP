"use client";

import { Loader2 } from "lucide-react";

import { useHardDeleteTaskTemplate } from "@/features/task/hooks";
import type { TaskTemplate } from "@/features/task/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type HardDeleteTaskTemplateDialogProps = {
  template: TaskTemplate | null;
  onOpenChange: (open: boolean) => void;
};

// Unlike DeleteTaskTemplateDialog (deactivate, reversible), this
// permanently removes the row. Safe for existing tasks -- see
// hard-delete-task-template.service.ts -- but the template's own
// checklist/reminders/repeat config is gone for good.
export function HardDeleteTaskTemplateDialog({
  template,
  onOpenChange,
}: HardDeleteTaskTemplateDialogProps) {
  const { mutate, isPending } = useHardDeleteTaskTemplate();

  function handleDelete() {
    if (!template) return;

    mutate(template.id, { onSuccess: () => onOpenChange(false) });
  }

  return (
    <Dialog open={template !== null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete template permanently</DialogTitle>
          <DialogDescription>
            This permanently deletes &quot;{template?.name}&quot;, including
            its checklist and reminders. This cannot be undone. Tasks already
            created from it are unaffected.
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
              "Delete permanently"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
