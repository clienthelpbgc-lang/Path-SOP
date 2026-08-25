"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { createTaskWatcherRequest } from "@/features/task/hooks/task.api";
import { taskKeys } from "@/features/task/hooks/task.keys";
import { ApiClientError } from "@/lib/api-client";

type CreateTaskWatcherVariables = {
  taskId: string;
  userId: string;
};

export function useCreateTaskWatcher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, userId }: CreateTaskWatcherVariables) =>
      createTaskWatcherRequest(taskId, userId),
    onSuccess: (watcher) => {
      queryClient.invalidateQueries({
        queryKey: taskKeys.detail(watcher.taskId),
      });
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiClientError
          ? error.message
          : "Failed to add the watcher. Please try again.",
      );
    },
  });
}
