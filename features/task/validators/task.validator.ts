import { z } from "zod";

import { MAX_TASK_ATTACHMENTS } from "@/features/task/constants/attachment-limits.constant";
import { TASK_STATUSES } from "@/features/task/constants/task-status.constant";

import {
  checkRepeatFields,
  repeatDaysOfWeekSchema,
  repeatIntervalSchema,
  repeatUnitSchema,
} from "./repeat-fields.validator";
import { createTaskAttachmentSchema } from "./task-attachment.validator";
import { createTaskChecklistItemSchema } from "./task-checklist-item.validator";
import { createTaskReminderSchema } from "./task-reminder.validator";

export const taskIdSchema = z.uuid({
  error: "Please provide a valid task id.",
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

const assignedToSchema = z.uuid({
  error: "Please provide a valid assignee id.",
});

const weightageSchema = z
  .number({ error: "Weightage must be a number." })
  .int("Weightage must be an integer.")
  .min(1, "Weightage must be at least 1.")
  .max(10, "Weightage must not exceed 10.");

const dateSchema = z.coerce.date({ error: "Please provide a valid date." });

const statusSchema = z.enum(TASK_STATUSES, {
  error: "Please provide a valid status.",
});

const completionRemarksSchema = z
  .string()
  .trim()
  .min(1, "Completion remarks cannot be empty.")
  .max(1000, "Completion remarks must not exceed 1000 characters.");

const repeatEndsAtSchema = dateSchema;

function checkDueAfterStart(
  data: { startAt?: Date; dueAt?: Date },
  ctx: z.RefinementCtx,
) {
  if (data.startAt && data.dueAt && data.dueAt < data.startAt) {
    ctx.addIssue({
      code: "custom",
      path: ["dueAt"],
      message: "Due date must be on or after the start date.",
    });
  }
}

// Only enforced on creation -- updating an existing task must still allow a
// `startAt` that has already passed.
function checkStartNotPast(
  data: { startAt?: Date },
  ctx: z.RefinementCtx,
) {
  if (data.startAt && data.startAt < new Date()) {
    ctx.addIssue({
      code: "custom",
      path: ["startAt"],
      message: "Start date must not be before the current date and time.",
    });
  }
}

const taskBaseSchema = z.object({
  title: titleSchema,
  description: descriptionSchema.optional(),
  assignedTo: assignedToSchema,
  weightage: weightageSchema.default(1),
  startAt: dateSchema,
  dueAt: dateSchema,
  isRepeating: z
    .boolean({ error: "isRepeating must be true or false." })
    .default(false),
  repeatUnit: repeatUnitSchema.optional(),
  repeatInterval: repeatIntervalSchema.optional(),
  repeatDaysOfWeek: repeatDaysOfWeekSchema.optional(),
  repeatEndsAt: repeatEndsAtSchema.optional(),
  // Only ever set at creation time, when a task is instantiated from a
  // template -- not part of `updateTaskSchema`, which has its own explicit
  // field list below.
  templateId: z.uuid({ error: "Please provide a valid template id." }).optional(),
});

const checklistItemInputSchema = createTaskChecklistItemSchema.omit({
  taskId: true,
});

const reminderInputSchema = createTaskReminderSchema.omit({ taskId: true });

const attachmentInputSchema = createTaskAttachmentSchema.omit({
  taskId: true,
});

const watcherIdSchema = z.uuid({
  error: "Please provide a valid watcher id.",
});

export const createTaskWithRelationsSchema = taskBaseSchema
  .extend({
    checklistItems: z.array(checklistItemInputSchema).default([]),
    reminders: z.array(reminderInputSchema).default([]),
    attachments: z
      .array(attachmentInputSchema)
      .max(
        MAX_TASK_ATTACHMENTS,
        `A task can have at most ${MAX_TASK_ATTACHMENTS} attachments.`,
      )
      .default([]),
    watcherIds: z.array(watcherIdSchema).default([]),
  })
  .superRefine((data, ctx) => {
    checkStartNotPast(data, ctx);
    checkDueAfterStart(data, ctx);
    checkRepeatFields("task")(data, ctx);
  });

export const updateTaskSchema = z
  .object({
    title: titleSchema.optional(),
    description: descriptionSchema.optional(),
    assignedTo: assignedToSchema.optional(),
    weightage: weightageSchema.optional(),
    startAt: dateSchema.optional(),
    dueAt: dateSchema.optional(),
    status: statusSchema.optional(),
    completionRemarks: completionRemarksSchema.optional(),
    isRepeating: z.boolean().optional(),
    repeatUnit: repeatUnitSchema.optional(),
    repeatInterval: repeatIntervalSchema.optional(),
    repeatDaysOfWeek: repeatDaysOfWeekSchema.optional(),
    repeatEndsAt: repeatEndsAtSchema.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    error: "At least one field must be provided to update the task.",
  })
  .superRefine((data, ctx) => {
    checkDueAfterStart(data, ctx);
    checkRepeatFields("task")(data, ctx);
  });

export const listTasksQuerySchema = z
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
    status: statusSchema.optional(),
    isRepeating: z
      .enum(["true", "false"], {
        error: "isRepeating must be 'true' or 'false'.",
      })
      .transform((value) => value === "true")
      .optional(),
    overdue: z
      .enum(["true", "false"], {
        error: "overdue must be 'true' or 'false'.",
      })
      .transform((value) => value === "true")
      .optional(),
    dueDateFrom: dateSchema.optional(),
    dueDateTo: dateSchema.optional(),
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
