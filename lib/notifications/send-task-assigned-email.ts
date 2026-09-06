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

  const intro = asWatcher
    ? `${assignedByName} added you as a watcher on this task, so you'll be kept in the loop:`
    : `${assignedByName} assigned you a new task:`;

  return `
    <div style="font-family: -apple-system, Helvetica, Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #1f2937;">
      <p>Hi ${recipientName},</p>
      <p>${intro}</p>
      <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin: 16px 0;">
        <p style="margin: 0 0 8px; font-weight: 600; font-size: 16px;">${taskTitle}</p>
        ${taskDescription ? `<p style="margin: 0 0 8px; color: #4b5563;">${taskDescription}</p>` : ""}
        <p style="margin: 0; color: #4b5563;">Due: ${dueAtLabel}</p>
      </div>
      ${taskUrl ? `<p><a href="${taskUrl}" style="color: #4f46e5;">View task</a></p>` : ""}
    </div>
  `;
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
  });
}
