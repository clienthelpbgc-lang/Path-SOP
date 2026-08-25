import { TASK_ATTACHMENTS_BUCKET } from "@/features/task/constants/attachment-bucket.constant";
import { createAdminClient } from "@/utils/supabase/admin";

/**
 * Storage objects live outside Postgres, so they can't share a transaction
 * with the DB write that already committed. This is a best-effort
 * compensating cleanup: log and swallow rather than throw, since the DB rows
 * (the source of truth for what's attached to a task) are already gone —
 * failing the request here would just strand the caller with no way to retry
 * the part that actually matters.
 */
export async function deleteAttachmentFiles(fileKeys: string[]): Promise<void> {
  if (fileKeys.length === 0) {
    return;
  }

  try {
    const { error } = await createAdminClient()
      .storage.from(TASK_ATTACHMENTS_BUCKET)
      .remove(fileKeys);

    if (error) {
      console.error("Failed to delete task attachment files.", {
        fileKeys,
        error,
      });
    }
  } catch (error) {
    console.error("Failed to delete task attachment files.", {
      fileKeys,
      error,
    });
  }
}
