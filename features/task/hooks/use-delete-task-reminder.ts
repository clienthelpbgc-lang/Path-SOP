"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { deleteTaskReminderRequest } from "@/features/task/hooks/task.api";
import { taskKeys } from "@/features/task/hooks/task.keys";
import { ApiClientError } from "@/lib/api-client";

type DeleteTaskReminderVariables = {
  taskId: string;
  reminderId: string;
};

export function useDeleteTaskReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, reminderId }: DeleteTaskReminderVariables) =>
      deleteTaskReminderRequest(taskId, reminderId),
    onSuccess: (reminder) => {
      queryClient.invalidateQueries({
        queryKey: taskKeys.detail(reminder.taskId),
      });
      toast.success("Reminder removed.");
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiClientError
          ? error.message
          : "Failed to remove the reminder. Please try again.",
      );
    },
  });
}
