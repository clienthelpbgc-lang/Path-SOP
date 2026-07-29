"use client";

import { ClipboardList, Loader2, MessageSquare, UserRound } from "lucide-react";

import { useDailyTask } from "@/features/daily-task/hooks";
import type { TaskPriority } from "@/features/daily-task/constants/priority.constant";
import { formatAssignedAt } from "@/features/daily-task/utils";
import { cn } from "@/lib/utils";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PriorityBadge, StatusBadge } from "@/components/daily-tasks/daily-task-badges";

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function PartyRow({
  label,
  name,
  email,
}: {
  label: string;
  name: string;
  email: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Avatar size="sm" className="mt-0.5">
        <AvatarFallback>{getInitials(name)}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-sm font-medium text-foreground">{name}</span>
        <span className="text-xs text-muted-foreground">{email}</span>
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}

export function DailyTaskDetailsSheet({
  taskId,
  onOpenChange,
}: {
  taskId: string | null;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: task, isLoading, isError } = useDailyTask(taskId ?? "");

  return (
    <Sheet open={Boolean(taskId)} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col p-0 sm:max-w-lg">
        {isLoading && (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {!isLoading && isError && (
          <div className="flex flex-1 items-center justify-center p-6 text-center text-sm text-muted-foreground">
            Couldn&apos;t load this task. It may have been deleted.
          </div>
        )}

        {!isLoading && !isError && task && (
          <>
            <SheetHeader className="gap-3 border-b border-border pb-4">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <ClipboardList className="size-3.5" />
                Task details
              </div>
              <SheetTitle
                className={cn(
                  "text-lg leading-snug",
                  (task.status === "COMPLETED" ||
                    task.status === "REJECTED" ||
                    task.status === "MISSED") &&
                    "text-muted-foreground line-through decoration-muted-foreground/50",
                )}
              >
                {task.title}
              </SheetTitle>
              <div className="flex items-center gap-2">
                <StatusBadge status={task.status} />
                <PriorityBadge priority={task.priority as TaskPriority} />
              </div>
              <SheetDescription className="sr-only">
                Details for task {task.title}
              </SheetDescription>
            </SheetHeader>

            <ScrollArea className="flex-1">
              <div className="flex flex-col gap-6 p-4">
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-muted-foreground">
                    Description
                  </span>
                  <p className="text-sm whitespace-pre-wrap text-foreground">
                    {task.description || (
                      <span className="text-muted-foreground">
                        No description provided.
                      </span>
                    )}
                  </p>
                </div>

                <Separator />

                <div className="flex flex-col gap-4">
                  <PartyRow
                    label="Assigned to"
                    name={task.assignee.name}
                    email={task.assignee.email}
                  />
                  <PartyRow
                    label="Assigned by"
                    name={task.assigner.name}
                    email={task.assigner.email}
                  />
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <DetailRow
                    label="Due date"
                    value={formatAssignedAt(task.dueDate)}
                  />
                  <DetailRow
                    label="Created"
                    value={formatAssignedAt(task.createdAt)}
                  />
                  <DetailRow
                    label="Last updated"
                    value={formatAssignedAt(task.updatedAt)}
                  />
                </div>

                <Separator />

                <div className="flex flex-col gap-4">
                  <div className="flex items-start gap-3">
                    <UserRound className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs text-muted-foreground">
                        User remark
                      </span>
                      <p className="text-sm whitespace-pre-wrap text-foreground">
                        {task.userRemark || (
                          <span className="text-muted-foreground">
                            No remark yet.
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MessageSquare className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs text-muted-foreground">
                        Admin remark
                      </span>
                      <p className="text-sm whitespace-pre-wrap text-foreground">
                        {task.adminRemark || (
                          <span className="text-muted-foreground">
                            No remark yet.
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
