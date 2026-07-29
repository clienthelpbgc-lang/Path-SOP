"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { getUsers } from "@/features/user/hooks/user.api";
import { userKeys } from "@/features/user/hooks/user.keys";
import type { ListUsersQueryInput } from "@/features/user/types";

export function useUsers(query: ListUsersQueryInput = {}) {
  return useQuery({
    queryKey: userKeys.list(query),
    queryFn: () => getUsers(query),
    placeholderData: keepPreviousData,
  });
}
