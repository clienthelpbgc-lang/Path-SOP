"use client";

import { useState } from "react";

import { useUserSearch } from "@/features/user/hooks";
import type { User } from "@/features/user/types";
import { UserComboboxOptions } from "@/components/team/user-combobox-options";

import { Combobox, ComboboxContent, ComboboxInput } from "@/components/ui/combobox";

type AssigneeComboboxProps = {
  id?: string;
  value: string;
  onValueChange: (userId: string) => void;
  placeholder?: string;
  "aria-invalid"?: boolean;
};

// Search-as-you-type team member picker, shared by every "assign to" field
// (performance tasks, daily tasks, ...). Owns its own search/debounce/query
// state so callers just wire it up like a plain controlled input.
export function AssigneeCombobox({
  id,
  value,
  onValueChange,
  placeholder = "Search team members...",
  "aria-invalid": ariaInvalid,
}: AssigneeComboboxProps) {
  const { setSearch, users, isFetching } = useUserSearch();

  // Remembers the currently selected user so the combobox can still show
  // their name once a subsequent search no longer includes them in `users`.
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  return (
    <Combobox
      items={users.map((user) => user.id)}
      filter={null}
      value={value || null}
      onValueChange={(userId: string | null) => {
        onValueChange(userId ?? "");
        setSelectedUser(users.find((user) => user.id === userId) ?? null);
      }}
      onInputValueChange={setSearch}
      itemToStringLabel={(userId: string) =>
        selectedUser?.id === userId
          ? selectedUser.name
          : (users.find((user) => user.id === userId)?.name ?? "")
      }
    >
      <ComboboxInput id={id} placeholder={placeholder} aria-invalid={ariaInvalid} />
      <ComboboxContent>
        <UserComboboxOptions users={users} isFetching={isFetching} />
      </ComboboxContent>
    </Combobox>
  );
}
