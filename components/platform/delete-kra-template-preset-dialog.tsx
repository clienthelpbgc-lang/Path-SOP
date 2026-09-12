"use client";

import { Loader2 } from "lucide-react";

import { useDeleteKraTemplatePreset } from "@/features/kra/hooks";
import type { KraTemplatePreset } from "@/features/kra/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type DeleteKraTemplatePresetDialogProps = {
  preset: KraTemplatePreset | null;
  onOpenChange: (open: boolean) => void;
};

export function DeleteKraTemplatePresetDialog({
  preset,
  onOpenChange,
}: DeleteKraTemplatePresetDialogProps) {
  const { mutate, isPending } = useDeleteKraTemplatePreset();

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
            it will no longer show up as a starting point for new KRAs, but
            KRAs already assigned from it are unaffected.
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
