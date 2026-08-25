"use client";

import { useState } from "react";

import { useUsers } from "@/features/user/hooks/use-users";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

type UseUserSearchOptions = {
  excludeUserId?: string;
  limit?: number;
};

// Search-as-you-type team member query, shared by every user-picking
// combobox (assignee, watchers, ...). Owns the search input, its debounce,
// and the underlying query so callers just get back a ready-to-render list.
export function useUserSearch({
  excludeUserId,
  limit = 20,
}: UseUserSearchOptions = {}) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const usersQuery = useUsers({
    isActive: "true",
    limit,
    search: debouncedSearch || undefined,
  });
  const users = (usersQuery.data?.data ?? []).filter(
    (user) => user.id !== excludeUserId,
  );

  return {
    search,
    setSearch,
    users,
    isFetching: usersQuery.isFetching,
  };
}
