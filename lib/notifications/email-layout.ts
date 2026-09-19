import path from "node:path";

// Sampled directly from public/pathsop-logo.png so every email stays on the
// same palette as the logo itself, rather than an ad-hoc "brand green".
const COLORS = {
  green: "#2FA050",
  greenDark: "#1F7A3D",
  teal: "#193330",
  bg: "#F1F6F3",
  cardBorder: "#E1EBE4",
  text: "#1A2420",
  muted: "#5C6D64",
} as const;

// Embedded as a CID attachment (see pathsopLogoAttachment) rather than a
// remote <img src>: it renders even when NEXT_PUBLIC_APP_URL isn't publicly
// reachable (local/dev sends) and avoids Gmail/Outlook's "load remote
// images?" prompt that a hotlinked logo would trigger.
export const PATHSOP_LOGO_CID = "pathsop-logo";
export const PATHSOP_LOGO_SRC = `cid:${PATHSOP_LOGO_CID}`;

export const pathsopLogoAttachment = {
  filename: "pathsop-logo.png",
  path: path.join(process.cwd(), "public", "pathsop-logo.png"),
  cid: PATHSOP_LOGO_CID,
};

export type EmailBadgeTone = "green" | "blue" | "amber";

const BADGE_TONES: Record<EmailBadgeTone, { bg: string; color: string }> = {
  green: { bg: "#E1F5E8", color: COLORS.greenDark },
  blue: { bg: "#E3ECFA", color: "#2C5AA8" },
  amber: { bg: "#FCEEDA", color: "#B25E0B" },
};

const META_DOT_TONES: Record<EmailBadgeTone, string> = {
  green: COLORS.green,
  blue: "#3D72C4",
  amber: "#E0952B",
};

export type EmailMetaRow = {
  label: string;
  value: string;
};

export type EmailLayoutInput = {
  // Hidden inbox-preview line (the snippet Gmail/Apple Mail show next to the
  // subject) -- without one, clients fall back to quoting the first visible
  // text, which here would be "Hi {name}," and nothing useful.
  previewText: string;
  badgeLabel: string;
  badgeTone: EmailBadgeTone;
  heading: string;
  recipientName: string;
  introHtml: string;
  taskTitle: string;
  taskDescription: string | null;
  metaRows: EmailMetaRow[];
  ctaUrl: string | null;
  ctaLabel: string;
  // Injected rather than hardcoded to `cid:...` so this same layout can
  // render a real, browsable preview (a data: URI) outside of an actual
  // email send.
  logoSrc: string;
};

export function buildEmailLayout(input: EmailLayoutInput): string {
  const {
    previewText,
    badgeLabel,
    badgeTone,
    heading,
    recipientName,
    introHtml,
    taskTitle,
    taskDescription,
    metaRows,
    ctaUrl,
    ctaLabel,
    logoSrc,
  } = input;

  const badge = BADGE_TONES[badgeTone];
  const dotColor = META_DOT_TONES[badgeTone];

  const metaRowsHtml = metaRows
    .map(
      (row, index) => `
                                <tr>
                                  <td style="padding: ${index === 0 && !taskDescription ? "10" : "10"}px 0 0; font-size: 13px; line-height: 18px;">
                                    <span style="display:inline-block; width:6px; height:6px; border-radius:50%; background-color:${dotColor}; margin-right:8px;">&nbsp;</span>
                                    <span style="color:${COLORS.muted}; text-transform:uppercase; letter-spacing:0.04em; font-size:11px; font-weight:600;">${row.label}</span>
                                    <span style="color:${COLORS.text}; font-weight:600; margin-left:6px;">${row.value}</span>
                                  </td>
                                </tr>`,
    )
    .join("");

  const ctaHtml = ctaUrl
    ? `
                    <tr>
                      <td style="padding-top:28px;">
                        <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                          <tr>
                            <td style="border-radius:8px; background-color:${COLORS.green};">
                              <a href="${ctaUrl}" style="display:inline-block; padding:12px 28px; font-size:14px; font-weight:700; color:#FFFFFF; text-decoration:none; border-radius:8px;">${ctaLabel}</a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light" />
    <title>Path SOP</title>
  </head>
  <body style="margin:0; padding:0; background-color:${COLORS.bg}; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
    <span style="display:none; max-height:0; overflow:hidden; opacity:0; mso-hide:all;">${previewText}</span>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${COLORS.bg};">
      <tr>
        <td align="center" style="padding: 40px 16px;">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; width:100%;">
            <tr>
              <td style="height:6px; line-height:6px; font-size:0; background-color:${COLORS.green}; border-radius:10px 10px 0 0;">&nbsp;</td>
            </tr>
            <tr>
              <td style="background-color:#FFFFFF; border:1px solid ${COLORS.cardBorder}; border-top:none; border-radius:0 0 10px 10px; padding:36px 40px 40px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td>
                      <img src="${logoSrc}" width="120" height="84" alt="Path SOP" style="display:block; border:0; outline:none;" />
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-top:22px;">
                      <span style="display:inline-block; background-color:${badge.bg}; color:${badge.color}; font-size:11px; font-weight:700; letter-spacing:0.06em; text-transform:uppercase; padding:5px 10px; border-radius:999px;">${badgeLabel}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-top:14px; font-size:21px; line-height:28px; font-weight:700; color:${COLORS.teal};">${heading}</td>
                  </tr>
                  <tr>
                    <td style="padding-top:14px; font-size:15px; line-height:23px; color:${COLORS.text};">
                      Hi ${recipientName},<br /><br />
                      ${introHtml}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-top:20px;">
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F5FAF6; border-left:4px solid ${COLORS.green}; border-radius:8px;">
                        <tr>
                          <td style="padding:18px 20px;">
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                              <tr>
                                <td style="font-size:16px; line-height:22px; font-weight:700; color:${COLORS.teal};">${taskTitle}</td>
                              </tr>
                              ${
                                taskDescription
                                  ? `<tr><td style="padding-top:6px; font-size:14px; line-height:21px; color:${COLORS.muted};">${taskDescription}</td></tr>`
                                  : ""
                              }
                              ${metaRowsHtml}
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  ${ctaHtml}
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 12px 0; text-align:center;">
                <p style="margin:0; font-size:12px; line-height:18px; color:${COLORS.muted};">
                  Sent by <strong style="color:${COLORS.teal};">Path</strong><strong style="color:${COLORS.green};">SOP</strong> · Task &amp; SOP tracking for your team
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
