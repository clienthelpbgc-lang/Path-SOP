"use client";

import { UserRound } from "lucide-react";

import type { User } from "@/features/user/types";
import { useCurrentUser } from "@/components/providers/current-user-provider";
import { AssigneeCombobox } from "@/components/team/assignee-combobox";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type TaskAssigneeFieldProps = {
  id: string;
  value: string;
  onValueChange: (userId: string) => void;
  error?: string;
  // Extra users the picker should be able to label without fetching them,
  // e.g. a task's current assignee when editing.
  knownUsers?: Pick<User, "id" | "name">[];
};

// Assignee picker for task forms, with a one-click "Assign to me" shortcut so
// users don't have to search for themselves to create a personal task.
export function TaskAssigneeField({
  id,
  value,
  onValueChange,
  error,
  knownUsers = [],
}: TaskAssigneeFieldProps) {
  const currentUser = useCurrentUser();
  const isAssignedToMe = value === currentUser.id;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={id}>Assignee</Label>
        {isAssignedToMe ? (
          <span className="text-xs leading-none text-muted-foreground">
            Assigned to you
          </span>
        ) : (
          <Button
            type="button"
            variant="link"
            size="xs"
            className="h-auto p-0 leading-none"
            onClick={() => onValueChange(currentUser.id)}
          >
            <UserRound />
            Assign to me
          </Button>
        )}
      </div>
      <AssigneeCombobox
        id={id}
        value={value}
        onValueChange={onValueChange}
        aria-invalid={!!error}
        knownUsers={[currentUser, ...knownUsers]}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
