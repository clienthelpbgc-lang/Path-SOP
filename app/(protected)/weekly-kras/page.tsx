import { CalendarRange } from "lucide-react";

import { PagePlaceholder } from "@/components/layout/page-placeholder";

export default function WeeklyKrasPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          Weekly KRA&apos;s
        </h2>
        <p className="text-sm text-muted-foreground">
          Review your key result areas for the week.
        </p>
      </div>

      <PagePlaceholder
        icon={CalendarRange}
        title="No weekly KRA's yet"
        description="Your weekly key result areas and progress will show up here."
      />
    </div>
  );
}
