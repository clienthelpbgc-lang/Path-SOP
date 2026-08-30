"use client";

import type { DashboardPeriodKey } from "@/features/dashboard/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const PERIOD_OPTIONS: { value: DashboardPeriodKey; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "last_week", label: "Last 7 days" },
  { value: "last_month", label: "Last month" },
  { value: "last_3_months", label: "Last 3 months" },
  { value: "last_6_months", label: "Last 6 months" },
  { value: "last_year", label: "Last year" },
  { value: "all_time", label: "All time" },
];

export function PeriodSelector({
  value,
  onValueChange,
}: {
  value: DashboardPeriodKey;
  onValueChange: (value: DashboardPeriodKey) => void;
}) {
  return (
    <Select
      items={PERIOD_OPTIONS}
      value={value}
      onValueChange={(next) => onValueChange(next as DashboardPeriodKey)}
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
  );
}
