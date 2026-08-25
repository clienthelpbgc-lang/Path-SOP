import { apiFetch } from "@/lib/api-client";
import type { UserRole } from "@/features/user/constants/role.constant";
import type {
  CreateUserInput,
  ListUsersQueryInput,
  UpdateProfileInput,
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

export function updateProfileRequest(input: UpdateProfileInput) {
  return apiFetch<User>(`${BASE_URL}/me`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function updateUserRoleRequest({
  id,
  role,
}: {
  id: string;
  role: UserRole;
}) {
  return apiFetch<User>(`${BASE_URL}/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  });
}

export function deleteUserRequest(id: string) {
  return apiFetch<User>(`${BASE_URL}/${id}`, {
    method: "DELETE",
  });
}
