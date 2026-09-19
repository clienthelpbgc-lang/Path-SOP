"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { updateTaskRequest } from "@/features/task/hooks/task.api";
import { taskKeys } from "@/features/task/hooks/task.keys";
import type { Task } from "@/features/task/types";

type BulkCompleteResult = {
  succeeded: Task[];
  failedCount: number;
};

async function completeTask(task: Task): Promise<Task> {
  // The status machine only allows pending -> in_progress -> completed, so a
  // still-pending task needs the intermediate transition before it can be
  // marked completed (mirrors CompleteTaskDialog's single-task flow).
  if (task.status === "pending") {
    await updateTaskRequest(task.id, { status: "in_progress" });
  }

  return updateTaskRequest(task.id, { status: "completed" });
}

export function useBulkCompleteTasks() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tasks: Task[]): Promise<BulkCompleteResult> => {
      const results = await Promise.allSettled(tasks.map(completeTask));

      return {
        succeeded: results
          .filter(
            (result): result is PromiseFulfilledResult<Task> =>
              result.status === "fulfilled",
          )
          .map((result) => result.value),
        failedCount: results.filter((result) => result.status === "rejected")
          .length,
      };
    },
    onSuccess: ({ succeeded, failedCount }) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });

      for (const task of succeeded) {
        queryClient.invalidateQueries({ queryKey: taskKeys.detail(task.id) });
      }

      if (succeeded.length > 0) {
        toast.success(
          `Marked ${succeeded.length} task${succeeded.length === 1 ? "" : "s"} as completed.`,
        );
      }

      if (failedCount > 0) {
        toast.error(
          `Failed to complete ${failedCount} task${failedCount === 1 ? "" : "s"}.`,
        );
      }
    },
    onError: () => {
      toast.error("Failed to complete the selected tasks. Please try again.");
    },
  });
}
