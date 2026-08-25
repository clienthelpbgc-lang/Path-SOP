import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import type { ReminderAnchor } from "@/features/task/constants/reminder-anchor.constant";
import { taskReminders } from "@/features/task/schema";

type DbTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

const MINUTE_IN_MS = 60_000;

export function computeReminderScheduledAt(
  anchor: ReminderAnchor,
  offsetMinutes: number,
  startAt: Date,
  dueAt: Date,
): Date {
  const anchorAt = anchor === "start" ? startAt : dueAt;

  return new Date(anchorAt.getTime() + offsetMinutes * MINUTE_IN_MS);
}

export async function recomputeScheduledReminders(
  tx: DbTransaction,
  taskId: string,
  startAt: Date,
  dueAt: Date,
): Promise<void> {
  const scheduled = await tx
    .select({
      id: taskReminders.id,
      anchor: taskReminders.anchor,
      offsetMinutes: taskReminders.offsetMinutes,
    })
    .from(taskReminders)
    .where(
      and(
        eq(taskReminders.taskId, taskId),
        eq(taskReminders.status, "scheduled"),
      ),
    );

  await Promise.all(
    scheduled.map((reminder) =>
      tx
        .update(taskReminders)
        .set({
          scheduledAt: computeReminderScheduledAt(
            reminder.anchor,
            reminder.offsetMinutes,
            startAt,
            dueAt,
          ),
        })
        .where(eq(taskReminders.id, reminder.id)),
    ),
  );
}

export async function cancelScheduledReminders(
  tx: DbTransaction,
  taskId: string,
): Promise<void> {
  await tx
    .update(taskReminders)
    .set({ status: "cancelled" })
    .where(
      and(
        eq(taskReminders.taskId, taskId),
        eq(taskReminders.status, "scheduled"),
      ),
    );
}
