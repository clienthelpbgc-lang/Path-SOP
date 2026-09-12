import { boolean, index, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { platformAdmins } from "@/features/platform-admin/schema";

import { kraTypeEnum } from "./enums";

// A preset is authored once by a platform admin and visible to every
// company -- unlike kraTemplates, it has no companyId (nothing to scope by)
// and no sourceKraId (it isn't derived from any one company's KRA).
// createdBy references platformAdmins, not users, since platform admins are
// a disjoint identity space from tenant users. See db/migrations for the
// RLS policy that makes this table readable by every tenant but writable
// only through systemDb.
export const kraTemplatePresets = pgTable(
  "kra_template_presets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    type: kraTypeEnum("type").notNull(),
    weightage: integer("weightage").notNull().default(1),
    remarks: text("remarks"),
    repeat: boolean("repeat").notNull().default(false),
    isActive: boolean("is_active").notNull().default(true),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => platformAdmins.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("kra_template_presets_is_active_idx").on(table.isActive),
  ],
);
