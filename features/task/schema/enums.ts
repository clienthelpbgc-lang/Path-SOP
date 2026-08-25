import { pgEnum } from "drizzle-orm/pg-core";

import { ATTACHMENT_CONTEXTS } from "@/features/task/constants/attachment-context.constant";
import { REMINDER_ANCHORS } from "@/features/task/constants/reminder-anchor.constant";
import { REMINDER_CHANNELS } from "@/features/task/constants/reminder-channel.constant";
import { REMINDER_STATUSES } from "@/features/task/constants/reminder-status.constant";
import { REPEAT_UNITS } from "@/features/task/constants/repeat-unit.constant";
import { TASK_STATUSES } from "@/features/task/constants/task-status.constant";

export const taskStatusEnum = pgEnum("task_status", TASK_STATUSES);

export const repeatUnitEnum = pgEnum("repeat_unit", REPEAT_UNITS);

export const reminderChannelEnum = pgEnum("reminder_channel", REMINDER_CHANNELS);

export const reminderAnchorEnum = pgEnum("reminder_anchor", REMINDER_ANCHORS);

export const reminderStatusEnum = pgEnum("reminder_status", REMINDER_STATUSES);

export const attachmentContextEnum = pgEnum(
  "attachment_context",
  ATTACHMENT_CONTEXTS,
);
