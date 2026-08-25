import { dayKey } from "@/features/dashboard/service/date-range.util";

export function buildReportFilename(
  kind: "weekly" | "monthly",
  userName: string,
  periodStart: Date,
): string {
  const slug = userName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  // Local-date formatting, not `.toISOString()` -- periodStart is a local
  // midnight (see period.util.ts), and converting that to UTC first can
  // shift the date by a day depending on the server's timezone.
  return `${kind}-report-${slug}-${dayKey(periodStart)}.pdf`;
}
