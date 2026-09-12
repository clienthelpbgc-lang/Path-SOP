import { z } from "zod";

import { KRA_TYPES } from "@/features/kra/constants/kra-type.constant";

export const kraTemplatePresetIdSchema = z.uuid({
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

const typeSchema = z.enum(KRA_TYPES, {
  error: "Please provide a valid type.",
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

const isActiveSchema = z.boolean({
  error: "isActive must be true or false.",
});

// Same NOTE as kra-template.validator.ts: this only carries the shared
// *shape*, not defaults -- `update` is built separately below with plain
// `.optional()` fields so an omitted field is left untouched instead of
// being silently reset.
const kraTemplatePresetBaseSchema = z.object({
  name: nameSchema,
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

export const createKraTemplatePresetSchema = kraTemplatePresetBaseSchema;

export const updateKraTemplatePresetSchema = z
  .object({
    name: nameSchema.optional(),
    title: titleSchema.optional(),
    description: descriptionSchema.optional(),
    type: typeSchema.optional(),
    weightage: weightageSchema.optional(),
    remarks: remarksSchema.optional(),
    repeat: z.boolean().optional(),
    isActive: isActiveSchema.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    error: "At least one field must be provided to update the preset.",
  });

export const listKraTemplatePresetsQuerySchema = z.object({
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
