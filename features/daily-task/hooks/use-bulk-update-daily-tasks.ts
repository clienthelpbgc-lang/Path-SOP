"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { updateDailyTaskRequest } from "@/features/daily-task/hooks/daily-task.api";
import { dailyTaskKeys } from "@/features/daily-task/hooks/daily-task.keys";
import type { TaskStatus } from "@/features/daily-task/constants/status.constant";
import { ApiClientError } from "@/lib/api-client";

const STATUS_ACTION_LABEL: Partial<Record<TaskStatus, string>> = {
  IN_PROGRESS: "started",
  SUBMITTED: "submitted for review",
};

export function useBulkUpdateDailyTasks() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      ids,
      status,
      userRemark,
    }: {
      ids: string[];
      status: TaskStatus;
      userRemark?: string;
    }) =>
      Promise.all(
        ids.map((id) => updateDailyTaskRequest(id, { status, userRemark })),
      ).then((tasks) => ({ tasks, status })),
    onSuccess: ({ tasks, status }) => {
      queryClient.invalidateQueries({ queryKey: dailyTaskKeys.lists() });
      const label = STATUS_ACTION_LABEL[status] ?? "updated";
      toast.success(
        `${tasks.length} task${tasks.length === 1 ? "" : "s"} ${label}.`,
      );
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiClientError
          ? error.message
          : "Failed to update tasks. Please try again.",
      );
    },
  });
}
