import { index, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import {
  reminderAnchorEnum,
  reminderChannelEnum,
  reminderStatusEnum,
} from "./enums";
import { tasks } from "./tasks";

export const taskReminders = pgTable(
  "task_reminders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    taskId: uuid("task_id")
      .notNull()
      .references(() => tasks.id, { onDelete: "cascade" }),
    channel: reminderChannelEnum("channel").notNull(),
    anchor: reminderAnchorEnum("anchor").notNull().default("due"),
    offsetMinutes: integer("offset_minutes").notNull(),
    scheduledAt: timestamp("scheduled_at", { withTimezone: true }).notNull(),
    status: reminderStatusEnum("status").notNull().default("scheduled"),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    error: text("error"),
  },
  (table) => [
    index("task_reminders_status_scheduled_at_idx").on(
      table.status,
      table.scheduledAt,
    ),
  ],
);
