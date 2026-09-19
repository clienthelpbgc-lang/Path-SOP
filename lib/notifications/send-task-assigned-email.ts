import {
  buildEmailLayout,
  PATHSOP_LOGO_SRC,
  pathsopLogoAttachment,
} from "@/lib/notifications/email-layout";
import { transporter } from "@/lib/notifications/mail-transport";

export type TaskAssignedEmailInput = {
  to: string;
  recipientName: string;
  taskTitle: string;
  taskDescription: string | null;
  assignedByName: string;
  dueAtLabel: string;
  taskUrl: string | null;
  // Watchers are told they've been "added to the loop" rather than
  // "assigned", since they aren't the one doing the work.
  asWatcher: boolean;
};

function buildHtml(input: TaskAssignedEmailInput): string {
  const {
    recipientName,
    taskTitle,
    taskDescription,
    assignedByName,
    dueAtLabel,
    taskUrl,
    asWatcher,
  } = input;

  return buildEmailLayout({
    previewText: asWatcher
      ? `You're now watching "${taskTitle}" on Path SOP.`
      : `${assignedByName} assigned you a new task on Path SOP.`,
    badgeLabel: asWatcher ? "Watching" : "New task",
    badgeTone: asWatcher ? "blue" : "green",
    heading: asWatcher ? "You're now watching a task" : "You have a new task",
    recipientName,
    introHtml: asWatcher
      ? `<strong>${assignedByName}</strong> added you as a watcher on this task, so you'll be kept in the loop:`
      : `<strong>${assignedByName}</strong> assigned you a new task:`,
    taskTitle,
    taskDescription,
    metaRows: [{ label: "Due", value: dueAtLabel }],
    ctaUrl: taskUrl,
    ctaLabel: "View task",
    logoSrc: PATHSOP_LOGO_SRC,
  });
}

// Throws on failure -- the caller (notify-task-assignment.service.ts) is
// responsible for catching this per-recipient, same convention as
// send-reminder-email.ts.
export async function sendTaskAssignedEmail(
  input: TaskAssignedEmailInput,
): Promise<void> {
  await transporter.sendMail({
    from: `Path SOP <${process.env.EMAIL_USER}>`,
    to: input.to,
    cc: process.env.SUPPORT_CC || undefined,
    subject: input.asWatcher
      ? `Added as watcher: ${input.taskTitle}`
      : `New task assigned: ${input.taskTitle}`,
    html: buildHtml(input),
    attachments: [pathsopLogoAttachment],
  });
}
