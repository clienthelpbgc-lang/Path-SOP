"use client";

import { Loader2 } from "lucide-react";

import { useDeleteTaskTemplatePreset } from "@/features/task/hooks";
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

type DeleteTaskTemplatePresetDialogProps = {
  preset: TaskTemplatePreset | null;
  onOpenChange: (open: boolean) => void;
};

export function DeleteTaskTemplatePresetDialog({
  preset,
  onOpenChange,
}: DeleteTaskTemplatePresetDialogProps) {
  const { mutate, isPending } = useDeleteTaskTemplatePreset();

  function handleDelete() {
    if (!preset) return;

    mutate(preset.id, { onSuccess: () => onOpenChange(false) });
  }

  return (
    <Dialog open={preset !== null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Deactivate preset</DialogTitle>
          <DialogDescription>
            This deactivates &quot;{preset?.name}&quot; for every company --
            it will no longer show up as a starting point for new tasks, but
            tasks already created from it are unaffected.
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
                Deactivating...
              </>
            ) : (
              "Deactivate preset"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
