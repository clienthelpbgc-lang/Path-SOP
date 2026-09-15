import { z } from "zod";

import { KRA_TYPES } from "@/features/kra/constants/kra-type.constant";

export const kraTemplateIdSchema = z.uuid({
  error: "Please provide a valid template id.",
});

const nameSchema = z
  .string({ error: "Template name is required." })
  .trim()
  .min(2, "Template name must be at least 2 characters long.")
  .max(120, "Template name must not exceed 120 characters.");

const titleSchema = z
  .string({ error: "Title is required." })
  .trim()
  .min(2, "Title must be at least 2 characters long.")
  .max(200, "Title must not exceed 200 characters.");

// Blank (or whitespace-only) input collapses to `undefined` rather than
// failing validation -- this is an optional field everywhere it's used, so
// "left empty" and "not provided" must mean the same thing.
const descriptionSchema = z
  .string()
  .trim()
  .max(2000, "Description must not exceed 2000 characters.")
  .transform((value) => (value === "" ? undefined : value));

const typeSchema = z.enum(KRA_TYPES, {
  error: "Please provide a valid type.",
});

const weightageSchema = z
  .number({ error: "Weightage must be a number." })
  .int("Weightage must be an integer.")
  .min(1, "Weightage must be at least 1.")
  .max(50, "Weightage must not exceed 50.");

// Same "blank means not provided" behavior as descriptionSchema above.
const remarksSchema = z
  .string()
  .trim()
  .max(1000, "Remarks must not exceed 1000 characters.")
  .transform((value) => (value === "" ? undefined : value));

const sourceKraIdSchema = z.uuid({
  error: "Please provide a valid source KRA id.",
});

const isActiveSchema = z.boolean({
  error: "isActive must be true or false.",
});

// NOTE: this only carries the shared *shape*, not defaults -- `.partial()`
// still runs a field's `.default()` when the key is absent (not just when
// it's `undefined`), so a schema built this way is only safe for `create`.
// `update` is built separately below with plain `.optional()` fields so an
// omitted field is left untouched instead of being silently reset.
const kraTemplateBaseSchema = z.object({
  name: nameSchema,
  sourceKraId: sourceKraIdSchema.optional(),
  title: titleSchema,
  description: descriptionSchema.optional(),
  type: typeSchema,
  weightage: weightageSchema.default(1),
  remarks: remarksSchema.optional(),
  repeat: z
    .boolean({ error: "repeat must be true or false." })
    .default(false),
  isActive: isActiveSchema.default(true),
});

export const createKraTemplateSchema = kraTemplateBaseSchema;

export const updateKraTemplateSchema = z
  .object({
    name: nameSchema.optional(),
    sourceKraId: sourceKraIdSchema.optional(),
    title: titleSchema.optional(),
    description: descriptionSchema.optional(),
    type: typeSchema.optional(),
    weightage: weightageSchema.optional(),
    remarks: remarksSchema.optional(),
    repeat: z.boolean().optional(),
    isActive: isActiveSchema.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    error: "At least one field must be provided to update the template.",
  });

export const listKraTemplatesQuerySchema = z.object({
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
  type: typeSchema.optional(),
  search: z
    .string()
    .trim()
    .min(1, "Search must not be empty.")
    .max(120, "Search must not exceed 120 characters.")
    .optional(),
});
