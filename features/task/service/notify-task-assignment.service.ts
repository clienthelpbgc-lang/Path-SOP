import type { TaskWithRelations } from "@/features/task/types";
import { sendTaskAssignedEmail } from "@/lib/notifications/send-task-assigned-email";
import { sendTaskAssignedWhatsApp } from "@/lib/notifications/send-task-assigned-whatsapp";

type NotifiableTask = Pick<
  TaskWithRelations,
  "id" | "title" | "description" | "dueAt"
>;

type Recipient = { name: string; email: string; phone: string | null };

function formatDueAt(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function buildTaskUrl(taskId: string): string | null {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;

  return baseUrl ? `${baseUrl.replace(/\/$/, "")}/tasks?taskId=${taskId}` : null;
}

// Never throws -- a failed email or WhatsApp send must not block the task
// action that triggered it (creation, reassignment, adding a watcher), nor
// should one channel's failure stop the other. Mirrors the per-recipient
// error handling in dispatch-reminders.service.ts.
async function notify(
  recipient: Recipient,
  task: NotifiableTask,
  assignedByName: string,
  asWatcher: boolean,
): Promise<void> {
  const dueAtLabel = formatDueAt(task.dueAt);

  const emailSend = sendTaskAssignedEmail({
    to: recipient.email,
    recipientName: recipient.name,
    taskTitle: task.title,
    taskDescription: task.description,
    assignedByName,
    dueAtLabel,
    taskUrl: buildTaskUrl(task.id),
    asWatcher,
  }).catch((error) => {
    console.error(`Failed to send task assignment email to ${recipient.email}.`, error);
  });

  // Only attempted when a phone number is on file -- unlike email, it isn't
  // a required field on users (see features/user/schema.ts).
  const whatsappSend = recipient.phone
    ? sendTaskAssignedWhatsApp({
        to: recipient.phone,
        recipientName: recipient.name,
        taskTitle: task.title,
        assignedByName,
        asWatcher,
      }).catch((error) => {
        console.error(
          `Failed to send task assignment WhatsApp message to ${recipient.name}.`,
          error,
        );
      })
    : Promise.resolve();

  await Promise.all([emailSend, whatsappSend]);
}

// Notifies the assignee and every watcher that they've been put on a task --
// fired once when the task (and its initial watcher list) is created.
export async function notifyTaskAssignment(task: TaskWithRelations): Promise<void> {
  await Promise.all([
    notify(task.assignee, task, task.creator.name, false),
    ...task.watchers.map((watcher) =>
      notify(watcher.user, task, task.creator.name, true),
    ),
  ]);
}

// Notifies the newly assigned user when an existing task is reassigned.
export async function notifyTaskReassignment(
  task: NotifiableTask,
  assignee: Recipient,
  assignedByName: string,
): Promise<void> {
  await notify(assignee, task, assignedByName, false);
}

// Notifies a user added as a watcher after the task already exists.
export async function notifyWatcherAdded(
  task: NotifiableTask,
  watcher: Recipient,
  assignedByName: string,
): Promise<void> {
  await notify(watcher, task, assignedByName, true);
}
