"use client";

import { Loader2 } from "lucide-react";

import { useUpdateUserStatus } from "@/features/user/hooks";
import type { User } from "@/features/user/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ChangeStatusDialogProps = {
  member: User | null;
  nextIsActive: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ChangeStatusDialog({
  member,
  nextIsActive,
  onOpenChange,
}: ChangeStatusDialogProps) {
  const { mutate, isPending } = useUpdateUserStatus();

  function handleConfirm() {
    if (!member) return;

    mutate(
      { id: member.id, isActive: nextIsActive },
      { onSuccess: () => onOpenChange(false) },
    );
  }

  return (
    <Dialog open={member !== null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {nextIsActive ? "Activate member" : "Deactivate member"}
          </DialogTitle>
          <DialogDescription>
            {nextIsActive
              ? `This reactivates "${member?.name}". They will be able to sign in again and reappear in assignee lists.`
              : `This deactivates "${member?.name}". They will no longer be able to sign in or appear in assignee lists, but their existing tasks and history are kept.`}
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
            variant={nextIsActive ? "default" : "destructive"}
            onClick={handleConfirm}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="animate-spin" />
                Updating...
              </>
            ) : nextIsActive ? (
              "Activate"
            ) : (
              "Deactivate"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
