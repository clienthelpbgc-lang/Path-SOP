import { FileDown } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ReportDownloadButtonsProps = {
  // Omitted downloads the current user's own report; an admin viewing a
  // team member's overview passes that member's id instead.
  userId?: string;
};

// Plain download links, not buttons wired to fetch/blob -- the report
// routes are same-origin GETs behind the normal session cookie, so the
// browser can just download them directly (see app/api/reports/*).
export function ReportDownloadButtons({ userId }: ReportDownloadButtonsProps) {
  const query = userId ? `?userId=${userId}` : "";

  return (
    <div className="flex items-center gap-2">
      <a
        href={`/api/reports/weekly${query}`}
        className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
      >
        <FileDown />
        Weekly report
      </a>
      <a
        href={`/api/reports/monthly${query}`}
        className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
      >
        <FileDown />
        Monthly report
      </a>
    </div>
  );
}
