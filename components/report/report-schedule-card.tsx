"use client";

import { Loader2, Send, type LucideIcon } from "lucide-react";

import type { ReportType } from "@/features/report/constants/report-type.constant";
import { useSendReportNow } from "@/features/report/hooks/use-send-report-now";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ReportScheduleCard({
  type,
  icon: Icon,
  title,
  description,
  scheduleText,
  nextRunLabel,
}: {
  type: ReportType;
  icon: LucideIcon;
  title: string;
  description: string;
  scheduleText: string;
  nextRunLabel: string;
}) {
  const { mutate, isPending } = useSendReportNow();

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="size-4.5" />
          </div>
          <div className="flex flex-col gap-0.5">
            <CardTitle>{title}</CardTitle>
            <p className="text-xs text-muted-foreground">{scheduleText}</p>
          </div>
        </div>
        <Badge variant="secondary" className="shrink-0">
          Automated
        </Badge>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">{description}</p>

        <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
          <span className="text-xs text-muted-foreground">
            Next scheduled send
          </span>
          <span className="text-sm font-medium text-foreground">
            {nextRunLabel}
          </span>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="self-start"
          disabled={isPending}
          onClick={() => mutate(type)}
        >
          {isPending ? <Loader2 className="animate-spin" /> : <Send />}
          Send now
        </Button>
      </CardContent>
    </Card>
  );
}
