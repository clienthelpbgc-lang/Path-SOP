import { and, eq, isNotNull, lte } from "drizzle-orm";

import { systemDb } from "@/db";
import { computeNextRunAt } from "@/features/task/service/recurrence";
import { computeReminderScheduledAt } from "@/features/task/service/reminder-schedule";
import {
  taskChecklistItems,
  taskReminders,
  taskWatchers,
  tasks,
} from "@/features/task/schema";
import type { Task } from "@/features/task/types";

async function spawnNextOccurrence(task: Task): Promise<string | null> {
  if (
    !task.nextRunAt ||
    !task.repeatUnit ||
    !task.repeatInterval
  ) {
    return null;
  }

  const startAt = task.nextRunAt;
  const durationMs = task.dueAt.getTime() - task.startAt.getTime();
  const dueAt = new Date(startAt.getTime() + durationMs);

  const nextRunAt = computeNextRunAt({
    startAt,
    repeatUnit: task.repeatUnit,
    repeatInterval: task.repeatInterval,
    repeatDaysOfWeek: task.repeatDaysOfWeek,
    repeatEndsAt: task.repeatEndsAt,
  });

  return systemDb.transaction(async (tx) => {
    const [created] = await tx
      .insert(tasks)
      .values({
        companyId: task.companyId,
        title: task.title,
        description: task.description,
        assignedTo: task.assignedTo,
        createdBy: task.createdBy,
        templateId: task.templateId,
        seriesParentId: task.seriesParentId ?? task.id,
        weightage: task.weightage,
        startAt,
        dueAt,
        isRepeating: true,
        repeatUnit: task.repeatUnit,
        repeatInterval: task.repeatInterval,
        repeatDaysOfWeek: task.repeatDaysOfWeek,
        repeatEndsAt: task.repeatEndsAt,
        nextRunAt,
      })
      .returning({ id: tasks.id });

    const [checklistItems, watchers, reminders] = await Promise.all([
      tx
        .select({
          text: taskChecklistItems.text,
          sortOrder: taskChecklistItems.sortOrder,
        })
        .from(taskChecklistItems)
        .where(eq(taskChecklistItems.taskId, task.id)),
      tx
        .select({ userId: taskWatchers.userId })
        .from(taskWatchers)
        .where(eq(taskWatchers.taskId, task.id)),
      tx
        .select({
          channel: taskReminders.channel,
          anchor: taskReminders.anchor,
          offsetMinutes: taskReminders.offsetMinutes,
        })
        .from(taskReminders)
        .where(eq(taskReminders.taskId, task.id)),
    ]);

    if (checklistItems.length > 0) {
      await tx.insert(taskChecklistItems).values(
        checklistItems.map((item) => ({ ...item, taskId: created.id })),
      );
    }

    if (watchers.length > 0) {
      await tx.insert(taskWatchers).values(
        watchers.map((watcher) => ({ ...watcher, taskId: created.id })),
      );
    }

    if (reminders.length > 0) {
      await tx.insert(taskReminders).values(
        reminders.map((reminder) => ({
          ...reminder,
          taskId: created.id,
          scheduledAt: computeReminderScheduledAt(
            reminder.anchor,
            reminder.offsetMinutes,
            startAt,
            dueAt,
          ),
        })),
      );
    }

    // Hands scheduling off to the new occurrence -- this row is done
    // spawning until/unless it's edited again.
    await tx.update(tasks).set({ nextRunAt: null }).where(eq(tasks.id, task.id));

    return created.id;
  });
}

export type GenerateRecurringTasksResult = {
  generatedCount: number;
  generatedTaskIds: string[];
  failedTaskIds: string[];
};

export async function generateRecurringTasks(
  now: Date = new Date(),
): Promise<GenerateRecurringTasksResult> {
  const dueTasks = await systemDb
    .select()
    .from(tasks)
    .where(
      and(eq(tasks.isRepeating, true), isNotNull(tasks.nextRunAt), lte(tasks.nextRunAt, now)),
    );

  const generatedTaskIds: string[] = [];
  const failedTaskIds: string[] = [];

  for (const task of dueTasks) {
    try {
      const createdId = await spawnNextOccurrence(task);
      if (createdId) generatedTaskIds.push(createdId);
    } catch (error) {
      console.error(`Failed to spawn next occurrence for task ${task.id}.`, error);
      failedTaskIds.push(task.id);
    }
  }

  return {
    generatedCount: generatedTaskIds.length,
    generatedTaskIds,
    failedTaskIds,
  };
}
