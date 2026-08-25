"use client";

import { useState } from "react";

import { useUserSearch } from "@/features/user/hooks";
import type { User } from "@/features/user/types";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";

const ALL_USERS_VALUE = "__all__";

type UserFilterComboboxProps = {
  id?: string;
  value: string | undefined;
  onValueChange: (userId: string | undefined) => void;
  placeholder?: string;
  className?: string;
};

// Same search-as-you-type team member picker as AssigneeCombobox, but with
// an "All users" option pinned at the top for filtering a list rather than
// assigning a single task.
export function UserFilterCombobox({
  id,
  value,
  onValueChange,
  placeholder = "All users",
  className,
}: UserFilterComboboxProps) {
  const { setSearch, users, isFetching } = useUserSearch({ limit: 100 });
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  return (
    <Combobox
      items={[ALL_USERS_VALUE, ...users.map((user) => user.id)]}
      filter={null}
      value={value ?? ALL_USERS_VALUE}
      onValueChange={(userId: string | null) => {
        if (!userId || userId === ALL_USERS_VALUE) {
          onValueChange(undefined);
          setSelectedUser(null);
          return;
        }

        onValueChange(userId);
        setSelectedUser(users.find((user) => user.id === userId) ?? null);
      }}
      onInputValueChange={setSearch}
      itemToStringLabel={(userId: string) => {
        // Lets a caller show something other than "All users" once nothing
        // is selected (e.g. to tell two filter comboboxes on the same
        // toolbar apart) -- the dropdown option itself still reads "All
        // users".
        if (userId === ALL_USERS_VALUE) return placeholder;
        return selectedUser?.id === userId
          ? selectedUser.name
          : (users.find((user) => user.id === userId)?.name ?? "");
      }}
    >
      <ComboboxInput
        id={id}
        placeholder={placeholder}
        className={className}
        // The field always shows a resolved label (at minimum "All users"),
        // never truly empty text -- select it on focus so typing replaces
        // it instead of appending to it.
        onFocus={(event) => event.currentTarget.select()}
      />
      <ComboboxContent>
        <ComboboxList>
          <ComboboxItem value={ALL_USERS_VALUE}>All users</ComboboxItem>
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
        <ComboboxEmpty>
          {isFetching ? "Searching..." : "No team members found."}
        </ComboboxEmpty>
      </ComboboxContent>
    </Combobox>
  );
}
