"use client";

import { Loader2 } from "lucide-react";

import { useHardDeleteTaskTemplatePreset } from "@/features/task/hooks";
import type { TaskTemplatePreset } from "@/features/task/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type HardDeleteTaskTemplatePresetDialogProps = {
  preset: TaskTemplatePreset | null;
  onOpenChange: (open: boolean) => void;
};

// Unlike DeleteTaskTemplatePresetDialog (deactivate, reversible), this
// permanently removes the row from every company's view. Safe -- nothing
// references a preset's id (see hard-delete-task-template-preset.service.ts)
// -- but the preset's own config is gone for good.
export function HardDeleteTaskTemplatePresetDialog({
  preset,
  onOpenChange,
}: HardDeleteTaskTemplatePresetDialogProps) {
  const { mutate, isPending } = useHardDeleteTaskTemplatePreset();

  function handleDelete() {
    if (!preset) return;

    mutate(preset.id, { onSuccess: () => onOpenChange(false) });
  }

  return (
    <Dialog open={preset !== null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete preset permanently</DialogTitle>
          <DialogDescription>
            This permanently deletes &quot;{preset?.name}&quot; for every
            company, including its checklist and reminders. This cannot be
            undone. Tasks already created from it are unaffected.
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
