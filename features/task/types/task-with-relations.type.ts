import type { User } from "@/features/user/types";
import type { Task } from "@/features/task/types/task.type";
import type { TaskCrmLead } from "@/features/task/types/task-crm-lead.type";
import type { TaskAttachment } from "@/features/task/types/task-attachment.type";
import type { TaskChecklistItem } from "@/features/task/types/task-checklist-item.type";
import type { TaskReminder } from "@/features/task/types/task-reminder.type";

export type TaskParty = Pick<User, "id" | "name" | "email" | "phone">;

export type TaskWithRelations = Task & {
  assignee: TaskParty;
  creator: TaskParty;
  checklistItems: TaskChecklistItem[];
  attachments: TaskAttachment[];
  reminders: TaskReminder[];
  watchers: { userId: string; user: TaskParty }[];
  // Set when the CRM created this task for one of its leads.
  crmLead: TaskCrmLead | null;
};
