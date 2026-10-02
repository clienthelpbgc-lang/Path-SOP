import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

// Read-only mirrors of the CRM's tables, which share this database. The CRM
// owns and migrates them (see the crm repo's features/lead/schema); this file
// sits outside drizzle.config.ts's `schema` glob, so drizzle-kit never
// generates migrations for them here. Only the columns the task details read
// are listed, and enum columns are typed as text.
//
// crm_lead_tasks links a task the CRM created to its lead. app_tenant can
// read all three tables, scoped to the current company by their RLS policies.

export const crmLeadTasks = pgTable("crm_lead_tasks", {
  taskId: uuid("task_id").primaryKey(),
  companyId: uuid("company_id").notNull(),
  leadId: uuid("lead_id").notNull(),
  kind: text("kind").notNull(),
});

export const crmLeads = pgTable("crm_leads", {
  id: uuid("id").primaryKey(),
  companyId: uuid("company_id").notNull(),
  number: integer("number").notNull(),
  contactName: text("contact_name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  businessName: text("business_name"),
  stageId: uuid("stage_id").notNull(),
  priority: text("priority").notNull(),
  archivedAt: timestamp("archived_at", { withTimezone: true }),
});

export const crmStages = pgTable("crm_stages", {
  id: uuid("id").primaryKey(),
  name: text("name").notNull(),
  color: text("color").notNull(),
});
