import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { taskAttachments, tasks } from "@/features/task/schema";
import { deleteAttachmentFiles } from "@/features/task/service/attachment-storage";
import type { Task } from "@/features/task/types";
import { taskIdSchema } from "@/features/task/validators";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "@/lib/errors";
import { translateDatabaseError } from "@/lib/errors/db-error";

export async function deleteTask(
  companyId: string,
  userId: string,
  id: string,
): Promise<Task> {
  const idResult = taskIdSchema.safeParse(id);

  if (!idResult.success) {
    throw new ValidationError(
      "Invalid task id.",
      z.flattenError(idResult.error).fieldErrors,
    );
  }

  let orphanedFileKeys: string[] = [];

  try {
    const deleted = await db.transaction(async (tx) => {
      // Cascade deletes wipe the attachment rows along with the task, so the
      // file keys have to be captured before the delete runs, not after.
      const attachments = await tx
        .select({ fileKey: taskAttachments.fileKey })
        .from(taskAttachments)
        .where(eq(taskAttachments.taskId, idResult.data));

      const [row] = await tx
        .delete(tasks)
        .where(
          and(
            eq(tasks.id, idResult.data),
            eq(tasks.companyId, companyId),
            eq(tasks.createdBy, userId),
            eq(tasks.status, "pending"),
          ),
        )
        .returning();

      if (row) {
        orphanedFileKeys = attachments.map((attachment) => attachment.fileKey);

        return row;
      }

      const [existing] = await tx
        .select({
          createdBy: tasks.createdBy,
          status: tasks.status,
        })
        .from(tasks)
        .where(and(eq(tasks.id, idResult.data), eq(tasks.companyId, companyId)))
        .limit(1);

      if (!existing) {
        throw new NotFoundError("Task not found.");
      }

      if (existing.createdBy !== userId) {
        throw new ForbiddenError(
          "Only the user who created this task can delete it.",
        );
      }

      throw new ConflictError(
        "Only tasks that are still pending can be deleted.",
      );
    });

    await deleteAttachmentFiles(orphanedFileKeys);

    return deleted;
  } catch (error) {
    if (
      error instanceof NotFoundError ||
      error instanceof ConflictError ||
      error instanceof ForbiddenError
    ) {
      throw error;
    }

    translateDatabaseError(error);
  }
}
