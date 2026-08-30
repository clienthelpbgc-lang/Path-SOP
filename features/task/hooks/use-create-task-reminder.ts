"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { createTaskReminderRequest } from "@/features/task/hooks/task.api";
import { taskKeys } from "@/features/task/hooks/task.keys";
import type { CreateTaskReminderInput } from "@/features/task/types";
import { ApiClientError } from "@/lib/api-client";

type CreateTaskReminderVariables = {
  taskId: string;
  input: Omit<CreateTaskReminderInput, "taskId">;
};

export function useCreateTaskReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, input }: CreateTaskReminderVariables) =>
      createTaskReminderRequest(taskId, input),
    onSuccess: (reminder) => {
      queryClient.invalidateQueries({
        queryKey: taskKeys.detail(reminder.taskId),
      });
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiClientError
          ? error.message
          : "Failed to add the reminder. Please try again.",
      );
    },
  });
}
