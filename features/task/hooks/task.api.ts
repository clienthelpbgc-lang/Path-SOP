import { apiFetch } from "@/lib/api-client";
import type {
  CreateTaskAttachmentInput,
  CreateTaskChecklistItemInput,
  CreateTaskReminderInput,
  CreateTaskWithRelationsInput,
  ListTasksQueryInput,
  Task,
  TaskAttachment,
  TaskChecklistItem,
  TaskReminder,
  TaskWatcher,
  TaskWithRelations,
  UpdateTaskChecklistItemInput,
  UpdateTaskInput,
  UpdateTaskReminderInput,
} from "@/features/task/types";
import type { PaginatedResult } from "@/utils/types";

const BASE_URL = "/api/task";

function buildQueryString(query: ListTasksQueryInput = {}): string {
  const searchParams = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }

    searchParams.set(key, value instanceof Date ? value.toISOString() : String(value));
  });

  const queryString = searchParams.toString();

  return queryString ? `?${queryString}` : "";
}

export function getTasks(query: ListTasksQueryInput = {}) {
  return apiFetch<PaginatedResult<Task>>(
    `${BASE_URL}${buildQueryString(query)}`,
  );
}

export function getTaskRequest(id: string) {
  return apiFetch<TaskWithRelations>(`${BASE_URL}/${id}`);
}

export function createTaskRequest(input: CreateTaskWithRelationsInput) {
  return apiFetch<TaskWithRelations>(BASE_URL, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateTaskRequest(id: string, input: UpdateTaskInput) {
  return apiFetch<Task>(`${BASE_URL}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function deleteTaskRequest(id: string) {
  return apiFetch<Task>(`${BASE_URL}/${id}`, {
    method: "DELETE",
  });
}

export function stopRepeatingTaskRequest(id: string) {
  return apiFetch<Task>(`${BASE_URL}/${id}/stop-repeating`, {
    method: "POST",
  });
}

export function createTaskChecklistItemRequest(
  taskId: string,
  input: Omit<CreateTaskChecklistItemInput, "taskId">,
) {
  return apiFetch<TaskChecklistItem>(`${BASE_URL}/${taskId}/checklist-item`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateTaskChecklistItemRequest(
  taskId: string,
  itemId: string,
  input: UpdateTaskChecklistItemInput,
) {
  return apiFetch<TaskChecklistItem>(
    `${BASE_URL}/${taskId}/checklist-item/${itemId}`,
    { method: "PATCH", body: JSON.stringify(input) },
  );
}

export function deleteTaskChecklistItemRequest(taskId: string, itemId: string) {
  return apiFetch<TaskChecklistItem>(
    `${BASE_URL}/${taskId}/checklist-item/${itemId}`,
    { method: "DELETE" },
  );
}

export function createTaskReminderRequest(
  taskId: string,
  input: Omit<CreateTaskReminderInput, "taskId">,
) {
  return apiFetch<TaskReminder>(`${BASE_URL}/${taskId}/reminder`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateTaskReminderRequest(
  taskId: string,
  reminderId: string,
  input: UpdateTaskReminderInput,
) {
  return apiFetch<TaskReminder>(
    `${BASE_URL}/${taskId}/reminder/${reminderId}`,
    { method: "PATCH", body: JSON.stringify(input) },
  );
}

export function deleteTaskReminderRequest(taskId: string, reminderId: string) {
  return apiFetch<TaskReminder>(`${BASE_URL}/${taskId}/reminder/${reminderId}`, {
    method: "DELETE",
  });
}

export function createTaskAttachmentRequest(
  taskId: string,
  input: Omit<CreateTaskAttachmentInput, "taskId">,
) {
  return apiFetch<TaskAttachment>(`${BASE_URL}/${taskId}/attachment`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function deleteTaskAttachmentRequest(
  taskId: string,
  attachmentId: string,
) {
  return apiFetch<TaskAttachment>(
    `${BASE_URL}/${taskId}/attachment/${attachmentId}`,
    { method: "DELETE" },
  );
}

export function createTaskWatcherRequest(taskId: string, userId: string) {
  return apiFetch<TaskWatcher>(`${BASE_URL}/${taskId}/watcher`, {
    method: "POST",
    body: JSON.stringify({ userId }),
  });
}

export function deleteTaskWatcherRequest(taskId: string, watcherId: string) {
  return apiFetch<TaskWatcher>(`${BASE_URL}/${taskId}/watcher/${watcherId}`, {
    method: "DELETE",
  });
}

export type UploadedTaskAttachment = {
  fileKey: string;
  fileName: string;
  mimeType?: string;
  sizeBytes?: number;
};

export function uploadTaskAttachmentRequest(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  return apiFetch<UploadedTaskAttachment>(`${BASE_URL}/attachment-upload`, {
    method: "POST",
    body: formData,
  });
}

export function deleteUploadedTaskAttachmentRequest(fileKey: string) {
  return apiFetch<{ fileKey: string }>(
    `${BASE_URL}/attachment-upload?fileKey=${encodeURIComponent(fileKey)}`,
    { method: "DELETE" },
  );
}
