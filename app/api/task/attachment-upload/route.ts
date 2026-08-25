import { randomUUID } from "node:crypto";

import { TASK_ATTACHMENTS_BUCKET } from "@/features/task/constants/attachment-bucket.constant";
import { MAX_ATTACHMENT_SIZE_BYTES } from "@/features/task/constants/attachment-limits.constant";
import { BadRequestError } from "@/lib/errors";
import { routeHandler } from "@/lib/route-helpers/route-handler";
import { getCurrentUser } from "@/lib/session";
import { createAdminClient } from "@/utils/supabase/admin";

// Attachments are uploaded to storage before the task (and its id) exist, so
// files are scoped by companyId instead. createTaskWithRelations attaches
// the returned fileKey to the task row once the form is submitted.
export const POST = routeHandler(async (request) => {
  const currentUser = await getCurrentUser();
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    throw new BadRequestError("A file is required.");
  }

  if (file.size === 0) {
    throw new BadRequestError("The selected file is empty.");
  }

  if (file.size > MAX_ATTACHMENT_SIZE_BYTES) {
    throw new BadRequestError("Files must be 100 MB or smaller.");
  }

  const extension = file.name.includes(".")
    ? file.name.slice(file.name.lastIndexOf("."))
    : "";
  const fileKey = `${currentUser.companyId}/${randomUUID()}${extension}`;

  const { error } = await createAdminClient()
    .storage.from(TASK_ATTACHMENTS_BUCKET)
    .upload(fileKey, file, {
      contentType: file.type || undefined,
    });

  if (error) {
    throw new BadRequestError("Failed to upload the file. Please try again.");
  }

  return {
    fileKey,
    fileName: file.name,
    mimeType: file.type || undefined,
    sizeBytes: file.size,
  };
});

// Best-effort cleanup for a file uploaded here but never attached to a task
// (e.g. the user removed it, or cancelled the form). Scoped to the caller's
// own company prefix so one company can't delete another's upload by key.
export const DELETE = routeHandler(async (request) => {
  const currentUser = await getCurrentUser();
  const { searchParams } = new URL(request.url);
  const fileKey = searchParams.get("fileKey");

  if (!fileKey || !fileKey.startsWith(`${currentUser.companyId}/`)) {
    throw new BadRequestError("A valid fileKey is required.");
  }

  await createAdminClient().storage.from(TASK_ATTACHMENTS_BUCKET).remove([fileKey]);

  return { fileKey };
});
