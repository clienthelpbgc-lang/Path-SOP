"use client";

import { Loader2 } from "lucide-react";

import { useHardDeleteKraTemplatePreset } from "@/features/kra/hooks";
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

type HardDeleteKraTemplatePresetDialogProps = {
  preset: KraTemplatePreset | null;
  onOpenChange: (open: boolean) => void;
};

// Unlike DeleteKraTemplatePresetDialog (deactivate, reversible), this
// permanently removes the row from every company's view. Safe -- nothing
// references a preset's id (see hard-delete-kra-template-preset.service.ts)
// -- but the preset's own config is gone for good.
export function HardDeleteKraTemplatePresetDialog({
  preset,
  onOpenChange,
}: HardDeleteKraTemplatePresetDialogProps) {
  const { mutate, isPending } = useHardDeleteKraTemplatePreset();

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
            company. This cannot be undone. KRAs already assigned from it
            are unaffected.
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
