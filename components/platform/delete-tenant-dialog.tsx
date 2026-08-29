"use client";

import { useId, useState } from "react";
import { Loader2 } from "lucide-react";

import type { Company } from "@/features/company/types";
import { useDeleteCompany } from "@/features/company/hooks";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type DeleteTenantDialogProps = {
  tenant: Company | null;
  onOpenChange: (open: boolean) => void;
};

export function DeleteTenantDialog({
  tenant,
  onOpenChange,
}: DeleteTenantDialogProps) {
  const confirmInputId = useId();
  const [confirmText, setConfirmText] = useState("");
  const { mutate, isPending } = useDeleteCompany();

  const isConfirmed = tenant !== null && confirmText.trim() === tenant.name;

  function handleOpenChange(nextOpen: boolean) {
    onOpenChange(nextOpen);
    if (!nextOpen) setConfirmText("");
  }

  function handleDelete() {
    if (!tenant || !isConfirmed) return;

    mutate(tenant.id, { onSuccess: () => handleOpenChange(false) });
  }

  return (
    <Dialog open={tenant !== null} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete tenant</DialogTitle>
          <DialogDescription>
            This permanently deletes &quot;{tenant?.name}&quot; along with
            every user, task, KRA, and file that belongs to it. This cannot
            be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor={confirmInputId}>
            Type <span className="font-semibold">{tenant?.name}</span> to
            confirm
          </Label>
          <Input
            id={confirmInputId}
            autoComplete="off"
            value={confirmText}
            onChange={(event) => setConfirmText(event.target.value)}
            disabled={isPending}
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
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending || !isConfirmed}
          >
            {isPending ? (
              <>
                <Loader2 className="animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete tenant"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
