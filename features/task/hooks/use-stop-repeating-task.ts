"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { stopRepeatingTaskRequest } from "@/features/task/hooks/task.api";
import { taskKeys } from "@/features/task/hooks/task.keys";
import { ApiClientError } from "@/lib/api-client";

export function useStopRepeatingTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: stopRepeatingTaskRequest,
    onSuccess: (task) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(task.id) });
      toast.success(`"${task.title}" will no longer repeat.`);
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiClientError
          ? error.message
          : "Failed to stop the repeating task. Please try again.",
      );
    },
  });
}
