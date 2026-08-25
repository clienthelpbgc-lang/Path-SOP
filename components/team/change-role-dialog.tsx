"use client";

import { Loader2 } from "lucide-react";

import { useUpdateUserRole } from "@/features/user/hooks";
import type { UserRole } from "@/features/user/constants/role.constant";
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

const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: "Admin",
  USER: "User",
};

type ChangeRoleDialogProps = {
  member: User | null;
  nextRole: UserRole;
  onOpenChange: (open: boolean) => void;
};

export function ChangeRoleDialog({
  member,
  nextRole,
  onOpenChange,
}: ChangeRoleDialogProps) {
  const { mutate, isPending } = useUpdateUserRole();

  function handleConfirm() {
    if (!member) return;

    mutate(
      { id: member.id, role: nextRole },
      { onSuccess: () => onOpenChange(false) },
    );
  }

  return (
    <Dialog open={member !== null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Change role</DialogTitle>
          <DialogDescription>
            This changes &quot;{member?.name}&quot;&apos;s role from{" "}
            {member && ROLE_LABELS[member.role as UserRole]} to{" "}
            {ROLE_LABELS[nextRole]}.
            {nextRole === "USER" &&
              " They will lose admin access immediately."}
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
          <Button type="button" onClick={handleConfirm} disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="animate-spin" />
                Updating...
              </>
            ) : (
              `Make ${ROLE_LABELS[nextRole].toLowerCase()}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
