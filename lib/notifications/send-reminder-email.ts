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

  return `
    <div style="font-family: -apple-system, Helvetica, Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #1f2937;">
      <p>Hi ${recipientName},</p>
      <p>This is a reminder for your task:</p>
      <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin: 16px 0;">
        <p style="margin: 0 0 8px; font-weight: 600; font-size: 16px;">${taskTitle}</p>
        ${taskDescription ? `<p style="margin: 0 0 8px; color: #4b5563;">${taskDescription}</p>` : ""}
        <p style="margin: 0; color: #4b5563;">Due: ${dueAtLabel}</p>
      </div>
      ${taskUrl ? `<p><a href="${taskUrl}" style="color: #4f46e5;">View task</a></p>` : ""}
    </div>
  `;
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
  });
}
