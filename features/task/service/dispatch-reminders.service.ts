import { and, eq, lte } from "drizzle-orm";

import { systemDb } from "@/db";
import { sendReminderEmail } from "@/lib/notifications/send-reminder-email";
import { sendWhatsAppTemplateMessage } from "@/lib/notifications/whatsapp-client";
import { users } from "@/features/user/schema";

import { taskReminders, tasks } from "../schema";

// Keeps each invocation comfortably inside a serverless function's time
// budget -- any reminders past this batch are picked up on the next
// scheduled run a few minutes later (see netlify/functions/dispatch-reminders.ts).
const BATCH_SIZE = 25;

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

type DueReminder = {
  id: string;
  channel: "whatsapp" | "email";
  taskId: string;
  taskTitle: string;
  taskDescription: string | null;
  dueAt: Date;
  assigneeName: string;
  assigneeEmail: string;
  assigneePhone: string | null;
};

async function getDueReminders(now: Date): Promise<DueReminder[]> {
  const rows = await systemDb
    .select({
      id: taskReminders.id,
      channel: taskReminders.channel,
      taskId: tasks.id,
      taskTitle: tasks.title,
      taskDescription: tasks.description,
      dueAt: tasks.dueAt,
      assigneeName: users.name,
      assigneeEmail: users.email,
      assigneePhone: users.phone,
    })
    .from(taskReminders)
    .innerJoin(tasks, eq(taskReminders.taskId, tasks.id))
    .innerJoin(users, eq(tasks.assignedTo, users.id))
    .where(
      and(eq(taskReminders.status, "scheduled"), lte(taskReminders.scheduledAt, now)),
    )
    .orderBy(taskReminders.scheduledAt)
    .limit(BATCH_SIZE);

  return rows;
}

async function sendReminder(reminder: DueReminder): Promise<void> {
  if (reminder.channel === "email") {
    await sendReminderEmail({
      to: reminder.assigneeEmail,
      recipientName: reminder.assigneeName,
      taskTitle: reminder.taskTitle,
      taskDescription: reminder.taskDescription,
      dueAtLabel: formatDueAt(reminder.dueAt),
      taskUrl: buildTaskUrl(reminder.taskId),
    });
    return;
  }

  if (!reminder.assigneePhone) {
    throw new Error(`${reminder.assigneeName} has no phone number on file.`);
  }

  await sendWhatsAppTemplateMessage({
    to: reminder.assigneePhone,
    templateName: process.env.WHATSAPP_TEMPLATE_NAME || "task_reminder",
    bodyParams: [
      reminder.assigneeName,
      reminder.taskTitle,
      formatDueAt(reminder.dueAt),
    ],
  });
}

export type DispatchRemindersResult = {
  processedCount: number;
  sentCount: number;
  failedCount: number;
  failedReminderIds: string[];
};

/**
 * Finds every reminder whose `scheduledAt` has arrived and sends it over its
 * configured channel (email via Resend, WhatsApp via the Meta Cloud API).
 * Meant to be invoked periodically (see
 * netlify/functions/dispatch-reminders.ts and
 * app/api/cron/dispatch-reminders/route.ts) rather than from request
 * handlers directly. Each reminder is handled independently so one failure
 * (e.g. a missing phone number) doesn't block the rest of the batch.
 */
export async function dispatchDueReminders(
  now: Date = new Date(),
): Promise<DispatchRemindersResult> {
  const dueReminders = await getDueReminders(now);

  let sentCount = 0;
  const failedReminderIds: string[] = [];

  for (const reminder of dueReminders) {
    try {
      await sendReminder(reminder);

      await systemDb
        .update(taskReminders)
        .set({ status: "sent", sentAt: new Date(), error: null })
        .where(eq(taskReminders.id, reminder.id));

      sentCount += 1;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      console.error(`Failed to send reminder ${reminder.id}.`, error);
      failedReminderIds.push(reminder.id);

      await systemDb
        .update(taskReminders)
        .set({ status: "failed", error: message.slice(0, 1000) })
        .where(eq(taskReminders.id, reminder.id));
    }
  }

  return {
    processedCount: dueReminders.length,
    sentCount,
    failedCount: failedReminderIds.length,
    failedReminderIds,
  };
}
