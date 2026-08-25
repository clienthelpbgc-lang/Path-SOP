import { index, pgTable, primaryKey, uuid } from "drizzle-orm/pg-core";

import { users } from "@/features/user/schema";

import { tasks } from "./tasks";

export const taskWatchers = pgTable(
  "task_watchers",
  {
    taskId: uuid("task_id")
      .notNull()
      .references(() => tasks.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ columns: [table.taskId, table.userId] }),
    index("task_watchers_user_id_idx").on(table.userId),
  ],
);
