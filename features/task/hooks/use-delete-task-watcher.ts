"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { deleteTaskWatcherRequest } from "@/features/task/hooks/task.api";
import { taskKeys } from "@/features/task/hooks/task.keys";
import { ApiClientError } from "@/lib/api-client";

type DeleteTaskWatcherVariables = {
  taskId: string;
  watcherId: string;
};

export function useDeleteTaskWatcher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, watcherId }: DeleteTaskWatcherVariables) =>
      deleteTaskWatcherRequest(taskId, watcherId),
    onSuccess: (watcher) => {
      queryClient.invalidateQueries({
        queryKey: taskKeys.detail(watcher.taskId),
      });
      toast.success("Watcher removed.");
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiClientError
          ? error.message
          : "Failed to remove the watcher. Please try again.",
      );
    },
  });
}
