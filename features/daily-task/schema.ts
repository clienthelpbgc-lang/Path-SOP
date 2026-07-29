import { sql } from "drizzle-orm";
import {
  check,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { companies } from "@/features/company/schema";
import { TASK_STATUSES } from "@/features/daily-task/constants/status.constant";
import { users } from "@/features/user/schema";

export const taskStatusEnum = pgEnum("task_status", TASK_STATUSES);

export const dailyTasks = pgTable(
  "daily_tasks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id),
    title: text("title").notNull(),
    description: text("description"),
    dueDate: timestamp("due_date", { withTimezone: true }).notNull(),
    assignedTo: uuid("assigned_to")
      .notNull()
      .references(() => users.id),
    assignedBy: uuid("assigned_by")
      .notNull()
      .references(() => users.id),
    priority: integer("priority").notNull(),
    status: taskStatusEnum("status").notNull().default("PENDING"),
    userRemark: text("user_remark"),
    adminRemark: text("admin_remark"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    check("daily_tasks_priority_range", sql`${table.priority} BETWEEN 1 AND 4`),
  ],
);
