import type { User } from "@/features/user/types";

import {
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";

type UserComboboxOptionsProps = {
  users: User[];
  isFetching: boolean;
  emptyLabel?: string;
};

// Renders the list/empty state shared by every user-picking combobox
// (assignee, watchers, ...) so each caller only owns its own value wiring.
export function UserComboboxOptions({
  users,
  isFetching,
  emptyLabel = "No team members found.",
}: UserComboboxOptionsProps) {
  return (
    <>
      <ComboboxList>
        {users.map((user) => (
          <ComboboxItem key={user.id} value={user.id}>
            <span className="flex flex-col">
              <span>{user.name}</span>
              <span className="text-xs text-muted-foreground">
                {user.email}
              </span>
            </span>
          </ComboboxItem>
        ))}
      </ComboboxList>
      <ComboboxEmpty>{isFetching ? "Searching..." : emptyLabel}</ComboboxEmpty>
    </>
  );
}
