import type { AnyPgColumn } from "drizzle-orm/pg-core";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { companies } from "@/features/company/schema";
import type { ReminderAnchor } from "@/features/task/constants/reminder-anchor.constant";
import type { ReminderChannel } from "@/features/task/constants/reminder-channel.constant";
import { users } from "@/features/user/schema";

import { repeatUnitEnum } from "./enums";
import { tasks } from "./tasks";

interface TemplateChecklistItem {
  text: string;
  sortOrder: number;
}

interface TemplateReminder {
  channel: ReminderChannel;
  anchor: ReminderAnchor;
  offsetMinutes: number;
}

export const taskTemplates = pgTable(
  "task_templates",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id),
    name: text("name").notNull(),
    sourceTaskId: uuid("source_task_id").references(
      (): AnyPgColumn => tasks.id,
      { onDelete: "set null" },
    ),
    title: text("title").notNull(),
    description: text("description"),
    weightage: integer("weightage").notNull().default(0),
    checklist: jsonb("checklist")
      .$type<TemplateChecklistItem[]>()
      .notNull()
      .default([]),
    reminders: jsonb("reminders")
      .$type<TemplateReminder[]>()
      .notNull()
      .default([]),
    isRepeating: boolean("is_repeating").notNull().default(false),
    repeatUnit: repeatUnitEnum("repeat_unit"),
    repeatInterval: integer("repeat_interval"),
    repeatDaysOfWeek: smallint("repeat_days_of_week").array(),
    isActive: boolean("is_active").notNull().default(true),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("task_templates_company_id_is_active_idx").on(
      table.companyId,
      table.isActive,
    ),
    uniqueIndex("task_templates_source_task_id_unique").on(
      table.sourceTaskId,
    ),
  ],
);
