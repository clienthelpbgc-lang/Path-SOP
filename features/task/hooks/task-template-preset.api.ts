import { apiFetch } from "@/lib/api-client";
import type {
  CreateTaskTemplatePresetInput,
  ListTaskTemplatePresetsQueryInput,
  TaskTemplatePreset,
  UpdateTaskTemplatePresetInput,
} from "@/features/task/types";
import type { PaginatedResult } from "@/utils/types";

const ADMIN_BASE_URL = "/api/task-template-preset";
const COMPANY_BASE_URL = "/api/company-task-template-preset";

function buildQueryString(
  query: ListTaskTemplatePresetsQueryInput = {},
): string {
  const searchParams = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.set(key, String(value));
    }
  });

  const queryString = searchParams.toString();

  return queryString ? `?${queryString}` : "";
}

export function getTaskTemplatePresets(
  query: ListTaskTemplatePresetsQueryInput = {},
) {
  return apiFetch<PaginatedResult<TaskTemplatePreset>>(
    `${ADMIN_BASE_URL}${buildQueryString(query)}`,
  );
}

export function getCompanyTaskTemplatePresets() {
  return apiFetch<TaskTemplatePreset[]>(COMPANY_BASE_URL);
}

export function createTaskTemplatePresetRequest(
  input: CreateTaskTemplatePresetInput,
) {
  return apiFetch<TaskTemplatePreset>(ADMIN_BASE_URL, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateTaskTemplatePresetRequest(
  id: string,
  input: UpdateTaskTemplatePresetInput,
) {
  return apiFetch<TaskTemplatePreset>(`${ADMIN_BASE_URL}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function deleteTaskTemplatePresetRequest(id: string) {
  return apiFetch<TaskTemplatePreset>(`${ADMIN_BASE_URL}/${id}`, {
    method: "DELETE",
  });
}

export function hardDeleteTaskTemplatePresetRequest(id: string) {
  return apiFetch<TaskTemplatePreset>(`${ADMIN_BASE_URL}/${id}/permanent`, {
    method: "DELETE",
  });
}
