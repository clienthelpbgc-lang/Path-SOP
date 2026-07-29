"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { deleteDailyTaskRequest } from "@/features/daily-task/hooks/daily-task.api";
import { dailyTaskKeys } from "@/features/daily-task/hooks/daily-task.keys";
import { ApiClientError } from "@/lib/api-client";

export function useDeleteDailyTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteDailyTaskRequest,
    onSuccess: (task) => {
      queryClient.invalidateQueries({ queryKey: dailyTaskKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: dailyTaskKeys.detail(task.id),
      });
      toast.success(`"${task.title}" was deleted successfully.`);
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiClientError
          ? error.message
          : "Failed to delete task. Please try again.",
      );
    },
  });
}
