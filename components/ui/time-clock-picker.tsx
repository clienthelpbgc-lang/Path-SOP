"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

type Period = "AM" | "PM"

type TimeClockPickerProps = {
  hour24: number
  minute: number
  onChange: (hour24: number, minute: number) => void
  className?: string
}

const CENTER = 110
const FACE_RADIUS = 100
const NUMBER_RADIUS = 80

// 0deg = 12 o'clock, increasing clockwise — matches how clock hands read.
function polarPoint(angleDeg: number, radius: number) {
  const angleRad = (angleDeg * Math.PI) / 180
  return {
    x: CENTER + radius * Math.sin(angleRad),
    y: CENTER - radius * Math.cos(angleRad),
  }
}

function angleFromPointer(dx: number, dy: number): number {
  let angle = (Math.atan2(dx, -dy) * 180) / Math.PI
  if (angle < 0) angle += 360
  return angle
}

function TimeClockPicker({
  hour24,
  minute,
  onChange,
  className,
}: TimeClockPickerProps) {
  const [mode, setMode] = React.useState<"hour" | "minute">("hour")
  const svgRef = React.useRef<SVGSVGElement>(null)
  const draggingRef = React.useRef(false)

  const period: Period = hour24 >= 12 ? "PM" : "AM"
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12

  function applyAngle(angleDeg: number) {
    if (mode === "hour") {
      const step = 360 / 12
      let picked = Math.round(angleDeg / step) % 12
      if (picked === 0) picked = 12
      const nextHour24 =
        period === "PM"
          ? picked === 12
            ? 12
            : picked + 12
          : picked === 12
            ? 0
            : picked
      onChange(nextHour24, minute)
    } else {
      const step = 360 / 60
      let picked = Math.round(angleDeg / step) % 60
      if (picked < 0) picked += 60
      onChange(hour24, picked)
    }
  }

  function handlePointer(clientX: number, clientY: number) {
    const svg = svgRef.current
    if (!svg) return
    const rect = svg.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    applyAngle(angleFromPointer(clientX - cx, clientY - cy))
  }

  function handlePointerDown(event: React.PointerEvent<SVGSVGElement>) {
    draggingRef.current = true
    event.currentTarget.setPointerCapture(event.pointerId)
    handlePointer(event.clientX, event.clientY)
  }

  function handlePointerMove(event: React.PointerEvent<SVGSVGElement>) {
    if (!draggingRef.current) return
    handlePointer(event.clientX, event.clientY)
  }

  function handlePointerUp() {
    if (draggingRef.current && mode === "hour") {
      setMode("minute")
    }
    draggingRef.current = false
  }

  function setPeriod(next: Period) {
    if (next === period) return
    const nextHour24 = next === "PM" ? hour24 + 12 : hour24 - 12
    onChange(((nextHour24 % 24) + 24) % 24, minute)
  }

  const handAngle =
    mode === "hour" ? ((hour12 % 12) / 12) * 360 : (minute / 60) * 360
  const handEnd = polarPoint(handAngle, NUMBER_RADIUS)

  const numbers =
    mode === "hour"
      ? Array.from({ length: 12 }, (_, index) => index + 1).map((value) => ({
          value,
          label: String(value),
          selected: value === hour12,
        }))
      : Array.from({ length: 12 }, (_, index) => index * 5).map((value) => ({
          value,
          label: String(value).padStart(2, "0"),
          selected: value === minute,
        }))

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => setMode("hour")}
          className={cn(
            "rounded-md px-2 py-1 text-2xl font-semibold tabular-nums transition-colors",
            mode === "hour"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted",
          )}
        >
          {String(hour12).padStart(2, "0")}
        </button>
        <span className="text-2xl font-semibold text-muted-foreground">:</span>
        <button
          type="button"
          onClick={() => setMode("minute")}
          className={cn(
            "rounded-md px-2 py-1 text-2xl font-semibold tabular-nums transition-colors",
            mode === "minute"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted",
          )}
        >
          {String(minute).padStart(2, "0")}
        </button>

        <div className="ml-2 flex flex-col overflow-hidden rounded-md border border-input text-xs font-medium">
          <button
            type="button"
            onClick={() => setPeriod("AM")}
            className={cn(
              "px-1.5 py-0.5 transition-colors",
              period === "AM"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted",
            )}
          >
            AM
          </button>
          <button
            type="button"
            onClick={() => setPeriod("PM")}
            className={cn(
              "px-1.5 py-0.5 transition-colors",
              period === "PM"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted",
            )}
          >
            PM
          </button>
        </div>
      </div>

      <svg
        ref={svgRef}
        viewBox="0 0 220 220"
        className="size-56 touch-none select-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <circle
          cx={CENTER}
          cy={CENTER}
          r={FACE_RADIUS}
          className="fill-muted"
        />
        <line
          x1={CENTER}
          y1={CENTER}
          x2={handEnd.x}
          y2={handEnd.y}
          className="stroke-primary"
          strokeWidth={2}
        />
        <circle cx={CENTER} cy={CENTER} r={3} className="fill-primary" />
        <circle
          cx={handEnd.x}
          cy={handEnd.y}
          r={15}
          className="fill-primary"
        />
        {numbers.map(({ value, label, selected }) => {
          const { x, y } = polarPoint(
            mode === "hour" ? ((value % 12) / 12) * 360 : (value / 60) * 360,
            NUMBER_RADIUS,
          )

          return (
            <text
              key={value}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="central"
              className={cn(
                "cursor-default text-sm font-medium",
                selected ? "fill-primary-foreground" : "fill-foreground",
              )}
            >
              {label}
            </text>
          )
        })}
      </svg>
    </div>
  )
}

export { TimeClockPicker }
