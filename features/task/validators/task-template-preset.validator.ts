import { z } from "zod";

import {
  checkRepeatFields,
  repeatDaysOfWeekSchema,
  repeatIntervalSchema,
  repeatUnitSchema,
} from "./repeat-fields.validator";
import { createTaskReminderSchema } from "./task-reminder.validator";

export const taskTemplatePresetIdSchema = z.uuid({
  error: "Please provide a valid preset id.",
});

const nameSchema = z
  .string({ error: "Preset name is required." })
  .trim()
  .min(2, "Preset name must be at least 2 characters long.")
  .max(120, "Preset name must not exceed 120 characters.");

const titleSchema = z
  .string({ error: "Title is required." })
  .trim()
  .min(2, "Title must be at least 2 characters long.")
  .max(200, "Title must not exceed 200 characters.");

const descriptionSchema = z
  .string()
  .trim()
  .min(1, "Description cannot be empty.")
  .max(2000, "Description must not exceed 2000 characters.");

const weightageSchema = z
  .number({ error: "Weightage must be a number." })
  .int("Weightage must be an integer.")
  .min(0, "Weightage cannot be negative.");

const checklistSchema = z.array(
  z.object({
    text: z
      .string({ error: "Checklist item text is required." })
      .trim()
      .min(1, "Checklist item text cannot be empty.")
      .max(500, "Checklist item text must not exceed 500 characters."),
    sortOrder: z
      .number({ error: "Sort order must be a number." })
      .int("Sort order must be an integer.")
      .min(0, "Sort order cannot be negative."),
  }),
);

const remindersSchema = z.array(
  createTaskReminderSchema.omit({ taskId: true }),
);

const isRepeatingSchema = z.boolean({
  error: "isRepeating must be true or false.",
});

const isActiveSchema = z.boolean({
  error: "isActive must be true or false.",
});

// Same NOTE as task-template.validator.ts: this only carries the shared
// *shape*, not defaults -- `update` is built separately below with plain
// `.optional()` fields so an omitted field is left untouched instead of
// being silently reset.
const taskTemplatePresetBaseSchema = z.object({
  name: nameSchema,
  title: titleSchema,
  description: descriptionSchema.optional(),
  weightage: weightageSchema.default(0),
  checklist: checklistSchema.default([]),
  reminders: remindersSchema.default([]),
  isRepeating: isRepeatingSchema.default(false),
  repeatUnit: repeatUnitSchema.optional(),
  repeatInterval: repeatIntervalSchema.optional(),
  repeatDaysOfWeek: repeatDaysOfWeekSchema.optional(),
  isActive: isActiveSchema.default(true),
});

export const createTaskTemplatePresetSchema =
  taskTemplatePresetBaseSchema.superRefine(checkRepeatFields("preset"));

export const updateTaskTemplatePresetSchema = z
  .object({
    name: nameSchema.optional(),
    title: titleSchema.optional(),
    description: descriptionSchema.optional(),
    weightage: weightageSchema.optional(),
    checklist: checklistSchema.optional(),
    reminders: remindersSchema.optional(),
    isRepeating: isRepeatingSchema.optional(),
    repeatUnit: repeatUnitSchema.optional(),
    repeatInterval: repeatIntervalSchema.optional(),
    repeatDaysOfWeek: repeatDaysOfWeekSchema.optional(),
    isActive: isActiveSchema.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    error: "At least one field must be provided to update the preset.",
  })
  .superRefine(checkRepeatFields("preset"));

export const listTaskTemplatePresetsQuerySchema = z.object({
  page: z.coerce
    .number({ error: "Page must be a number." })
    .int("Page must be an integer.")
    .min(1, "Page must be at least 1.")
    .default(1),
  limit: z.coerce
    .number({ error: "Limit must be a number." })
    .int("Limit must be an integer.")
    .min(1, "Limit must be at least 1.")
    .max(100, "Limit must not exceed 100.")
    .default(20),
  isActive: z
    .enum(["true", "false"], {
      error: "isActive must be 'true' or 'false'.",
    })
    .transform((value) => value === "true")
    .optional(),
  isRepeating: z
    .enum(["true", "false"], {
      error: "isRepeating must be 'true' or 'false'.",
    })
    .transform((value) => value === "true")
    .optional(),
  search: z
    .string()
    .trim()
    .min(1, "Search must not be empty.")
    .max(120, "Search must not exceed 120 characters.")
    .optional(),
});
