import { z } from "zod";

import { REPEAT_UNITS } from "@/features/task/constants/repeat-unit.constant";

export const taskFormOptionalDateSchema = z.preprocess(
  (value) => (value === "" || value === undefined ? undefined : value),
  z.coerce.date({ error: "Please provide a valid date." }).optional(),
);

// Shared by the "New task" and "Edit task" forms. Edit only covers what the
// update-task endpoint persists: checklist items, attachments and watchers
// aren't part of it, so those stay out of this base shape and get added on
// top for the create form only.
export const taskFormBaseSchema = z.object({
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
  assignedTo: z.uuid({ error: "Please select an assignee." }),
  weightage: z.coerce
    .number({ error: "Weightage must be a number." })
    .int("Weightage must be an integer.")
    .min(1, "Weightage must be at least 1.")
    .max(10, "Weightage must not exceed 10."),
  startAt: z.coerce.date({ error: "Please provide a valid start date." }),
  dueAt: z.coerce.date({ error: "Please provide a valid due date." }),
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
  repeatEndsAt: taskFormOptionalDateSchema,
});

// Both `startAt` and `dueAt` carry a full date & time, so this mirrors the
// stricter timestamp comparison the create/update APIs already enforce
// (see `checkDueAfterStart` in task.validator.ts).
export function checkTaskFormDueDate(
  data: { startAt: Date; dueAt: Date },
  ctx: z.RefinementCtx,
) {
  if (data.dueAt < data.startAt) {
    ctx.addIssue({
      code: "custom",
      path: ["dueAt"],
      message: "Due date must be on or after the start date.",
    });
  }
}

// Only used by the "New task" form -- editing an existing task must still
// allow a `startAt` that's already in the past, so this stays out of
// `taskFormBaseSchema` and is applied by `createTaskFormSchema` alone.
export function checkTaskFormStartNotPast(
  data: { startAt: Date },
  ctx: z.RefinementCtx,
) {
  if (data.startAt < new Date()) {
    ctx.addIssue({
      code: "custom",
      path: ["startAt"],
      message: "Start date must not be before the current date and time.",
    });
  }
}
