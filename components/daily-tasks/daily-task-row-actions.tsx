"use client";

import { Loader2 } from "lucide-react";

import { useUpdateDailyTask } from "@/features/daily-task/hooks";
import type { TaskStatus } from "@/features/daily-task/constants/status.constant";
import type { DailyTask } from "@/features/daily-task/types";
import { Button } from "@/components/ui/button";
import { SubmitTaskDialog } from "@/components/daily-tasks/submit-task-dialog";

export function DailyTaskRowActions({
  task,
  currentUserId,
}: {
  task: DailyTask;
  currentUserId: string;
}) {
  const { mutate, isPending, variables } = useUpdateDailyTask();

  const isAssignee = task.assignedTo === currentUserId;

  function transitionTo(status: TaskStatus) {
    mutate({ id: task.id, data: { status } });
  }

  function isTransitioning(status: TaskStatus) {
    return isPending && variables?.id === task.id && variables.data.status === status;
  }

  if (task.status === "PENDING" && isAssignee) {
    return (
      <Button
        size="sm"
        onClick={() => transitionTo("IN_PROGRESS")}
        disabled={isPending}
      >
        {isTransitioning("IN_PROGRESS") && (
          <Loader2 className="animate-spin" />
        )}
        Start
      </Button>
    );
  }

  if (task.status === "IN_PROGRESS" && isAssignee) {
    return <SubmitTaskDialog taskId={task.id} taskTitle={task.title} />;
  }

  if (task.status === "SUBMITTED" && isAssignee) {
    return (
      <span className="text-xs text-muted-foreground">Awaiting review</span>
    );
  }

  return <span className="text-xs text-muted-foreground">—</span>;
}
