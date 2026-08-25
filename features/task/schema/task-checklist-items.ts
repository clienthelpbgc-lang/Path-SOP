import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { users } from "@/features/user/schema";

import { tasks } from "./tasks";

export const taskChecklistItems = pgTable(
  "task_checklist_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    taskId: uuid("task_id")
      .notNull()
      .references(() => tasks.id, { onDelete: "cascade" }),
    text: text("text").notNull(),
    isDone: boolean("is_done").notNull().default(false),
    doneAt: timestamp("done_at", { withTimezone: true }),
    doneBy: uuid("done_by").references(() => users.id),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (table) => [
    index("task_checklist_items_task_id_sort_order_idx").on(
      table.taskId,
      table.sortOrder,
    ),
  ],
);
