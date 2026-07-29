"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { updateDailyTaskRequest } from "@/features/daily-task/hooks/daily-task.api";
import { dailyTaskKeys } from "@/features/daily-task/hooks/daily-task.keys";
import type { UpdateDailyTaskInput } from "@/features/daily-task/types";
import { ApiClientError } from "@/lib/api-client";

export function useUpdateDailyTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDailyTaskInput }) =>
      updateDailyTaskRequest(id, data),
    onSuccess: (task) => {
      queryClient.invalidateQueries({ queryKey: dailyTaskKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: dailyTaskKeys.detail(task.id),
      });
      toast.success(`"${task.title}" was updated successfully.`);
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiClientError
          ? error.message
          : "Failed to update task. Please try again.",
      );
    },
  });
}
