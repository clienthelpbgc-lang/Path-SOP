"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { createDailyTaskRequest } from "@/features/daily-task/hooks/daily-task.api";
import { dailyTaskKeys } from "@/features/daily-task/hooks/daily-task.keys";
import { ApiClientError } from "@/lib/api-client";

export function useCreateDailyTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createDailyTaskRequest,
    onSuccess: (task) => {
      queryClient.invalidateQueries({ queryKey: dailyTaskKeys.lists() });
      toast.success(`Task was created successfully.`);
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiClientError
          ? error.message
          : "Failed to create task. Please try again.",
      );
    },
  });
}
