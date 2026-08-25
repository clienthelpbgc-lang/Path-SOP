import { z } from "zod";

import { REMINDER_ANCHORS } from "@/features/task/constants/reminder-anchor.constant";
import { REMINDER_CHANNELS } from "@/features/task/constants/reminder-channel.constant";

export const taskReminderIdSchema = z.uuid({
  error: "Please provide a valid reminder id.",
});

const taskIdSchema = z.uuid({
  error: "Please provide a valid task id.",
});

const channelSchema = z.enum(REMINDER_CHANNELS, {
  error: "Please provide a valid reminder channel.",
});

const anchorSchema = z.enum(REMINDER_ANCHORS, {
  error: "Please provide a valid reminder anchor.",
});

const offsetMinutesSchema = z.number({
  error: "Offset minutes must be a number.",
}).int("Offset minutes must be an integer.");

export const createTaskReminderSchema = z.object({
  taskId: taskIdSchema,
  channel: channelSchema,
  anchor: anchorSchema.default("due"),
  offsetMinutes: offsetMinutesSchema,
});

export const updateTaskReminderSchema = z
  .object({
    anchor: anchorSchema.optional(),
    offsetMinutes: offsetMinutesSchema.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    error: "At least one field must be provided to update the reminder.",
  });
