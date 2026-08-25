"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { updateTaskReminderRequest } from "@/features/task/hooks/task.api";
import { taskKeys } from "@/features/task/hooks/task.keys";
import type { UpdateTaskReminderInput } from "@/features/task/types";
import { ApiClientError } from "@/lib/api-client";

type UpdateTaskReminderVariables = {
  taskId: string;
  reminderId: string;
  input: UpdateTaskReminderInput;
};

export function useUpdateTaskReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, reminderId, input }: UpdateTaskReminderVariables) =>
      updateTaskReminderRequest(taskId, reminderId, input),
    onSuccess: (reminder) => {
      queryClient.invalidateQueries({
        queryKey: taskKeys.detail(reminder.taskId),
      });
      toast.success("Reminder updated.");
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiClientError
          ? error.message
          : "Failed to update the reminder. Please try again.",
      );
    },
  });
}
