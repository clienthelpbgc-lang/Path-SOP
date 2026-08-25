import { z } from "zod";

export const taskChecklistItemIdSchema = z.uuid({
  error: "Please provide a valid checklist item id.",
});

const taskIdSchema = z.uuid({
  error: "Please provide a valid task id.",
});

const textSchema = z
  .string({ error: "Checklist item text is required." })
  .trim()
  .min(1, "Checklist item text cannot be empty.")
  .max(500, "Checklist item text must not exceed 500 characters.");

const sortOrderSchema = z
  .number({ error: "Sort order must be a number." })
  .int("Sort order must be an integer.")
  .min(0, "Sort order cannot be negative.");

export const createTaskChecklistItemSchema = z.object({
  taskId: taskIdSchema,
  text: textSchema,
  sortOrder: sortOrderSchema.default(0),
});

export const updateTaskChecklistItemSchema = z
  .object({
    text: textSchema.optional(),
    isDone: z.boolean({ error: "isDone must be true or false." }).optional(),
    sortOrder: sortOrderSchema.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    error: "At least one field must be provided to update the checklist item.",
  });
