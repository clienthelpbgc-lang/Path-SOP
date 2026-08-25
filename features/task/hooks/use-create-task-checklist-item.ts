"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { createTaskChecklistItemRequest } from "@/features/task/hooks/task.api";
import { taskKeys } from "@/features/task/hooks/task.keys";
import type { CreateTaskChecklistItemInput } from "@/features/task/types";
import { ApiClientError } from "@/lib/api-client";

type CreateTaskChecklistItemVariables = {
  taskId: string;
  input: Omit<CreateTaskChecklistItemInput, "taskId">;
};

export function useCreateTaskChecklistItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, input }: CreateTaskChecklistItemVariables) =>
      createTaskChecklistItemRequest(taskId, input),
    onSuccess: (item) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(item.taskId) });
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiClientError
          ? error.message
          : "Failed to add the checklist item. Please try again.",
      );
    },
  });
}
