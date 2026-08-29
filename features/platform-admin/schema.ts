import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

// Deliberately not part of the tenant schema: no companyId, no RLS, and no
// GRANT to app_tenant (see db/migrations -- a fresh table has zero
// privileges for that role by default), so this table is unreachable from
// any tenant-scoped `db` call. Only systemDb touches it -- see
// lib/platform-session.ts.
export const platformAdmins = pgTable("platform_admins", {
  id: uuid("id").primaryKey(), // == Supabase auth user id
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
