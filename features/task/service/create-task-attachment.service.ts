import { count, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { MAX_TASK_ATTACHMENTS } from "@/features/task/constants/attachment-limits.constant";
import {
  assertTaskEditable,
  assertTaskParticipant,
  getTaskScope,
} from "@/features/task/service/task-scope";
import { taskAttachments } from "@/features/task/schema";
import type { CreateTaskAttachmentInput, TaskAttachment } from "@/features/task/types";
import { createTaskAttachmentSchema } from "@/features/task/validators";
import { BadRequestError, ValidationError } from "@/lib/errors";
import { translateDatabaseError } from "@/lib/errors/db-error";

export async function createTaskAttachment(
  companyId: string,
  userId: string,
  taskId: string,
  input: Omit<CreateTaskAttachmentInput, "taskId">,
): Promise<TaskAttachment> {
  const result = createTaskAttachmentSchema
    .omit({ taskId: true })
    .safeParse(input);

  if (!result.success) {
    throw new ValidationError(
      "Invalid attachment data.",
      z.flattenError(result.error).fieldErrors,
    );
  }

  const task = await getTaskScope(companyId, taskId);

  assertTaskParticipant(task, userId);
  assertTaskEditable(task);

  const [{ value: existingCount }] = await db
    .select({ value: count() })
    .from(taskAttachments)
    .where(eq(taskAttachments.taskId, taskId));

  if (existingCount >= MAX_TASK_ATTACHMENTS) {
    throw new BadRequestError(
      `A task can have at most ${MAX_TASK_ATTACHMENTS} attachments.`,
    );
  }

  try {
    const [attachment] = await db
      .insert(taskAttachments)
      .values({ ...result.data, taskId, uploadedBy: userId })
      .returning();

    return attachment;
  } catch (error) {
    translateDatabaseError(error);
  }
}
