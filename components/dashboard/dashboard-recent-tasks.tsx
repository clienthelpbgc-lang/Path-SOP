import { ListTodo } from "lucide-react";

import type { DashboardRecentTask } from "@/features/dashboard/types";
import { LIST_CARD_HEIGHT } from "@/components/dashboard/constants";
import { PagePlaceholder } from "@/components/layout/page-placeholder";
import {
  getEffectiveTaskStatus,
  TaskStatusBadge,
} from "@/components/task/task-status-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getAvatarColor } from "@/lib/avatar";

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

export function DashboardRecentTasks({
  tasks,
}: {
  tasks: DashboardRecentTask[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recently Assigned Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <div className={`${LIST_CARD_HEIGHT} flex items-center justify-center`}>
            <PagePlaceholder
              icon={ListTodo}
              title="No tasks yet"
              description="Tasks assigned to you will show up here."
            />
          </div>
        ) : (
          <ScrollArea className={LIST_CARD_HEIGHT}>
            <ul className="flex flex-col gap-4 pr-3">
              {tasks.map((task) => (
                <li key={task.id} className="flex items-center gap-3">
                  <Avatar size="sm">
                    <AvatarFallback
                      className={`text-white ${getAvatarColor(task.assignedBy.id)}`}
                    >
                      {initials(task.assignedBy.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm font-medium text-foreground">
                      {task.title}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Assigned by {task.assignedBy.name} · Due{" "}
                      {formatDate(task.dueAt)}
                    </span>
                  </div>
                  <TaskStatusBadge
                    status={getEffectiveTaskStatus(task)}
                    className="shrink-0"
                  />
                </li>
              ))}
            </ul>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

export function DashboardRecentTasksSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recently Assigned Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className={`${LIST_CARD_HEIGHT} flex flex-col gap-4`}>
          {[0, 1, 2].map((i) => (
            <li key={i} className="flex items-center gap-3">
              <div className="size-8 shrink-0 animate-pulse rounded-full bg-muted" />
              <div className="flex flex-1 flex-col gap-2">
                <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
