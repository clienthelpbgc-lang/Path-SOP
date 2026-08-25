import type { AnyPgColumn } from "drizzle-orm/pg-core";
import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { companies } from "@/features/company/schema";
import { users } from "@/features/user/schema";

import { kraTypeEnum } from "./enums";
import { kras } from "./kras";

export const kraTemplates = pgTable(
  "kra_templates",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id),
    name: text("name").notNull(),
    sourceKraId: uuid("source_kra_id").references(
      (): AnyPgColumn => kras.id,
      { onDelete: "set null" },
    ),
    title: text("title").notNull(),
    description: text("description"),
    type: kraTypeEnum("type").notNull(),
    weightage: integer("weightage").notNull().default(1),
    remarks: text("remarks"),
    repeat: boolean("repeat").notNull().default(false),
    defaultAssignee: uuid("default_assignee").references(() => users.id),
    isActive: boolean("is_active").notNull().default(true),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("kra_templates_company_id_is_active_idx").on(
      table.companyId,
      table.isActive,
    ),
    uniqueIndex("kra_templates_source_kra_id_unique").on(table.sourceKraId),
  ],
);
