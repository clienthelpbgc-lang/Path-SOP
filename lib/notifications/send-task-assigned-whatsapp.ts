import { sendWhatsAppTemplateMessage } from "@/lib/notifications/whatsapp-client";

export type TaskAssignedWhatsAppInput = {
  to: string;
  recipientName: string;
  taskTitle: string;
  assignedByName: string;
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
    // Order must match the approved template's {{1}}, {{2}}, {{3}}
    // placeholders -- see the setup notes for the exact template text.
    // Due date is deliberately left out of the message body: Meta rejects
    // templates that pack too many variables into too little static text,
    // so the message points the recipient to the app for full details
    // instead of trying to fit everything inline.
    bodyParams: [input.recipientName, input.assignedByName, input.taskTitle],
  });
}
