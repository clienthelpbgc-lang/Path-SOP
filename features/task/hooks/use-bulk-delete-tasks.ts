"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { bulkDeleteTasksRequest } from "@/features/task/hooks/task.api";
import { taskKeys } from "@/features/task/hooks/task.keys";
import { ApiClientError } from "@/lib/api-client";

function pluralizeTasks(count: number): string {
  return `${count} task${count === 1 ? "" : "s"}`;
}

export function useBulkDeleteTasks() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bulkDeleteTasksRequest,
    onSuccess: ({ deletedIds, skippedCount }) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });

      for (const id of deletedIds) {
        queryClient.removeQueries({ queryKey: taskKeys.detail(id) });
      }

      if (deletedIds.length > 0) {
        toast.success(`Deleted ${pluralizeTasks(deletedIds.length)}.`);
      }

      if (skippedCount > 0) {
        toast.error(
          `${pluralizeTasks(skippedCount)} couldn't be deleted -- only pending tasks you created can be deleted.`,
        );
      }
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiClientError
          ? error.message
          : "Failed to delete the selected tasks. Please try again.",
      );
    },
  });
}
