import { z } from "zod";

import { REPEAT_UNITS } from "@/features/task/constants/repeat-unit.constant";

import { checkRepeatFields } from "./repeat-fields.validator";

// Client-side shape for the "Edit template" form. Templates have no
// start/due dates of their own (those only exist once a task is created
// from one), so this only covers what a template actually stores.
export const editTaskTemplateFormSchema = z
  .object({
    name: z
      .string({ error: "Template name is required." })
      .trim()
      .min(2, "Template name must be at least 2 characters long.")
      .max(120, "Template name must not exceed 120 characters."),
    title: z
      .string({ error: "Title is required." })
      .trim()
      .min(2, "Title must be at least 2 characters long.")
      .max(200, "Title must not exceed 200 characters."),
    description: z
      .string()
      .trim()
      .max(2000, "Description must not exceed 2000 characters.")
      .optional(),
    weightage: z.coerce
      .number({ error: "Weightage must be a number." })
      .int("Weightage must be an integer.")
      .min(0, "Weightage cannot be negative.")
      .max(10, "Weightage must not exceed 10."),
    defaultAssignee: z.string().optional(),
    isActive: z.boolean(),
    isRepeating: z.boolean(),
    repeatUnit: z
      .enum(REPEAT_UNITS, { error: "Please provide a valid repeat unit." })
      .optional(),
    repeatInterval: z.coerce
      .number({ error: "Repeat interval must be a number." })
      .int("Repeat interval must be an integer.")
      .min(1, "Repeat interval must be at least 1.")
      .optional(),
    repeatDaysOfWeek: z.array(z.number().int().min(0).max(6)).optional(),
    checklistItems: z.array(z.object({ text: z.string() })),
    watcherIds: z.array(z.uuid()),
  })
  .superRefine(checkRepeatFields("template"));
