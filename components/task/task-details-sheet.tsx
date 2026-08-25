"use client";

import {
  Bell,
  CalendarClock,
  CheckCircle2,
  Circle,
  FileIcon,
  Repeat,
} from "lucide-react";

import { useTask } from "@/features/task/hooks";
import type { ReminderAnchor } from "@/features/task/constants/reminder-anchor.constant";
import type { ReminderChannel } from "@/features/task/constants/reminder-channel.constant";
import type { RepeatUnit } from "@/features/task/constants/repeat-unit.constant";
import { formatReminderOffset } from "@/features/task/utils/format-reminder-offset";
import {
  TaskStatusBadge,
  getEffectiveTaskStatus,
} from "@/components/task/task-status-badge";
import { formatFileSize } from "@/lib/format-file-size";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const REPEAT_UNIT_LABELS: Record<RepeatUnit, string> = {
  day: "day(s)",
  week: "week(s)",
  month: "month(s)",
};

const REMINDER_ANCHOR_LABELS: Record<ReminderAnchor, string> = {
  start: "start",
  due: "due",
};

const REMINDER_CHANNEL_LABELS: Record<ReminderChannel, string> = {
  whatsapp: "WhatsApp",
  email: "Email",
};

function formatDateTime(value: string | Date) {
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDate(value: string | Date) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function DetailField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="text-foreground">{children}</div>
    </div>
  );
}

function PartyRow({ name, email }: { name: string; email: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <Avatar size="sm">
        <AvatarFallback>{initials(name)}</AvatarFallback>
      </Avatar>
      <div className="flex min-w-0 flex-col">
        <span className="truncate text-sm font-medium text-foreground">
          {name}
        </span>
        <span className="truncate text-xs text-muted-foreground">
          {email}
        </span>
      </div>
    </div>
  );
}

function DetailsSkeleton() {
  return (
    <div className="flex flex-col gap-5 p-4">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="h-5 w-full animate-pulse rounded bg-muted" />
      ))}
    </div>
  );
}

type TaskDetailsSheetProps = {
  taskId: string | null;
  onOpenChange: (open: boolean) => void;
};

export function TaskDetailsSheet({
  taskId,
  onOpenChange,
}: TaskDetailsSheetProps) {
  const { data: task, isLoading } = useTask(taskId ?? "");

  return (
    <Sheet open={taskId !== null} onOpenChange={onOpenChange}>
      <SheetContent className="w-full min-w-[320px] gap-0 overflow-y-auto p-0 data-[side=right]:sm:w-1/2 data-[side=right]:sm:max-w-none">
        {isLoading || !task ? (
          <DetailsSkeleton />
        ) : (
          <>
            <SheetHeader className="gap-2 p-5 pr-10">
              <TaskStatusBadge
                status={getEffectiveTaskStatus(task)}
                className="w-fit"
              />
              <SheetTitle className="text-lg leading-snug break-words">
                {task.title}
              </SheetTitle>
              <SheetDescription>
                Created by {task.creator.name} on{" "}
                {formatDateTime(task.createdAt)}
              </SheetDescription>
            </SheetHeader>

            <Separator />

            <div className="flex flex-col gap-5 p-5">
              {task.description && (
                <DetailField label="Description">
                  <p className="whitespace-pre-wrap text-sm">
                    {task.description}
                  </p>
                </DetailField>
              )}

              <div className="grid grid-cols-2 gap-4">
                <DetailField label="Assignee">
                  <PartyRow
                    name={task.assignee.name}
                    email={task.assignee.email}
                  />
                </DetailField>

                <DetailField label="Weightage">
                  <span className="text-sm">{task.weightage}</span>
                </DetailField>

                <DetailField label="Start date">
                  <span className="text-sm">
                    {formatDateTime(task.startAt)}
                  </span>
                </DetailField>

                <DetailField label="Due date">
                  <span className="text-sm">{formatDateTime(task.dueAt)}</span>
                </DetailField>
              </div>

              {task.status === "completed" && (
                <div className="grid grid-cols-2 gap-4 rounded-lg border border-border bg-muted/30 p-3">
                  {task.completedAt && (
                    <DetailField label="Completed at">
                      <span className="text-sm">
                        {formatDateTime(task.completedAt)}
                      </span>
                    </DetailField>
                  )}
                  {task.completionRemarks && (
                    <div className="col-span-2">
                      <DetailField label="Completion remarks">
                        <p className="whitespace-pre-wrap text-sm">
                          {task.completionRemarks}
                        </p>
                      </DetailField>
                    </div>
                  )}
                </div>
              )}

              {task.isRepeating && (
                <div className="grid grid-cols-2 gap-4 rounded-lg border border-border bg-muted/30 p-3">
                  <div className="col-span-2 flex items-center gap-1.5 text-sm font-medium text-foreground">
                    <Repeat className="size-3.5 text-muted-foreground" />
                    Repeating task
                  </div>

                  <DetailField label="Frequency">
                    <span className="text-sm">
                      Every {task.repeatInterval}{" "}
                      {REPEAT_UNIT_LABELS[task.repeatUnit as RepeatUnit]}
                    </span>
                  </DetailField>

                  {task.nextRunAt && (
                    <DetailField label="Next occurrence">
                      <span className="text-sm">
                        {formatDateTime(task.nextRunAt)}
                      </span>
                    </DetailField>
                  )}

                  {task.repeatUnit === "week" &&
                    task.repeatDaysOfWeek &&
                    task.repeatDaysOfWeek.length > 0 && (
                      <div className="col-span-2">
                        <DetailField label="Repeats on">
                          <div className="flex flex-wrap gap-1">
                            {task.repeatDaysOfWeek.map((day) => (
                              <Badge key={day} variant="outline">
                                {WEEKDAY_LABELS[day]}
                              </Badge>
                            ))}
                          </div>
                        </DetailField>
                      </div>
                    )}

                  <DetailField label="Ends">
                    <span className="text-sm">
                      {task.repeatEndsAt
                        ? formatDate(task.repeatEndsAt)
                        : "Never"}
                    </span>
                  </DetailField>
                </div>
              )}

              {task.checklistItems.length > 0 && (
                <DetailField
                  label={`Checklist (${task.checklistItems.filter((item) => item.isDone).length}/${task.checklistItems.length})`}
                >
                  <ul className="flex flex-col gap-1.5">
                    {task.checklistItems.map((item) => (
                      <li
                        key={item.id}
                        className="flex items-center gap-2 text-sm"
                      >
                        {item.isDone ? (
                          <CheckCircle2 className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <Circle className="size-4 shrink-0 text-muted-foreground" />
                        )}
                        <span
                          className={cn(
                            item.isDone &&
                              "text-muted-foreground line-through",
                          )}
                        >
                          {item.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </DetailField>
              )}

              {task.attachments.length > 0 && (
                <DetailField label={`Attachments (${task.attachments.length})`}>
                  <ul className="flex flex-col gap-1.5">
                    {task.attachments.map((attachment) => (
                      <li
                        key={attachment.id}
                        className="flex items-center gap-2.5 rounded-lg border border-border bg-muted/40 px-2 py-1.5"
                      >
                        <FileIcon className="size-4 shrink-0 text-muted-foreground" />
                        <span className="flex min-w-0 flex-1 flex-col">
                          <span className="truncate text-sm font-medium text-foreground">
                            {attachment.fileName}
                          </span>
                          <span className="truncate text-xs text-muted-foreground">
                            {[
                              attachment.sizeBytes === null
                                ? null
                                : formatFileSize(attachment.sizeBytes),
                              formatDate(attachment.createdAt),
                            ]
                              .filter(Boolean)
                              .join(" · ")}
                          </span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </DetailField>
              )}

              {task.watchers.length > 0 && (
                <DetailField label="In the loop">
                  <div className="flex flex-col gap-2">
                    {task.watchers.map((watcher) => (
                      <PartyRow
                        key={watcher.userId}
                        name={watcher.user.name}
                        email={watcher.user.email}
                      />
                    ))}
                  </div>
                </DetailField>
              )}

              {task.reminders.length > 0 && (
                <DetailField label="Reminders">
                  <ul className="flex flex-col gap-1.5">
                    {task.reminders.map((reminder) => (
                      <li
                        key={reminder.id}
                        className="flex items-center gap-2 text-sm"
                      >
                        <Bell className="size-3.5 shrink-0 text-muted-foreground" />
                        <span>
                          {
                            REMINDER_CHANNEL_LABELS[
                              reminder.channel as ReminderChannel
                            ]
                          }{" "}
                          {formatReminderOffset(reminder.offsetMinutes)}{" "}
                          {
                            REMINDER_ANCHOR_LABELS[
                              reminder.anchor as ReminderAnchor
                            ]
                          }{" "}
                          · {formatDateTime(reminder.scheduledAt)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </DetailField>
              )}

              <Separator />

              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <CalendarClock className="size-3.5" />
                Last updated {formatDateTime(task.updatedAt)}
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
