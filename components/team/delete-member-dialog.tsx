"use client";

import { Loader2 } from "lucide-react";

import { useDeleteUser } from "@/features/user/hooks";
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

type DeleteMemberDialogProps = {
  member: User | null;
  onOpenChange: (open: boolean) => void;
};

export function DeleteMemberDialog({
  member,
  onOpenChange,
}: DeleteMemberDialogProps) {
  const { mutate, isPending } = useDeleteUser();

  function handleDelete() {
    if (!member) return;

    mutate(member.id, { onSuccess: () => onOpenChange(false) });
  }

  return (
    <Dialog open={member !== null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete team member</DialogTitle>
          <DialogDescription>
            This permanently removes &quot;{member?.name}&quot; and revokes
            their access. This action cannot be undone.
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
              "Delete member"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
