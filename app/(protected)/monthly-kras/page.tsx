import { CalendarClock } from "lucide-react";

import { PagePlaceholder } from "@/components/layout/page-placeholder";

export default function MonthlyKrasPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          Monthly KRA&apos;s
        </h2>
        <p className="text-sm text-muted-foreground">
          Review your key result areas for the month.
        </p>
      </div>

      <PagePlaceholder
        icon={CalendarClock}
        title="No monthly KRA's yet"
        description="Your monthly key result areas and progress will show up here."
      />
    </div>
  );
}
