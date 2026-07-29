import { apiFetch } from "@/lib/api-client";
import type {
  CreateDailyTaskInput,
  DailyTask,
  DailyTaskWithRelations,
  ListDailyTasksQueryInput,
  UpdateDailyTaskInput,
} from "@/features/daily-task/types";
import type { PaginatedResult } from "@/utils/types";

const BASE_URL = "/api/daily-task";

function buildQueryString(query: ListDailyTasksQueryInput = {}): string {
  const searchParams = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.set(key, value instanceof Date ? value.toISOString() : String(value));
    }
  });

  const queryString = searchParams.toString();

  return queryString ? `?${queryString}` : "";
}

export function getDailyTasks(query: ListDailyTasksQueryInput = {}) {
  return apiFetch<PaginatedResult<DailyTask>>(
    `${BASE_URL}${buildQueryString(query)}`,
  );
}

export function getDailyTaskRequest(id: string) {
  return apiFetch<DailyTaskWithRelations>(`${BASE_URL}/${id}`);
}

export function createDailyTaskRequest(input: CreateDailyTaskInput) {
  return apiFetch<DailyTask>(BASE_URL, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateDailyTaskRequest(id: string, input: UpdateDailyTaskInput) {
  return apiFetch<DailyTask>(`${BASE_URL}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function deleteDailyTaskRequest(id: string) {
  return apiFetch<DailyTask>(`${BASE_URL}/${id}`, {
    method: "DELETE",
  });
}
