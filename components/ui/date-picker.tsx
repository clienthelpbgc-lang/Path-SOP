"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

type DatePickerProps = {
  id?: string
  value?: Date
  onChange: (date: Date) => void
  placeholder?: string
  className?: string
  "aria-invalid"?: boolean
}

function formatDate(date?: Date): string | undefined {
  if (!date) return undefined
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date)
}

function DatePicker({
  id,
  value,
  onChange,
  placeholder = "Pick a date",
  className,
  "aria-invalid": ariaInvalid,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [viewMonth, setViewMonth] = React.useState(() => value ?? new Date())

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)
    if (nextOpen) setViewMonth(value ?? new Date())
  }

  function handleSelect(day: Date) {
    onChange(day)
    setOpen(false)
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
        <CalendarIcon className="size-4 shrink-0 text-muted-foreground" />
        <span className={cn(!value && "text-muted-foreground")}>
          {formatDate(value) ?? placeholder}
        </span>
      </PopoverTrigger>
      <PopoverContent>
        <Calendar
          selected={value}
          month={viewMonth}
          onMonthChange={setViewMonth}
          onSelect={handleSelect}
        />
      </PopoverContent>
    </Popover>
  )
}

export { DatePicker }
