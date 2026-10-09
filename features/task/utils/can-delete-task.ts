import type { Task } from "@/features/task/types";

// Matches the server-side rule in delete-task.service.ts and
// bulk-delete-tasks.service.ts: only the creator can delete a task, and
// only while it's still pending.
export function canDeleteTask(task: Task, currentUserId: string): boolean {
  return task.createdBy === currentUserId && task.status === "pending";
}
