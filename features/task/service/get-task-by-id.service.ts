import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { crmLeads, crmLeadTasks, crmStages } from "@/db/external/crm";
import { tasks } from "@/features/task/schema";
import type { TaskCrmLead, TaskWithRelations } from "@/features/task/types";
import { taskIdSchema } from "@/features/task/validators";
import { NotFoundError, ValidationError } from "@/lib/errors";

const PARTY_COLUMNS = { id: true, name: true, email: true, phone: true } as const;

export async function getTaskById(
  companyId: string,
  id: string,
): Promise<TaskWithRelations> {
  const idResult = taskIdSchema.safeParse(id);

  if (!idResult.success) {
    throw new ValidationError(
      "Invalid task id.",
      z.flattenError(idResult.error).fieldErrors,
    );
  }

  const task = await db.query.tasks.findFirst({
    where: and(eq(tasks.id, idResult.data), eq(tasks.companyId, companyId)),
    with: {
      assignee: { columns: PARTY_COLUMNS },
      creator: { columns: PARTY_COLUMNS },
      checklistItems: { orderBy: (item, { asc: ascending }) => ascending(item.sortOrder) },
      attachments: { orderBy: (attachment, { desc }) => desc(attachment.createdAt) },
      reminders: { orderBy: (reminder, { asc: ascending }) => ascending(reminder.scheduledAt) },
      watchers: { with: { user: { columns: PARTY_COLUMNS } } },
    },
  });

  if (!task) {
    throw new NotFoundError("Task not found.");
  }

  return { ...task, crmLead: await getTaskCrmLead(companyId, task.id) };
}

async function getTaskCrmLead(
  companyId: string,
  taskId: string,
): Promise<TaskCrmLead | null> {
  const [row] = await db
    .select({
      id: crmLeads.id,
      number: crmLeads.number,
      contactName: crmLeads.contactName,
      businessName: crmLeads.businessName,
      phone: crmLeads.phone,
      email: crmLeads.email,
      priority: crmLeads.priority,
      stage: { name: crmStages.name, color: crmStages.color },
      archivedAt: crmLeads.archivedAt,
    })
    .from(crmLeadTasks)
    .innerJoin(crmLeads, eq(crmLeads.id, crmLeadTasks.leadId))
    .innerJoin(crmStages, eq(crmStages.id, crmLeads.stageId))
    .where(
      and(eq(crmLeadTasks.taskId, taskId), eq(crmLeadTasks.companyId, companyId)),
    )
    .limit(1);

  if (!row) {
    return null;
  }

  const { archivedAt, ...lead } = row;
  return { ...lead, archived: archivedAt !== null };
}
