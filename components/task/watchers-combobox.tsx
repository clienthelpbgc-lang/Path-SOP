"use client";

import { X } from "lucide-react";
import { useState } from "react";

import { useUserSearch } from "@/features/user/hooks";
import type { User } from "@/features/user/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { UserComboboxOptions } from "@/components/team/user-combobox-options";

import { Combobox, ComboboxContent, ComboboxInput } from "@/components/ui/combobox";

type WatchersComboboxProps = {
  value: string[];
  onValueChange: (userIds: string[]) => void;
  excludeUserId?: string;
  placeholder?: string;
};

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
}

// Multi-select team member picker for task watchers. Mirrors
// AssigneeCombobox's search-as-you-type wiring, but keeps a running map of
// every user picked so far so selections can still render a name once
// scrolled out of the current search result page, and renders selections as
// a list below the search box instead of inline chips.
export function WatchersCombobox({
  value,
  onValueChange,
  excludeUserId,
  placeholder = "Search team members...",
}: WatchersComboboxProps) {
  const { setSearch, users, isFetching } = useUserSearch({ excludeUserId });

  const [knownUsers, setKnownUsers] = useState<Record<string, User>>({});

  function handleValueChange(nextValue: string[]) {
    setKnownUsers((prev) => {
      let changed = false;
      const next = { ...prev };
      for (const userId of nextValue) {
        if (!next[userId]) {
          const user = users.find((candidate) => candidate.id === userId);
          if (user) {
            next[userId] = user;
            changed = true;
          }
        }
      }
      return changed ? next : prev;
    });
    onValueChange(nextValue);
  }

  return (
    <div className="flex flex-col gap-2">
      <Combobox
        items={users.map((user) => user.id)}
        filter={null}
        multiple
        value={value}
        onValueChange={handleValueChange}
        onInputValueChange={setSearch}
        itemToStringLabel={(userId: string) => knownUsers[userId]?.name ?? ""}
      >
        <ComboboxInput placeholder={placeholder} />
        <ComboboxContent>
          <UserComboboxOptions users={users} isFetching={isFetching} />
        </ComboboxContent>
      </Combobox>

      {value.length > 0 && (
        <ul className="flex flex-col gap-1.5">
          {value.map((userId) => {
            const user = knownUsers[userId];

            return (
              <li
                key={userId}
                className="flex items-center gap-2.5 rounded-lg border border-border bg-muted/40 py-1.5 pr-1.5 pl-2"
              >
                <Avatar size="sm">
                  <AvatarFallback>
                    {user ? initials(user.name) : "…"}
                  </AvatarFallback>
                </Avatar>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm font-medium text-foreground">
                    {user?.name ?? "Loading..."}
                  </span>
                  {user?.email && (
                    <span className="truncate text-xs text-muted-foreground">
                      {user.email}
                    </span>
                  )}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  aria-label={`Remove ${user?.name ?? "watcher"}`}
                  onClick={() =>
                    handleValueChange(value.filter((id) => id !== userId))
                  }
                >
                  <X />
                </Button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
