"use client";

import { Loader2 } from "lucide-react";

import { useDeleteTaskTemplate } from "@/features/task/hooks";
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

type DeleteTaskTemplateDialogProps = {
  template: TaskTemplate | null;
  onOpenChange: (open: boolean) => void;
};

export function DeleteTaskTemplateDialog({
  template,
  onOpenChange,
}: DeleteTaskTemplateDialogProps) {
  const { mutate, isPending } = useDeleteTaskTemplate();

  function handleDelete() {
    if (!template) return;

    mutate(template.id, { onSuccess: () => onOpenChange(false) });
  }

  return (
    <Dialog open={template !== null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete template</DialogTitle>
          <DialogDescription>
            This deactivates &quot;{template?.name}&quot; -- it will no
            longer be available to create new tasks from, but existing tasks
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
              "Delete template"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
