"use client";

import { Repeat } from "lucide-react";

import { REPEAT_UNITS, type RepeatUnit } from "@/features/task/constants/repeat-unit.constant";
import { REPEAT_UNIT_LABELS, WEEKDAYS } from "@/components/task/task-form-constants";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type TaskRepeatFieldsetProps = {
  isRepeating: boolean;
  onIsRepeatingChange: (value: boolean) => void;
  repeatUnit: RepeatUnit | undefined;
  onRepeatUnitChange: (value: RepeatUnit) => void;
  repeatInterval: number | undefined;
  onRepeatIntervalChange: (value: number) => void;
  repeatDaysOfWeek: number[] | undefined;
  onRepeatDaysOfWeekChange: (value: number[]) => void;
  // Templates have no end date of their own (only a task created from one
  // does), so both are omitted there and the "Ends on" field is hidden.
  repeatEndsAt?: Date | undefined;
  onRepeatEndsAtChange?: (value: Date | undefined) => void;
  errors?: {
    repeatUnit?: string;
    repeatInterval?: string;
    repeatDaysOfWeek?: string;
    repeatEndsAt?: string;
  };
};

// Repeat-schedule controls shared by the "New task" and "Edit task" forms.
// Takes plain value/onChange pairs rather than a react-hook-form `control` so
// it isn't coupled to either form's (differently-shaped) field types.
export function TaskRepeatFieldset({
  isRepeating,
  onIsRepeatingChange,
  repeatUnit,
  onRepeatUnitChange,
  repeatInterval,
  onRepeatIntervalChange,
  repeatDaysOfWeek,
  onRepeatDaysOfWeekChange,
  repeatEndsAt,
  onRepeatEndsAtChange,
  errors = {},
}: TaskRepeatFieldsetProps) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border p-3">
      <label className="group flex items-center gap-2.5 text-sm font-medium text-foreground">
        <Checkbox
          checked={isRepeating}
          onCheckedChange={(checked) => onIsRepeatingChange(checked === true)}
        />
        <Repeat className="size-4 text-muted-foreground" />
        Repeating task
      </label>

      {isRepeating && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="repeatInterval">Repeat every</Label>
            <div className="flex items-center gap-2">
              <Input
                id="repeatInterval"
                type="number"
                min={1}
                step={1}
                className="w-20"
                aria-invalid={!!errors.repeatInterval}
                value={repeatInterval ?? ""}
                onChange={(event) =>
                  onRepeatIntervalChange(Number(event.target.value))
                }
              />
              <Select
                value={repeatUnit ?? null}
                onValueChange={(value) => {
                  if (value) onRepeatUnitChange(value);
                }}
              >
                <SelectTrigger
                  aria-invalid={!!errors.repeatUnit}
                  className="flex-1"
                >
                  <SelectValue placeholder="Select a unit">
                    {(value: RepeatUnit | null) =>
                      value ? REPEAT_UNIT_LABELS[value] : "Select a unit"
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {REPEAT_UNITS.map((unit) => (
                    <SelectItem key={unit} value={unit}>
                      {REPEAT_UNIT_LABELS[unit]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {(errors.repeatInterval || errors.repeatUnit) && (
              <p className="text-xs text-destructive">
                {errors.repeatInterval ?? errors.repeatUnit}
              </p>
            )}
          </div>

          {repeatUnit === "week" && (
            <div className="flex flex-col gap-1.5">
              <Label>Repeat on</Label>
              <div
                role="group"
                aria-label="Repeat on days of week"
                className="grid grid-cols-7 gap-1.5"
              >
                {WEEKDAYS.map((day) => {
                  const selected = (repeatDaysOfWeek ?? []).includes(
                    day.value,
                  );

                  return (
                    <button
                      key={day.value}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => {
                        const current = repeatDaysOfWeek ?? [];
                        onRepeatDaysOfWeekChange(
                          selected
                            ? current.filter((d) => d !== day.value)
                            : [...current, day.value].sort((a, b) => a - b),
                        );
                      }}
                      className={cn(
                        "rounded-lg border border-input py-1.5 text-xs font-medium transition-colors",
                        selected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      {day.label}
                    </button>
                  );
                })}
              </div>
              {errors.repeatDaysOfWeek && (
                <p className="text-xs text-destructive">
                  {errors.repeatDaysOfWeek}
                </p>
              )}
            </div>
          )}

          {onRepeatEndsAtChange && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="repeatEndsAt">
                Ends on{" "}
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
              </Label>
              <DatePicker
                id="repeatEndsAt"
                value={repeatEndsAt}
                onChange={onRepeatEndsAtChange}
                aria-invalid={!!errors.repeatEndsAt}
                placeholder="No end date"
              />
              {errors.repeatEndsAt && (
                <p className="text-xs text-destructive">
                  {errors.repeatEndsAt}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
