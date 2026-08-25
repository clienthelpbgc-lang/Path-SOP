"use client"

import * as React from "react"
import { CalendarClockIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { TimeClockPicker } from "@/components/ui/time-clock-picker"

type DateTimePickerProps = {
  id?: string
  value?: Date
  onChange: (date: Date) => void
  placeholder?: string
  className?: string
  "aria-invalid"?: boolean
  // Dates (and, on that same day, times) before this are disallowed.
  minDate?: Date
}

function formatDateTime(date?: Date): string | undefined {
  if (!date) return undefined
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date)
}

function DateTimePicker({
  id,
  value,
  onChange,
  placeholder = "Pick a date & time",
  className,
  "aria-invalid": ariaInvalid,
  minDate,
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [viewMonth, setViewMonth] = React.useState(() => value ?? new Date())

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)
    if (nextOpen) setViewMonth(value ?? new Date())
  }

  const current = value ?? new Date()

  // The calendar only blocks whole days before `minDate`; picking a time on
  // the boundary day could still land before it, so clamp up to `minDate`.
  function applyMinDate(date: Date): Date {
    return minDate && date < minDate ? new Date(minDate) : date
  }

  function handleDateSelect(day: Date) {
    const next = new Date(current)
    next.setFullYear(day.getFullYear(), day.getMonth(), day.getDate())
    onChange(applyMinDate(next))
  }

  function handleTimeChange(hour24: number, minute: number) {
    const next = new Date(current)
    next.setHours(hour24, minute, 0, 0)
    onChange(applyMinDate(next))
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger
        id={id}
        aria-invalid={ariaInvalid}
        className={cn(
          "flex h-8 w-full items-center gap-2 rounded-lg border border-input bg-transparent px-2.5 py-1 text-left text-sm text-foreground transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
          className,
        )}
      >
        <CalendarClockIcon className="size-4 shrink-0 text-muted-foreground" />
        <span className={cn(!value && "text-muted-foreground")}>
          {formatDateTime(value) ?? placeholder}
        </span>
      </PopoverTrigger>
      <PopoverContent>
        <div className="flex flex-col gap-3">
          <div className="flex gap-3">
            <Calendar
              selected={value}
              month={viewMonth}
              onMonthChange={setViewMonth}
              onSelect={handleDateSelect}
              minDate={minDate}
            />
            <div className="w-px self-stretch bg-border" />
            <TimeClockPicker
              hour24={current.getHours()}
              minute={current.getMinutes()}
              onChange={handleTimeChange}
            />
          </div>
          <Button
            type="button"
            size="sm"
            className="self-end"
            onClick={() => setOpen(false)}
          >
            Done
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export { DateTimePicker }
