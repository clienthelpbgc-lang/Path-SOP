import { z } from "zod";

import { TASK_PRIORITIES } from "@/features/daily-task/constants/priority.constant";
import { TASK_STATUSES } from "@/features/daily-task/constants/status.constant";

export const dailyTaskIdSchema = z.uuid({
  error: "Please provide a valid task id.",
});

const assignedToSchema = z.uuid({
  error: "Please provide a valid assignee id.",
});

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

const dueDateSchema = z.coerce.date({
  error: "Please provide a valid due date.",
});

const prioritySchema = z.literal(TASK_PRIORITIES, {
  error: "Priority must be one of 1, 2, 3, or 4.",
});

const statusSchema = z.enum(TASK_STATUSES, {
  error: "Please provide a valid status.",
});

const remarkSchema = z
  .string()
  .trim()
  .min(1, "Remark cannot be empty.")
  .max(1000, "Remark must not exceed 1000 characters.");

export const createDailyTaskSchema = z.object({
  title: titleSchema,
  description: descriptionSchema.optional(),
  dueDate: dueDateSchema,
  assignedTo: assignedToSchema,
  priority: prioritySchema,
  status: statusSchema.default("PENDING"),
  userRemark: remarkSchema.optional(),
  adminRemark: remarkSchema.optional(),
});

export const updateDailyTaskSchema = createDailyTaskSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { error: "At least one field must be provided to update the task." },
);

export const listDailyTasksQuerySchema = z
  .object({
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
    assignedTo: assignedToSchema.optional(),
    priority: z.coerce.number().pipe(prioritySchema).optional(),
    status: statusSchema.optional(),
    dueDateFrom: dueDateSchema.optional(),
    dueDateTo: dueDateSchema.optional(),
    search: z
      .string()
      .trim()
      .min(1, "Search must not be empty.")
      .max(120, "Search must not exceed 120 characters.")
      .optional(),
  })
  .refine(
    (data) =>
      !data.dueDateFrom || !data.dueDateTo || data.dueDateFrom <= data.dueDateTo,
    {
      error: "dueDateFrom must be before or equal to dueDateTo.",
      path: ["dueDateTo"],
    },
  );
