import { sendWhatsAppTemplateMessage } from "@/lib/notifications/whatsapp-client";

export type TaskAssignedWhatsAppInput = {
  to: string;
  recipientName: string;
  taskTitle: string;
  assignedByName: string;
  dueAtLabel: string;
  // Who the task is assigned to -- only used by the watcher template, which
  // tells the watcher who owns the task rather than who added them.
  assigneeName: string;
  // Watchers get a different approved template ("added as a watcher")
  // rather than the direct-assignment one, mirroring the wording split in
  // send-task-assigned-email.ts.
  asWatcher: boolean;
};

const DEFAULT_ASSIGNED_TEMPLATE = "task_assigned";
const DEFAULT_WATCHER_TEMPLATE = "task_watcher_added";

export async function sendTaskAssignedWhatsApp(
  input: TaskAssignedWhatsAppInput,
): Promise<void> {
  const templateName = input.asWatcher
    ? process.env.WHATSAPP_TASK_WATCHER_TEMPLATE_NAME || DEFAULT_WATCHER_TEMPLATE
    : process.env.WHATSAPP_TASK_ASSIGNED_TEMPLATE_NAME || DEFAULT_ASSIGNED_TEMPLATE;

  await sendWhatsAppTemplateMessage({
    to: input.to,
    templateName,
    // Order must match the approved template's {{1}}, {{2}}, {{3}}, {{4}}
    // placeholders -- see the setup notes for the exact template text. The
    // two templates use {{4}} for different things: task_assigned's is the
    // due date, task_watcher_added's is the assignee's name.
    bodyParams: input.asWatcher
      ? [input.recipientName, input.taskTitle, input.dueAtLabel, input.assigneeName]
      : [input.recipientName, input.assignedByName, input.taskTitle, input.dueAtLabel],
  });
}
