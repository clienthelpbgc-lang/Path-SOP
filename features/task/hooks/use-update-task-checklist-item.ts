"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { updateTaskChecklistItemRequest } from "@/features/task/hooks/task.api";
import { taskKeys } from "@/features/task/hooks/task.keys";
import type { UpdateTaskChecklistItemInput } from "@/features/task/types";
import { ApiClientError } from "@/lib/api-client";

type UpdateTaskChecklistItemVariables = {
  taskId: string;
  itemId: string;
  input: UpdateTaskChecklistItemInput;
};

export function useUpdateTaskChecklistItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, itemId, input }: UpdateTaskChecklistItemVariables) =>
      updateTaskChecklistItemRequest(taskId, itemId, input),
    onSuccess: (item) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(item.taskId) });
      toast.success("Checklist item updated.");
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiClientError
          ? error.message
          : "Failed to update the checklist item. Please try again.",
      );
    },
  });
}
