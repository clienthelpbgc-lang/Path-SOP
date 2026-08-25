"use client";

import { useState } from "react";
import { AlertTriangle, CalendarRange } from "lucide-react";

import { usePeriodPerformance } from "@/features/dashboard/hooks";
import type { DashboardPeriodKey } from "@/features/dashboard/types";
import { getScoreTier, SCORE_TIERS } from "@/components/dashboard/score-tier";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const PERIOD_OPTIONS: { value: DashboardPeriodKey; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "last_week", label: "Last 7 days" },
  { value: "last_month", label: "Last month" },
  { value: "last_3_months", label: "Last 3 months" },
  { value: "last_6_months", label: "Last 6 months" },
  { value: "last_year", label: "Last year" },
  { value: "all_time", label: "All time" },
];

function ScoreTile({ label, value }: { label: string; value: number }) {
  const tier = SCORE_TIERS[getScoreTier(value)];

  return (
    <div className={cn("flex flex-1 flex-col items-center gap-1 rounded-lg p-4 ring-1", tier.bg, tier.ring)}>
      <span className={cn("text-2xl font-bold tracking-tight", tier.text)}>
        {value}%
      </span>
      <span className="text-xs font-medium text-foreground">{label}</span>
    </div>
  );
}

function PerformanceTilesSkeleton() {
  return (
    <div className="flex gap-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="h-20 flex-1 animate-pulse rounded-lg bg-muted" />
      ))}
    </div>
  );
}

type DashboardPeriodPerformanceProps = {
  // Omitted shows the current user's own performance; an admin viewing a
  // team member's overview passes that member's id instead.
  userId?: string;
};

export function DashboardPeriodPerformance({
  userId,
}: DashboardPeriodPerformanceProps) {
  const [period, setPeriod] = useState<DashboardPeriodKey>("last_week");
  const { data, isLoading, isError } = usePeriodPerformance(period, userId);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <CardTitle className="flex items-center gap-1.5">
          <CalendarRange className="size-4 text-muted-foreground" />
          Performance
        </CardTitle>
        <Select
          items={PERIOD_OPTIONS}
          value={period}
          onValueChange={(value) => setPeriod(value as DashboardPeriodKey)}
        >
          <SelectTrigger size="sm" className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PERIOD_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {isError ? (
          <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
            <AlertTriangle className="size-4" />
            Couldn&apos;t load performance for this period.
          </div>
        ) : isLoading || !data ? (
          <PerformanceTilesSkeleton />
        ) : (
          <div className="flex gap-3">
            <ScoreTile label="Overall score" value={data.performanceScore.score} />
            <ScoreTile label="Task completion" value={data.taskStats.rate} />
            <ScoreTile label="KRA completion" value={data.kraStats.rate} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
