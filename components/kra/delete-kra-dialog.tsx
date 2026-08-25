"use client";

import { Loader2 } from "lucide-react";

import { useDeleteKra } from "@/features/kra/hooks";
import type { Kra } from "@/features/kra/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type DeleteKraDialogProps = {
  kra: Kra | null;
  onOpenChange: (open: boolean) => void;
};

export function DeleteKraDialog({ kra, onOpenChange }: DeleteKraDialogProps) {
  const { mutate, isPending } = useDeleteKra();

  function handleDelete() {
    if (!kra) return;

    mutate(kra.id, { onSuccess: () => onOpenChange(false) });
  }

  return (
    <Dialog open={kra !== null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete KRA</DialogTitle>
          <DialogDescription>
            This will permanently delete &quot;{kra?.title}&quot;. A KRA
            within its active period can&apos;t be deleted. This action
            cannot be undone.
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
              "Delete KRA"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
