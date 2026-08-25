import { z } from "zod";

import { KRA_STATUSES } from "@/features/kra/constants/kra-status.constant";
import { KRA_TYPES } from "@/features/kra/constants/kra-type.constant";

export const kraIdSchema = z.uuid({
  error: "Please provide a valid KRA id.",
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

const statusSchema = z.enum(KRA_STATUSES, {
  error: "Please provide a valid status.",
});

const typeSchema = z.enum(KRA_TYPES, {
  error: "Please provide a valid type.",
});

const periodDateSchema = z.coerce.date({
  error: "Please provide a valid date.",
});

const assignedToSchema = z.uuid({
  error: "Please provide a valid assignee id.",
});

const assignedBySchema = z.uuid({
  error: "Please provide a valid assigner id.",
});

const weightageSchema = z
  .number({ error: "Weightage must be a number." })
  .int("Weightage must be an integer.")
  .min(1, "Weightage must be at least 1.")
  .max(10, "Weightage must not exceed 10.");

const remarksSchema = z
  .string()
  .trim()
  .min(1, "Remarks cannot be empty.")
  .max(1000, "Remarks must not exceed 1000 characters.");

// Only ever set by the assigning admin at creation time -- `assignedBy` is
// taken from the authenticated session server-side, so it stays out of both
// schemas below (mirrors how `createdBy` is handled for tasks). Exported so
// the "New KRA" form can build its own shape on top (e.g. omitting `status`,
// which is never a form field) without duplicating every field definition.
export const kraBaseSchema = z.object({
  title: titleSchema,
  description: descriptionSchema.optional(),
  status: statusSchema.default("assigned"),
  type: typeSchema,
  periodStart: periodDateSchema,
  periodEnd: periodDateSchema,
  repeat: z
    .boolean({ error: "repeat must be true or false." })
    .default(false),
  assignedTo: assignedToSchema,
  weightage: weightageSchema.default(1),
  remarks: remarksSchema.optional(),
  // Only ever set at creation time, when a KRA is instantiated from a
  // template -- not part of `updateKraSchema`, which has its own explicit
  // field list below.
  templateId: z
    .uuid({ error: "Please provide a valid template id." })
    .optional(),
});

export function checkPeriodEndAfterStart(
  data: { periodStart?: Date; periodEnd?: Date },
  ctx: z.RefinementCtx,
) {
  if (
    data.periodStart &&
    data.periodEnd &&
    data.periodEnd < data.periodStart
  ) {
    ctx.addIssue({
      code: "custom",
      path: ["periodEnd"],
      message: "Period end must be on or after the period start.",
    });
  }
}

export const createKraSchema = kraBaseSchema.superRefine(
  checkPeriodEndAfterStart,
);

// `assignedTo` and `assignedBy` are deliberately absent -- who a KRA is
// assigned to/by is fixed at creation time and is not part of what an admin
// can edit afterward.
export const updateKraSchema = z
  .object({
    title: titleSchema.optional(),
    description: descriptionSchema.optional(),
    status: statusSchema.optional(),
    type: typeSchema.optional(),
    periodStart: periodDateSchema.optional(),
    periodEnd: periodDateSchema.optional(),
    repeat: z.boolean().optional(),
    weightage: weightageSchema.optional(),
    remarks: remarksSchema.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    error: "At least one field must be provided to update the KRA.",
  })
  .superRefine(checkPeriodEndAfterStart);

export const listKrasQuerySchema = z
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
    assignedBy: assignedBySchema.optional(),
    status: statusSchema.optional(),
    type: typeSchema.optional(),
    periodStartFrom: periodDateSchema.optional(),
    periodStartTo: periodDateSchema.optional(),
    search: z
      .string()
      .trim()
      .min(1, "Search must not be empty.")
      .max(120, "Search must not exceed 120 characters.")
      .optional(),
  })
  .refine(
    (data) =>
      !data.periodStartFrom ||
      !data.periodStartTo ||
      data.periodStartFrom <= data.periodStartTo,
    {
      error: "periodStartFrom must be before or equal to periodStartTo.",
      path: ["periodStartTo"],
    },
  );
