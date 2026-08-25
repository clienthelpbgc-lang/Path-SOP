"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { updateTaskRequest } from "@/features/task/hooks/task.api";
import { taskKeys } from "@/features/task/hooks/task.keys";
import type { UpdateTaskInput } from "@/features/task/types";
import { ApiClientError } from "@/lib/api-client";

type UpdateTaskVariables = {
  id: string;
  input: UpdateTaskInput;
};

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: UpdateTaskVariables) =>
      updateTaskRequest(id, input),
    onSuccess: (task) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(task.id) });
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
