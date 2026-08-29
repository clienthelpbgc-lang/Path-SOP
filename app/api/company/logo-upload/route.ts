import { randomUUID } from "node:crypto";

import {
  ALLOWED_LOGO_MIME_TYPES,
  COMPANY_LOGO_BUCKET,
  MAX_LOGO_SIZE_BYTES,
} from "@/features/company/constants/logo.constant";
import { BadRequestError } from "@/lib/errors";
import { getCurrentPlatformAdmin } from "@/lib/platform-session";
import { routeHandler } from "@/lib/route-helpers/route-handler";
import { createAdminClient } from "@/utils/supabase/admin";

// Logos are uploaded before the company (and its id) exist, same as
// task/attachment-upload -- so files are keyed by a random id rather than
// scoped under a companyId prefix. Only a platform admin can reach this
// route (see onboard-tenant.service.ts, the only place a logo URL is ever
// persisted).
export const POST = routeHandler(async (request) => {
  await getCurrentPlatformAdmin();

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    throw new BadRequestError("A file is required.");
  }

  if (file.size === 0) {
    throw new BadRequestError("The selected file is empty.");
  }

  if (file.size > MAX_LOGO_SIZE_BYTES) {
    throw new BadRequestError("Logo images must be 5 MB or smaller.");
  }

  if (
    !ALLOWED_LOGO_MIME_TYPES.includes(
      file.type as (typeof ALLOWED_LOGO_MIME_TYPES)[number],
    )
  ) {
    throw new BadRequestError(
      "Logo must be a PNG, JPEG, WebP, or SVG image.",
    );
  }

  const extension = file.name.includes(".")
    ? file.name.slice(file.name.lastIndexOf("."))
    : "";
  const fileKey = `${randomUUID()}${extension}`;

  const supabaseAdmin = createAdminClient();

  const { error } = await supabaseAdmin.storage
    .from(COMPANY_LOGO_BUCKET)
    .upload(fileKey, file, {
      contentType: file.type || undefined,
    });

  if (error) {
    throw new BadRequestError("Failed to upload the logo. Please try again.");
  }

  const {
    data: { publicUrl },
  } = supabaseAdmin.storage.from(COMPANY_LOGO_BUCKET).getPublicUrl(fileKey);

  return {
    fileKey,
    url: publicUrl,
    fileName: file.name,
    mimeType: file.type || undefined,
    sizeBytes: file.size,
  };
});

// Best-effort cleanup for a logo uploaded here but never attached to a
// company (the admin replaced or removed it before submitting the onboarding
// form). See task/attachment-upload/route.ts for the same pattern.
export const DELETE = routeHandler(async (request) => {
  await getCurrentPlatformAdmin();

  const { searchParams } = new URL(request.url);
  const fileKey = searchParams.get("fileKey");

  if (!fileKey) {
    throw new BadRequestError("A valid fileKey is required.");
  }

  await createAdminClient().storage.from(COMPANY_LOGO_BUCKET).remove([fileKey]);

  return { fileKey };
});
