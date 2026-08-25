"use client";

import { useEffect, useId, useState } from "react";
import { Bell, Mail, MessageCircle, Plus, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { ReminderChannel } from "@/features/task/constants/reminder-channel.constant";
import type { ReminderAnchor } from "@/features/task/constants/reminder-anchor.constant";
import {
  formatMinutesDuration,
  formatReminderOffset,
} from "@/features/task/utils/format-reminder-offset";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type ReminderDraft = {
  channel: ReminderChannel;
  anchor: ReminderAnchor;
  offsetMinutes: number;
};

const MAX_BEFORE_MINUTES = 24 * 60;
const PRESET_MINUTES = [10, 20, 30] as const;

const CHANNEL_LABELS: Record<ReminderChannel, string> = {
  whatsapp: "WhatsApp",
  email: "Email",
};

const CHANNEL_ICONS: Record<ReminderChannel, LucideIcon> = {
  whatsapp: MessageCircle,
  email: Mail,
};

type ChannelSelection = ReminderChannel | "both";

const CHANNEL_SELECTIONS: ChannelSelection[] = ["whatsapp", "email", "both"];

type CustomUnit = "minutes" | "hours";

const UNIT_TO_MINUTES: Record<CustomUnit, number> = { minutes: 1, hours: 60 };

// Reminders only ever fire before the due date, so the usable window is
// bounded by how far the due date actually is from the start date -- a
// same-day (or very short) task can't sensibly carry a "1 day before"
// reminder because that would land before the task even starts. When there
// are no concrete dates to compare (e.g. editing a template, which has no
// start/due date of its own), the only limit is the fixed 1-day ceiling.
function computeMaxBeforeMinutes(startAt?: Date, dueAt?: Date): number {
  if (!startAt || !dueAt) return MAX_BEFORE_MINUTES;

  const rawMinutes = Math.floor((dueAt.getTime() - startAt.getTime()) / 60_000);
  return Math.max(0, Math.min(MAX_BEFORE_MINUTES, rawMinutes));
}

type ReminderFieldsetProps = {
  reminders: ReminderDraft[];
  onChange: (reminders: ReminderDraft[]) => void;
  startAt?: Date;
  dueAt?: Date;
};

export function ReminderFieldset({
  reminders,
  onChange,
  startAt,
  dueAt,
}: ReminderFieldsetProps) {
  const maxBeforeMinutes = computeMaxBeforeMinutes(startAt, dueAt);

  // Keep previously-added reminders valid if the start/due window shrinks
  // (e.g. the user pulls the due date in after already adding a reminder).
  useEffect(() => {
    const stillValid = reminders.filter(
      (reminder) => Math.abs(reminder.offsetMinutes) <= maxBeforeMinutes,
    );
    if (stillValid.length !== reminders.length) {
      onChange(stillValid);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxBeforeMinutes]);

  const [open, setOpen] = useState(false);
  const [channelSelection, setChannelSelection] =
    useState<ChannelSelection>("whatsapp");
  const [selectedMinutes, setSelectedMinutes] = useState<number | "custom">(
    PRESET_MINUTES[0],
  );
  const [customAmount, setCustomAmount] = useState("30");
  const [customUnit, setCustomUnit] = useState<CustomUnit>("minutes");
  const amountId = useId();

  function resetDraft() {
    setChannelSelection("whatsapp");
    setSelectedMinutes(PRESET_MINUTES[0]);
    setCustomAmount("30");
    setCustomUnit("minutes");
  }

  const customMinutes = Math.round(
    Number(customAmount) * UNIT_TO_MINUTES[customUnit],
  );
  const customValid =
    Number.isFinite(customMinutes) && customMinutes > 0 && customMinutes <= maxBeforeMinutes;

  const chosenMinutes = selectedMinutes === "custom" ? customMinutes : selectedMinutes;
  const canAdd =
    maxBeforeMinutes > 0 &&
    (selectedMinutes === "custom" ? customValid : chosenMinutes <= maxBeforeMinutes);

  function handleAdd() {
    if (!canAdd) return;

    const channels: ReminderChannel[] =
      channelSelection === "both" ? ["whatsapp", "email"] : [channelSelection];

    const additions = channels
      .map((channel) => ({
        channel,
        anchor: "due" as const,
        offsetMinutes: -chosenMinutes,
      }))
      .filter(
        (candidate) =>
          !reminders.some(
            (existing) =>
              existing.channel === candidate.channel &&
              existing.anchor === candidate.anchor &&
              existing.offsetMinutes === candidate.offsetMinutes,
          ),
      );

    if (additions.length > 0) {
      onChange([...reminders, ...additions]);
    }
    resetDraft();
    setOpen(false);
  }

  function handleRemove(index: number) {
    onChange(reminders.filter((_, itemIndex) => itemIndex !== index));
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Label>
        Reminders{" "}
        <span className="font-normal text-muted-foreground">(optional)</span>
      </Label>

      {reminders.length > 0 && (
        <ul className="flex flex-col gap-1.5">
          {reminders.map((reminder, index) => {
            const Icon = CHANNEL_ICONS[reminder.channel];

            return (
              <li
                key={index}
                className="flex items-center gap-2.5 rounded-lg border border-border bg-muted/40 py-1.5 pr-1.5 pl-2"
              >
                <Icon className="size-4 shrink-0 text-muted-foreground" />
                <span className="flex-1 text-sm text-foreground">
                  {CHANNEL_LABELS[reminder.channel]} ·{" "}
                  {formatReminderOffset(reminder.offsetMinutes)} due date
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  aria-label="Remove reminder"
                  onClick={() => handleRemove(index)}
                >
                  <X />
                </Button>
              </li>
            );
          })}
        </ul>
      )}

      {maxBeforeMinutes <= 0 ? (
        <p className="text-xs text-muted-foreground">
          Set a start date earlier than the due date to enable reminders.
        </p>
      ) : (
        <Popover
          open={open}
          onOpenChange={(nextOpen) => {
            setOpen(nextOpen);
            if (!nextOpen) resetDraft();
          }}
        >
          <PopoverTrigger
            render={<Button type="button" variant="outline" size="sm" className="self-start" />}
          >
            <Bell />
            Add reminder
          </PopoverTrigger>

          <PopoverContent className="w-72">
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <Label>Where should we remind you?</Label>
                <div className="grid grid-cols-3 gap-1.5">
                  {CHANNEL_SELECTIONS.map((value) => {
                    const selected = channelSelection === value;
                    const label = value === "both" ? "Both" : CHANNEL_LABELS[value];

                    return (
                      <button
                        key={value}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => setChannelSelection(value)}
                        className={cn(
                          "flex items-center justify-center rounded-lg border border-input py-2 text-xs font-medium transition-colors",
                          selected
                            ? "border-primary bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground",
                        )}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label>When should we remind you?</Label>
                <div className="grid grid-cols-4 gap-1.5">
                  {PRESET_MINUTES.map((minutes) => {
                    const disabled = minutes > maxBeforeMinutes;
                    const selected = selectedMinutes === minutes;

                    return (
                      <button
                        key={minutes}
                        type="button"
                        disabled={disabled}
                        aria-pressed={selected}
                        onClick={() => setSelectedMinutes(minutes)}
                        className={cn(
                          "rounded-lg border border-input py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40",
                          selected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground",
                        )}
                      >
                        {minutes}m
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    aria-pressed={selectedMinutes === "custom"}
                    onClick={() => setSelectedMinutes("custom")}
                    className={cn(
                      "rounded-lg border border-input py-1.5 text-xs font-medium transition-colors",
                      selectedMinutes === "custom"
                        ? "border-primary bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    Custom
                  </button>
                </div>

                {selectedMinutes === "custom" && (
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5">
                      <Input
                        id={amountId}
                        type="number"
                        min={1}
                        step={1}
                        aria-invalid={!customValid}
                        className="w-16"
                        value={customAmount}
                        onChange={(event) => setCustomAmount(event.target.value)}
                      />
                      <Select
                        value={customUnit}
                        onValueChange={(value) => {
                          if (value) setCustomUnit(value as CustomUnit);
                        }}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="minutes">Minutes</SelectItem>
                          <SelectItem value="hours">Hours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Up to {formatMinutesDuration(maxBeforeMinutes)} before
                      due
                      {startAt && dueAt
                        ? ", based on this task's start and due dates."
                        : "."}
                    </p>
                  </div>
                )}
              </div>

              <Button type="button" size="sm" disabled={!canAdd} onClick={handleAdd}>
                <Plus />
                Add reminder
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
