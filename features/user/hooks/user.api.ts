import { apiFetch } from "@/lib/api-client";
import type {
  CreateUserInput,
  ListUsersQueryInput,
  User,
} from "@/features/user/types";
import type { PaginatedResult } from "@/utils/types";

const BASE_URL = "/api/user";

function buildQueryString(query: ListUsersQueryInput = {}): string {
  const searchParams = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.set(key, String(value));
    }
  });

  const queryString = searchParams.toString();

  return queryString ? `?${queryString}` : "";
}

export function getUsers(query: ListUsersQueryInput = {}) {
  return apiFetch<PaginatedResult<User>>(
    `${BASE_URL}${buildQueryString(query)}`,
  );
}

export function createUserRequest(input: CreateUserInput) {
  return apiFetch<User>(BASE_URL, {
    method: "POST",
    body: JSON.stringify(input),
  });
}
