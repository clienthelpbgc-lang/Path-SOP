import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { tasks } from "@/features/task/schema";
import type { TaskWithRelations } from "@/features/task/types";
import { taskIdSchema } from "@/features/task/validators";
import { NotFoundError, ValidationError } from "@/lib/errors";

const PARTY_COLUMNS = { id: true, name: true, email: true } as const;

export async function getTaskById(
  companyId: string,
  id: string,
): Promise<TaskWithRelations> {
  const idResult = taskIdSchema.safeParse(id);

  if (!idResult.success) {
    throw new ValidationError(
      "Invalid task id.",
      z.flattenError(idResult.error).fieldErrors,
    );
  }

  const task = await db.query.tasks.findFirst({
    where: and(eq(tasks.id, idResult.data), eq(tasks.companyId, companyId)),
    with: {
      assignee: { columns: PARTY_COLUMNS },
      creator: { columns: PARTY_COLUMNS },
      checklistItems: { orderBy: (item, { asc: ascending }) => ascending(item.sortOrder) },
      attachments: { orderBy: (attachment, { desc }) => desc(attachment.createdAt) },
      reminders: { orderBy: (reminder, { asc: ascending }) => ascending(reminder.scheduledAt) },
      watchers: { with: { user: { columns: PARTY_COLUMNS } } },
    },
  });

  if (!task) {
    throw new NotFoundError("Task not found.");
  }

  return task;
}
