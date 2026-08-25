"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { deleteTaskChecklistItemRequest } from "@/features/task/hooks/task.api";
import { taskKeys } from "@/features/task/hooks/task.keys";
import { ApiClientError } from "@/lib/api-client";

type DeleteTaskChecklistItemVariables = {
  taskId: string;
  itemId: string;
};

export function useDeleteTaskChecklistItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, itemId }: DeleteTaskChecklistItemVariables) =>
      deleteTaskChecklistItemRequest(taskId, itemId),
    onSuccess: (item) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(item.taskId) });
      toast.success("Checklist item removed.");
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiClientError
          ? error.message
          : "Failed to remove the checklist item. Please try again.",
      );
    },
  });
}
