import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { taskAttachments } from "@/features/task/schema";
import { deleteAttachmentFiles } from "@/features/task/service/attachment-storage";
import { assertTaskParticipant, getTaskScope } from "@/features/task/service/task-scope";
import type { TaskAttachment } from "@/features/task/types";
import { taskAttachmentIdSchema } from "@/features/task/validators";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { translateDatabaseError } from "@/lib/errors/db-error";

export async function deleteTaskAttachment(
  companyId: string,
  userId: string,
  taskId: string,
  attachmentId: string,
): Promise<TaskAttachment> {
  const idResult = taskAttachmentIdSchema.safeParse(attachmentId);

  if (!idResult.success) {
    throw new ValidationError(
      "Invalid attachment id.",
      z.flattenError(idResult.error).fieldErrors,
    );
  }

  const task = await getTaskScope(companyId, taskId);

  assertTaskParticipant(task, userId);

  try {
    const [deleted] = await db
      .delete(taskAttachments)
      .where(
        and(
          eq(taskAttachments.id, idResult.data),
          eq(taskAttachments.taskId, taskId),
        ),
      )
      .returning();

    if (!deleted) {
      throw new NotFoundError("Attachment not found.");
    }

    await deleteAttachmentFiles([deleted.fileKey]);

    return deleted;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }

    translateDatabaseError(error);
  }
}
