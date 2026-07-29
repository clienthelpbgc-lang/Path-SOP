import { z } from "zod";

export const companyIdSchema = z.uuid({
  error: "Please provide a valid company id.",
});

const nameSchema = z
  .string({ error: "Name is required." })
  .trim()
  .min(2, "Name must be at least 2 characters long.")
  .max(120, "Name must not exceed 120 characters.");

const logoSchema = z
  .url({ error: "Logo must be a valid URL." })
  .max(2048, "Logo URL must not exceed 2048 characters.");

const emailSchema = z
  .email({ error: "Please provide a valid email address." })
  .trim()
  .toLowerCase()
  .max(254, "Email must not exceed 254 characters.");

const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+?[0-9\s\-()]{7,20}$/, "Please provide a valid phone number.");

const addressSchema = z
  .string()
  .trim()
  .min(1, "Address cannot be empty.")
  .max(255, "Address must not exceed 255 characters.");

const isActiveSchema = z.boolean({ error: "isActive must be true or false." });

export const createCompanySchema = z.object({
  name: nameSchema,
  logo: logoSchema.optional(),
  email: emailSchema,
  phone: phoneSchema.optional(),
  address: addressSchema.optional(),
  isActive: isActiveSchema.default(true),
});

export const updateCompanySchema = createCompanySchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    error: "At least one field must be provided to update the company.",
  });

export const listCompaniesQuerySchema = z.object({
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
  search: z
    .string()
    .trim()
    .min(1, "Search must not be empty.")
    .max(120, "Search must not exceed 120 characters.")
    .optional(),
});
