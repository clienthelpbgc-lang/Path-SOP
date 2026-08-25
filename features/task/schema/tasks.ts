import { sql } from "drizzle-orm";
import type { AnyPgColumn } from "drizzle-orm/pg-core";
import {
  boolean,
  index,
  integer,
  pgTable,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { companies } from "@/features/company/schema";
import { users } from "@/features/user/schema";

import { repeatUnitEnum, taskStatusEnum } from "./enums";
import { taskTemplates } from "./task-templates";

export const tasks = pgTable(
  "tasks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id),
    title: text("title").notNull(),
    description: text("description"),
    assignedTo: uuid("assigned_to")
      .notNull()
      .references(() => users.id),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => users.id),
    templateId: uuid("template_id").references(
      (): AnyPgColumn => taskTemplates.id,
      { onDelete: "set null" },
    ),
    seriesParentId: uuid("series_parent_id").references(
      (): AnyPgColumn => tasks.id,
      { onDelete: "cascade" },
    ),
    weightage: integer("weightage").notNull().default(0),
    startAt: timestamp("start_at", { withTimezone: true }).notNull(),
    dueAt: timestamp("due_at", { withTimezone: true }).notNull(),
    status: taskStatusEnum("status").notNull().default("pending"),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    completionRemarks: text("completion_remarks"),
    isRepeating: boolean("is_repeating").notNull().default(false),
    repeatUnit: repeatUnitEnum("repeat_unit"),
    repeatInterval: integer("repeat_interval"),
    repeatDaysOfWeek: smallint("repeat_days_of_week").array(),
    repeatEndsAt: timestamp("repeat_ends_at", { withTimezone: true }),
    nextRunAt: timestamp("next_run_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("tasks_company_id_status_idx").on(table.companyId, table.status),
    index("tasks_assigned_to_status_idx").on(table.assignedTo, table.status),
    index("tasks_due_at_idx").on(table.dueAt),
    index("tasks_series_parent_id_idx").on(table.seriesParentId),
    index("tasks_next_run_at_idx")
      .on(table.nextRunAt)
      .where(sql`${table.isRepeating} = true`),
    uniqueIndex("tasks_series_parent_id_start_at_unique").on(
      table.seriesParentId,
      table.startAt,
    ),
  ],
);
