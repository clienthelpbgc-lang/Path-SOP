import type { AnyPgColumn } from "drizzle-orm/pg-core";
import {
  boolean,
  check,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

import { companies } from "@/features/company/schema";
import { users } from "@/features/user/schema";

import { kraStatusEnum, kraTypeEnum } from "./enums";
import { kraTemplates } from "./kra-templates";

export const kras = pgTable(
  "kras",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id),
    title: text("title").notNull(),
    description: text("description"),
    status: kraStatusEnum("status").notNull().default("assigned"),
    type: kraTypeEnum("type").notNull(),
    periodStart: timestamp("period_start", { withTimezone: true }).notNull(),
    periodEnd: timestamp("period_end", { withTimezone: true }).notNull(),
    repeat: boolean("repeat").notNull().default(false),
    templateId: uuid("template_id").references(
      (): AnyPgColumn => kraTemplates.id,
      { onDelete: "set null" },
    ),
    assignedTo: uuid("assigned_to")
      .notNull()
      .references(() => users.id),
    assignedBy: uuid("assigned_by")
      .notNull()
      .references(() => users.id),
    weightage: integer("weightage").notNull().default(1),
    remarks: text("remarks"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("kras_company_id_status_idx").on(table.companyId, table.status),
    index("kras_assigned_to_status_idx").on(table.assignedTo, table.status),
    index("kras_type_idx").on(table.type),
    index("kras_period_start_period_end_idx").on(
      table.periodStart,
      table.periodEnd,
    ),
    check(
      "kras_weightage_range_check",
      sql`${table.weightage} >= 1 AND ${table.weightage} <= 10`,
    ),
  ],
);
