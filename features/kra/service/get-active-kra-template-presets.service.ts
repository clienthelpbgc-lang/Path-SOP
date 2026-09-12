import { desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { kraTemplatePresets } from "@/features/kra/schema";
import type { KraTemplatePreset } from "@/features/kra/types";
import type { UserRole } from "@/features/user/constants/role.constant";
import { ForbiddenError } from "@/lib/errors";
import { translateDatabaseError } from "@/lib/errors/db-error";

// Tenant-facing: every company can see every active KRA preset, unpaginated
// (presets are expected to be a small, curated list). Safe to read through
// the normal RLS-scoped `db` -- the `read_all` SELECT policy on
// kra_template_presets permits app_tenant to read every row regardless of
// company. Gated to admins for the same reason getAllKraTemplates is --
// only admins assign KRAs -- as defense in depth even though the only UI
// entry point (the KRA Templates tab) is already admin-only.
export async function getActiveKraTemplatePresets(
  currentUserRole: UserRole,
): Promise<KraTemplatePreset[]> {
  if (currentUserRole !== "ADMIN") {
    throw new ForbiddenError("Only admins can view KRA presets.");
  }

  try {
    return await db
      .select()
      .from(kraTemplatePresets)
      .where(eq(kraTemplatePresets.isActive, true))
      .orderBy(desc(kraTemplatePresets.createdAt));
  } catch (error) {
    translateDatabaseError(error);
  }
}
