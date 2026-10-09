import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { taskAttachments, tasks } from "@/features/task/schema";
import { deleteAttachmentFiles } from "@/features/task/service/attachment-storage";
import type { BulkDeleteTasksResult } from "@/features/task/types";
import type { BulkDeleteTasksInput } from "@/features/task/validators";
import { bulkDeleteTasksSchema } from "@/features/task/validators";
import { ValidationError } from "@/lib/errors";
import { translateDatabaseError } from "@/lib/errors/db-error";

// Same rule as deleteTask (creator only, pending only), applied to many
// tasks in one transaction. Ineligible ids are skipped rather than failing
// the whole batch, so one stale row doesn't block deleting the rest.
export async function bulkDeleteTasks(
  companyId: string,
  userId: string,
  input: BulkDeleteTasksInput,
): Promise<BulkDeleteTasksResult> {
  const result = bulkDeleteTasksSchema.safeParse(input);

  if (!result.success) {
    throw new ValidationError(
      "Invalid bulk delete request.",
      z.flattenError(result.error).fieldErrors,
    );
  }

  const { ids } = result.data;
  const deletableTasks = and(
    inArray(tasks.id, ids),
    eq(tasks.companyId, companyId),
    eq(tasks.createdBy, userId),
    eq(tasks.status, "pending"),
  );

  let orphanedFileKeys: string[] = [];
  let deletedIds: string[];

  try {
    deletedIds = await db.transaction(async (tx) => {
      // Cascade deletes wipe the attachment rows along with the tasks, so
      // the file keys have to be captured before the delete runs.
      const attachments = await tx
        .select({
          taskId: taskAttachments.taskId,
          fileKey: taskAttachments.fileKey,
        })
        .from(taskAttachments)
        .innerJoin(tasks, eq(taskAttachments.taskId, tasks.id))
        .where(deletableTasks);

      const deleted = await tx
        .delete(tasks)
        .where(deletableTasks)
        .returning({ id: tasks.id });

      // Only keep files for tasks that were actually deleted -- one could
      // have changed status between the two statements.
      const deletedIdSet = new Set(deleted.map((row) => row.id));
      orphanedFileKeys = attachments
        .filter((attachment) => deletedIdSet.has(attachment.taskId))
        .map((attachment) => attachment.fileKey);

      return deleted.map((row) => row.id);
    });
  } catch (error) {
    translateDatabaseError(error);
  }

  await deleteAttachmentFiles(orphanedFileKeys);

  return {
    deletedIds,
    skippedCount: ids.length - deletedIds.length,
  };
}
