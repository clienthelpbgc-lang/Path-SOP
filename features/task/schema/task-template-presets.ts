import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  smallint,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import type { ReminderAnchor } from "@/features/task/constants/reminder-anchor.constant";
import type { ReminderChannel } from "@/features/task/constants/reminder-channel.constant";
import { platformAdmins } from "@/features/platform-admin/schema";

import { repeatUnitEnum } from "./enums";

interface TemplateChecklistItem {
  text: string;
  sortOrder: number;
}

interface TemplateReminder {
  channel: ReminderChannel;
  anchor: ReminderAnchor;
  offsetMinutes: number;
}

// A preset is authored once by a platform admin and visible to every
// company -- unlike taskTemplates, it has no companyId (nothing to scope
// by) and no sourceTaskId (it isn't derived from any one company's task).
// createdBy references platformAdmins, not users, since platform admins are
// a disjoint identity space from tenant users. See db/migrations for the
// RLS policy that makes this table readable by every tenant but writable
// only through systemDb.
export const taskTemplatePresets = pgTable(
  "task_template_presets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
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
      .references(() => platformAdmins.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("task_template_presets_is_active_idx").on(table.isActive),
  ],
);
