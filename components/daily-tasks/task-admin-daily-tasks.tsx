"use client";

import { useState } from "react";
import { CheckCircle2, Inbox, ListChecks, XCircle } from "lucide-react";

import { useDailyTasks } from "@/features/daily-task/hooks";
import type { DailyTask } from "@/features/daily-task/types";
import type { TaskPriority } from "@/features/daily-task/constants/priority.constant";
import { formatAssignedAt } from "@/features/daily-task/utils";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PagePlaceholder } from "@/components/layout/page-placeholder";
import {
  PriorityBadge,
  StatusBadge,
} from "@/components/daily-tasks/daily-task-badges";
import { EditDailyTaskDialog } from "@/components/daily-tasks/edit-daily-task-dialog";
import { DeleteDailyTaskDialog } from "@/components/daily-tasks/delete-daily-task-dialog";
import { ReviewTaskDialog } from "@/components/daily-tasks/review-task-dialog";

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-0.5">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      {children}
    </div>
  );
}

function TaskRowsSkeleton() {
  return (
    <>
      {Array.from({ length: 3 }).map((_, index) => (
        <TableRow key={index} className="hover:bg-transparent">
          <TableCell colSpan={5}>
            <div className="h-5 w-full animate-pulse rounded bg-muted" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

function PendingTasksSection({ currentUserId }: { currentUserId: string }) {
  const { data, isLoading } = useDailyTasks({ status: "PENDING", limit: 50 });
  const tasks = data?.data ?? [];

  return (
    <Section
      title="Pending"
      description="Tasks not yet started. Edit details or delete before work begins."
    >
      {!isLoading && tasks.length === 0 ? (
        <PagePlaceholder
          icon={Inbox}
          title="No pending tasks"
          description="Tasks you assign will show up here until they're started."
        />
      ) : (
        <div className="rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Title</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Assigned at</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TaskRowsSkeleton />
              ) : (
                tasks.map((task) => (
                  <TableRow key={task.id} className="hover:bg-transparent">
                    <TableCell className="max-w-xs truncate font-medium text-foreground">
                      {task.title}
                    </TableCell>
                    <TableCell>
                      <PriorityBadge priority={task.priority as TaskPriority} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatAssignedAt(task.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      {task.assignedBy === currentUserId ? (
                        <div className="flex justify-end gap-1">
                          <EditDailyTaskDialog task={task} />
                          <DeleteDailyTaskDialog
                            taskId={task.id}
                            taskTitle={task.title}
                          />
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Assigned by another admin
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </Section>
  );
}

function SubmittedTasksSection({ currentUserId }: { currentUserId: string }) {
  const { data, isLoading } = useDailyTasks({
    status: "SUBMITTED",
    limit: 50,
  });
  const tasks = data?.data ?? [];
  const [reviewing, setReviewing] = useState<{
    task: DailyTask;
    action: "COMPLETED" | "REJECTED";
  } | null>(null);

  return (
    <Section
      title="Submitted"
      description="Awaiting your review. Approve to complete, or reject to send back."
    >
      {!isLoading && tasks.length === 0 ? (
        <PagePlaceholder
          icon={ListChecks}
          title="No submissions awaiting review"
          description="Tasks submitted by assignees will show up here."
        />
      ) : (
        <div className="rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Title</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned at</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TaskRowsSkeleton />
              ) : (
                tasks.map((task) => (
                  <TableRow key={task.id} className="hover:bg-transparent">
                    <TableCell className="max-w-xs truncate font-medium text-foreground">
                      {task.title}
                    </TableCell>
                    <TableCell>
                      <PriorityBadge priority={task.priority as TaskPriority} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={task.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatAssignedAt(task.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      {task.assignedBy === currentUserId ? (
                        <div className="flex justify-end gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-emerald-200 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 dark:border-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-400 dark:hover:bg-emerald-500/25"
                            onClick={() =>
                              setReviewing({ task, action: "COMPLETED" })
                            }
                          >
                            <CheckCircle2 />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() =>
                              setReviewing({ task, action: "REJECTED" })
                            }
                          >
                            <XCircle />
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Assigned by another admin
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <ReviewTaskDialog
        taskId={reviewing?.task.id ?? ""}
        taskTitle={reviewing?.task.title ?? ""}
        action={reviewing?.action ?? null}
        onOpenChange={(action) => {
          if (!action) setReviewing(null);
        }}
      />
    </Section>
  );
}

export function TaskAdminDailyTasks({
  currentUserId,
}: {
  currentUserId: string;
}) {
  return (
    <div className="flex flex-col gap-6">
      <PendingTasksSection currentUserId={currentUserId} />
      <SubmittedTasksSection currentUserId={currentUserId} />
    </div>
  );
}
