import {
  buildEmailLayout,
  PATHSOP_LOGO_SRC,
  pathsopLogoAttachment,
} from "@/lib/notifications/email-layout";
import { transporter } from "@/lib/notifications/mail-transport";

export type PasswordResetEmailInput = {
  to: string;
  recipientName: string;
  resetUrl: string;
  expiresInLabel: string;
};

function buildHtml(input: PasswordResetEmailInput): string {
  return buildEmailLayout({
    previewText: "Reset your Path SOP password.",
    badgeLabel: "Security",
    badgeTone: "amber",
    heading: "Reset your password",
    recipientName: input.recipientName,
    introHtml:
      "We received a request to reset the password for your Path SOP account. Use the button below to choose a new one.",
    // The layout's highlighted card is task-shaped; here it carries the
    // request summary instead.
    taskTitle: "Password reset requested",
    taskDescription:
      "If you didn't request this, you can safely ignore this email -- your password won't change.",
    metaRows: [
      { label: "Account", value: input.to },
      { label: "Link expires in", value: input.expiresInLabel },
    ],
    ctaUrl: input.resetUrl,
    ctaLabel: "Reset password",
    logoSrc: PATHSOP_LOGO_SRC,
  });
}

// Throws on failure -- the caller decides whether that should surface.
export async function sendPasswordResetEmail(
  input: PasswordResetEmailInput,
): Promise<void> {
  await transporter.sendMail({
    from: `Path SOP <${process.env.EMAIL_USER}>`,
    to: input.to,
    subject: "Reset your Path SOP password",
    html: buildHtml(input),
    attachments: [pathsopLogoAttachment],
  });
}
