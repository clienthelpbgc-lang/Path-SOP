"use client"

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] as const

function isSameDay(a: Date | undefined, b: Date | undefined): boolean {
  return (
    !!a &&
    !!b &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

type CalendarProps = {
  selected?: Date
  onSelect: (date: Date) => void
  month: Date
  onMonthChange: (date: Date) => void
  className?: string
  // Days before this one (compared by calendar day, not time) are rendered
  // disabled and can't be selected.
  minDate?: Date
}

function Calendar({
  selected,
  onSelect,
  month,
  onMonthChange,
  className,
  minDate,
}: CalendarProps) {
  const today = new Date()
  const minDay = minDate
    ? new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate())
    : undefined
  const year = month.getFullYear()
  const monthIndex = month.getMonth()
  const firstDayOfMonth = new Date(year, monthIndex, 1)
  const startOffset = firstDayOfMonth.getDay()
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()

  const cells: (number | null)[] = [
    ...Array.from({ length: startOffset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  return (
    <div className={cn("flex w-64 flex-col gap-2", className)}>
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          aria-label="Previous month"
          onClick={() => onMonthChange(new Date(year, monthIndex - 1, 1))}
        >
          <ChevronLeftIcon />
        </Button>
        <span className="text-sm font-medium text-foreground">
          {firstDayOfMonth.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          aria-label="Next month"
          onClick={() => onMonthChange(new Date(year, monthIndex + 1, 1))}
        >
          <ChevronRightIcon />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
        {WEEKDAY_LABELS.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, index) => {
          if (day === null) {
            return <span key={index} />
          }

          const cellDate = new Date(year, monthIndex, day)
          const isSelected = isSameDay(cellDate, selected)
          const isToday = isSameDay(cellDate, today)
          const isDisabled = !!minDay && cellDate < minDay

          return (
            <button
              key={index}
              type="button"
              disabled={isDisabled}
              onClick={() => onSelect(cellDate)}
              className={cn(
                "flex size-8 items-center justify-center rounded-md text-sm text-foreground transition-colors hover:bg-muted",
                isSelected &&
                  "bg-primary text-primary-foreground hover:bg-primary/90",
                !isSelected &&
                  isToday &&
                  "font-medium text-primary ring-1 ring-inset ring-primary",
                isDisabled &&
                  "cursor-not-allowed text-muted-foreground opacity-40 hover:bg-transparent",
              )}
            >
              {day}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export { Calendar }
