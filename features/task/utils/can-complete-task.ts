import type { Task } from "@/features/task/types";

// Matches the server-side rule in update-task.service.ts: only the assignee
// can move a task's status, and a completed task has nowhere left to go.
export function canCompleteTask(task: Task, currentUserId: string): boolean {
  return task.assignedTo === currentUserId && task.status !== "completed";
}
