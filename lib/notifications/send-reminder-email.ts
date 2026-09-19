import {
  buildEmailLayout,
  PATHSOP_LOGO_SRC,
  pathsopLogoAttachment,
} from "@/lib/notifications/email-layout";
import { transporter } from "@/lib/notifications/mail-transport";

export type ReminderEmailInput = {
  to: string;
  recipientName: string;
  taskTitle: string;
  taskDescription: string | null;
  dueAtLabel: string;
  taskUrl: string | null;
};

function buildHtml(input: ReminderEmailInput): string {
  const { recipientName, taskTitle, taskDescription, dueAtLabel, taskUrl } =
    input;

  return buildEmailLayout({
    previewText: `Reminder: ${taskTitle} is due soon on Path SOP.`,
    badgeLabel: "Reminder",
    badgeTone: "amber",
    heading: "Task reminder",
    recipientName,
    introHtml: "This is a reminder about your task:",
    taskTitle,
    taskDescription,
    metaRows: [{ label: "Due", value: dueAtLabel }],
    ctaUrl: taskUrl,
    ctaLabel: "View task",
    logoSrc: PATHSOP_LOGO_SRC,
  });
}

// Throws on failure -- the caller (dispatch-reminders.service.ts) is
// responsible for catching this per-reminder and recording the error rather
// than letting one failed send take down the whole batch. (mail-transport's
// own EMAIL_USER/EMAIL_APP_PASSWORD checks throw at import time, so by the
// time this runs the transporter is already known-configured.)
export async function sendReminderEmail(input: ReminderEmailInput): Promise<void> {
  await transporter.sendMail({
    from: `Path SOP <${process.env.EMAIL_USER}>`,
    to: input.to,
    cc: process.env.SUPPORT_CC || undefined,
    subject: `Reminder: ${input.taskTitle}`,
    html: buildHtml(input),
    attachments: [pathsopLogoAttachment],
  });
}
