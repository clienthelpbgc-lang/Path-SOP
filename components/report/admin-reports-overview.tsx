"use client";

import { CalendarCheck2, CalendarRange } from "lucide-react";

import { REPORT_TYPE_LABELS } from "@/features/report/constants/report-type.constant";
import {
  formatReportDate,
  getNextMonthEndReportDate,
  getNextWeekendReportDate,
} from "@/features/report/utils/next-run.util";
import { ReportRecipientsCard } from "@/components/report/report-recipients-card";
import { ReportScheduleCard } from "@/components/report/report-schedule-card";

export function AdminReportsOverview() {
  const now = new Date();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          Reports
        </h2>
        <p className="text-sm text-muted-foreground">
          Automated task summaries emailed to every active admin.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ReportScheduleCard
          type="weekend"
          icon={CalendarCheck2}
          title={REPORT_TYPE_LABELS.weekend}
          description="A 7-day rollup of assigned, completed, pending, and overdue tasks, plus the week's top performers."
          scheduleText="Every Saturday"
          nextRunLabel={formatReportDate(getNextWeekendReportDate(now), now)}
        />
        <ReportScheduleCard
          type="month_end"
          icon={CalendarRange}
          title={REPORT_TYPE_LABELS.month_end}
          description="A month-to-date rollup of task performance across the whole team, sent on the final day of the month."
          scheduleText="Last day of every month"
          nextRunLabel={formatReportDate(getNextMonthEndReportDate(now), now)}
        />
      </div>

      <ReportRecipientsCard />
    </div>
  );
}
