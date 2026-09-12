"use client";

import { Loader2 } from "lucide-react";

import { useHardDeleteKraTemplate } from "@/features/kra/hooks";
import type { KraTemplate } from "@/features/kra/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type HardDeleteKraTemplateDialogProps = {
  template: KraTemplate | null;
  onOpenChange: (open: boolean) => void;
};

// Unlike DeleteKraTemplateDialog (deactivate, reversible), this permanently
// removes the row. Safe for existing KRAs -- see
// hard-delete-kra-template.service.ts -- but the template's own config is
// gone for good.
export function HardDeleteKraTemplateDialog({
  template,
  onOpenChange,
}: HardDeleteKraTemplateDialogProps) {
  const { mutate, isPending } = useHardDeleteKraTemplate();

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
            This permanently deletes &quot;{template?.name}&quot;. This
            cannot be undone. KRAs already assigned from it are unaffected.
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
