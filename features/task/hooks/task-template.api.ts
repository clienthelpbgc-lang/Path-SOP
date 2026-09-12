import { apiFetch } from "@/lib/api-client";
import type {
  CreateTaskTemplateInput,
  ListTaskTemplatesQueryInput,
  TaskTemplate,
  UpdateTaskTemplateInput,
} from "@/features/task/types";
import type { PaginatedResult } from "@/utils/types";

const BASE_URL = "/api/task-template";

function buildQueryString(query: ListTaskTemplatesQueryInput = {}): string {
  const searchParams = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.set(key, String(value));
    }
  });

  const queryString = searchParams.toString();

  return queryString ? `?${queryString}` : "";
}

export function getTaskTemplates(query: ListTaskTemplatesQueryInput = {}) {
  return apiFetch<PaginatedResult<TaskTemplate>>(
    `${BASE_URL}${buildQueryString(query)}`,
  );
}

export function createTaskTemplateRequest(input: CreateTaskTemplateInput) {
  return apiFetch<TaskTemplate>(BASE_URL, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateTaskTemplateRequest(
  id: string,
  input: UpdateTaskTemplateInput,
) {
  return apiFetch<TaskTemplate>(`${BASE_URL}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function deleteTaskTemplateRequest(id: string) {
  return apiFetch<TaskTemplate>(`${BASE_URL}/${id}`, {
    method: "DELETE",
  });
}

export function hardDeleteTaskTemplateRequest(id: string) {
  return apiFetch<TaskTemplate>(`${BASE_URL}/${id}/permanent`, {
    method: "DELETE",
  });
}
