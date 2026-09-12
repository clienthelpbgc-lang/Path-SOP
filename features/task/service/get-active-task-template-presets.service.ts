import { desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { taskTemplatePresets } from "@/features/task/schema";
import type { TaskTemplatePreset } from "@/features/task/types";
import { translateDatabaseError } from "@/lib/errors/db-error";

// Tenant-facing: every company can see every active preset, unpaginated
// (presets are expected to be a small, curated list). Safe to read through
// the normal RLS-scoped `db` -- the `read_all` SELECT policy on
// task_template_presets permits app_tenant to read every row regardless of
// company, so this keeps "systemDb only for cross-tenant *writes*" intact.
export async function getActiveTaskTemplatePresets(): Promise<
  TaskTemplatePreset[]
> {
  try {
    return await db
      .select()
      .from(taskTemplatePresets)
      .where(eq(taskTemplatePresets.isActive, true))
      .orderBy(desc(taskTemplatePresets.createdAt));
  } catch (error) {
    translateDatabaseError(error);
  }
}
