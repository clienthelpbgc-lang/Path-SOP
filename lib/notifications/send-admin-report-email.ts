import { transporter } from "@/lib/notifications/mail-transport";
import type { CompanyReportStats } from "@/features/report/service/get-company-report-stats.service";

export type AdminReportEmailInput = {
  to: string[];
  companyName: string;
  reportTitle: string;
  periodLabel: string;
  generatedAtLabel: string;
  stats: CompanyReportStats;
  dashboardUrl: string | null;
};

function statCell(label: string, value: number, color: string): string {
  return `
    <td style="padding: 12px 4px; text-align: center; width: 25%;">
      <div style="font-size: 22px; font-weight: 700; color: ${color}; line-height: 1.2;">${value}</div>
      <div style="font-size: 11px; color: #6b7280; margin-top: 4px;">${label}</div>
    </td>
  `;
}

function performerRow(rank: number, name: string, count: number): string {
  return `
    <tr>
      <td style="padding: 6px 0; color: #9ca3af; font-size: 13px; width: 24px;">#${rank}</td>
      <td style="padding: 6px 0; color: #1f2937; font-size: 14px; font-weight: 500;">${name}</td>
      <td style="padding: 6px 0; color: #4f46e5; font-size: 13px; font-weight: 600; text-align: right;">${count} completed</td>
    </tr>
  `;
}

function buildHtml(input: AdminReportEmailInput): string {
  const {
    companyName,
    reportTitle,
    periodLabel,
    generatedAtLabel,
    stats,
    dashboardUrl,
  } = input;

  const performersHtml = stats.topPerformers.length
    ? stats.topPerformers
        .map((performer, index) =>
          performerRow(index + 1, performer.name, performer.completedCount),
        )
        .join("")
    : `<tr><td style="padding: 6px 0; color: #9ca3af; font-size: 13px;">No completed tasks in this period.</td></tr>`;

  return `
    <div style="font-family: -apple-system, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #1f2937;">
      <div style="background: linear-gradient(135deg, #4f46e5, #6366f1); border-radius: 12px 12px 0 0; padding: 24px;">
        <p style="margin: 0; color: #e0e7ff; font-size: 12px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase;">Path SOP &middot; ${companyName}</p>
        <h1 style="margin: 6px 0 0; color: #ffffff; font-size: 20px; font-weight: 700;">${reportTitle}</h1>
        <p style="margin: 4px 0 0; color: #c7d2fe; font-size: 13px;">${periodLabel}</p>
      </div>

      <div style="border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; padding: 20px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; border-bottom: 1px solid #f3f4f6; padding-bottom: 8px;">
          <tr>
            ${statCell("Assigned", stats.totalAssigned, "#1f2937")}
            ${statCell("Completed", stats.totalCompleted, "#059669")}
            ${statCell("Pending", stats.totalPending, "#d97706")}
            ${statCell("Overdue", stats.totalOverdue, "#dc2626")}
          </tr>
        </table>

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 16px 0; background: #f5f5ff; border-radius: 8px;">
          <tr>
            <td style="padding: 12px 16px; font-size: 13px; color: #4b5563;">Team completion rate</td>
            <td style="padding: 12px 16px; font-size: 18px; font-weight: 700; color: #4f46e5; text-align: right;">${stats.completionRate}%</td>
          </tr>
        </table>

        <p style="margin: 20px 0 8px; font-size: 12px; font-weight: 600; color: #374151; text-transform: uppercase; letter-spacing: 0.03em;">Top performers</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
          ${performersHtml}
        </table>

        ${
          dashboardUrl
            ? `<p style="margin: 24px 0 0;"><a href="${dashboardUrl}" style="color: #4f46e5; font-weight: 600; text-decoration: none; font-size: 14px;">View full dashboard &rarr;</a></p>`
            : ""
        }
      </div>

      <p style="margin: 16px 4px 0; color: #9ca3af; font-size: 11px;">Generated ${generatedAtLabel} &middot; Automated report from Path SOP</p>
    </div>
  `;
}

// Throws on failure -- the caller (send-company-admin-report.service.ts) is
// responsible for deciding whether/how to catch this, same convention as
// send-reminder-email.ts.
export async function sendAdminReportEmail(
  input: AdminReportEmailInput,
): Promise<void> {
  await transporter.sendMail({
    from: `Path SOP <${process.env.EMAIL_USER}>`,
    to: input.to.join(", "),
    cc: process.env.SUPPORT_CC || undefined,
    subject: `${input.reportTitle} — ${input.companyName}`,
    html: buildHtml(input),
  });
}
