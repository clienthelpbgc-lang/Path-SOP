import { eq, inArray } from "drizzle-orm";
import { z } from "zod";

import { systemDb } from "@/db";
import { COMPANY_LOGO_BUCKET } from "@/features/company/constants/logo.constant";
import { companies } from "@/features/company/schema";
import type { Company } from "@/features/company/types";
import { companyIdSchema } from "@/features/company/validation";
import { TASK_ATTACHMENTS_BUCKET } from "@/features/task/constants/attachment-bucket.constant";
import {
  taskAttachments,
  taskChecklistItems,
  taskReminders,
  taskTemplates,
  taskWatchers,
  tasks,
} from "@/features/task/schema";
import { kraTemplates, kras } from "@/features/kra/schema";
import { users } from "@/features/user/schema";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { translateDatabaseError } from "@/lib/errors/db-error";
import { createAdminClient } from "@/utils/supabase/admin";

// A real, irreversible purge of a tenant and everything under it -- distinct
// from deactivating (see update-company.service.ts, which just flips
// isActive). None of the companyId/userId/taskId foreign keys below cascade
// at the DB level (see db/migrations/0007_enable_rls.sql and each table's
// schema), so child rows are deleted explicitly in dependency order inside
// one transaction before the company row itself.
export async function deleteCompany(id: string): Promise<Company> {
  const idResult = companyIdSchema.safeParse(id);

  if (!idResult.success) {
    throw new ValidationError(
      "Invalid company id.",
      z.flattenError(idResult.error).fieldErrors,
    );
  }

  const companyId = idResult.data;

  const [company] = await systemDb
    .select()
    .from(companies)
    .where(eq(companies.id, companyId))
    .limit(1);

  if (!company) {
    throw new NotFoundError("Company not found.");
  }

  const companyUsers = await systemDb
    .select({ id: users.id })
    .from(users)
    .where(eq(users.companyId, companyId));
  const userIds = companyUsers.map((user) => user.id);

  const companyTasks = await systemDb
    .select({ id: tasks.id })
    .from(tasks)
    .where(eq(tasks.companyId, companyId));
  const taskIds = companyTasks.map((task) => task.id);

  try {
    await systemDb.transaction(async (tx) => {
      if (taskIds.length > 0) {
        await tx.delete(taskWatchers).where(inArray(taskWatchers.taskId, taskIds));
        await tx.delete(taskReminders).where(inArray(taskReminders.taskId, taskIds));
        await tx
          .delete(taskAttachments)
          .where(inArray(taskAttachments.taskId, taskIds));
        await tx
          .delete(taskChecklistItems)
          .where(inArray(taskChecklistItems.taskId, taskIds));
        await tx.delete(tasks).where(inArray(tasks.id, taskIds));
      }

      await tx.delete(taskTemplates).where(eq(taskTemplates.companyId, companyId));
      await tx.delete(kras).where(eq(kras.companyId, companyId));
      await tx.delete(kraTemplates).where(eq(kraTemplates.companyId, companyId));

      if (userIds.length > 0) {
        await tx.delete(users).where(inArray(users.id, userIds));
      }

      await tx.delete(companies).where(eq(companies.id, companyId));
    });
  } catch (error) {
    translateDatabaseError(error);
  }

  // Everything below lives outside Postgres (Supabase Auth, Storage), so it
  // can't share the transaction above -- best-effort cleanup, same pattern
  // as create-user.service.ts's compensating delete. The DB rows (the
  // source of truth for what belongs to this tenant) are already gone, so
  // failing here would just strand the caller with no way to retry the part
  // that actually matters.
  const supabaseAdmin = createAdminClient();

  await Promise.allSettled(
    userIds.map((userId) => supabaseAdmin.auth.admin.deleteUser(userId)),
  );

  try {
    const { data: files } = await supabaseAdmin.storage
      .from(TASK_ATTACHMENTS_BUCKET)
      .list(companyId, { limit: 1000 });

    if (files && files.length > 0) {
      await supabaseAdmin.storage
        .from(TASK_ATTACHMENTS_BUCKET)
        .remove(files.map((file) => `${companyId}/${file.name}`));
    }
  } catch (error) {
    console.error("Failed to delete task attachment files for company.", {
      companyId,
      error,
    });
  }

  if (company.logo) {
    const logoFileKey = company.logo.split("/").pop();

    if (logoFileKey) {
      try {
        await supabaseAdmin.storage.from(COMPANY_LOGO_BUCKET).remove([logoFileKey]);
      } catch (error) {
        console.error("Failed to delete company logo file.", {
          companyId,
          error,
        });
      }
    }
  }

  return company;
}
