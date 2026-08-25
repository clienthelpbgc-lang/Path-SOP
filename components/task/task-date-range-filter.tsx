"use client";

import { CalendarRange } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export type TaskDateRange = { from?: Date; to?: Date };

type TaskDateRangeFilterProps = {
  value: TaskDateRange;
  onChange: (value: TaskDateRange) => void;
  className?: string;
};

function formatDate(date?: Date): string | undefined {
  if (!date) return undefined;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function TaskDateRangeFilter({
  value,
  onChange,
  className,
}: TaskDateRangeFilterProps) {
  const hasValue = Boolean(value.from || value.to);
  const label = hasValue
    ? `${formatDate(value.from) ?? "Any"} – ${formatDate(value.to) ?? "Any"}`
    : "Any";

  return (
    <Popover>
      <PopoverTrigger
        className={cn(
          "flex h-9 items-center gap-2 rounded-lg border border-input bg-transparent px-3 text-left text-sm whitespace-nowrap text-foreground transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30",
          className,
        )}
      >
        <CalendarRange className="size-4 shrink-0 text-muted-foreground" />
        <span className={cn("truncate", !hasValue && "text-muted-foreground")}>
          {label}
        </span>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label>From</Label>
            <DatePicker
              value={value.from}
              onChange={(date) => onChange({ ...value, from: date })}
              placeholder="Any"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>To</Label>
            <DatePicker
              value={value.to}
              onChange={(date) => onChange({ ...value, to: date })}
              placeholder="Any"
            />
          </div>
          {hasValue && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onChange({})}
            >
              Clear dates
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
