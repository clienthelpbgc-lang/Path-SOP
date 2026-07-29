import { z } from "zod";

import { USER_ROLES } from "@/features/user/constants/role.constant";

export const userIdSchema = z.uuid({
  error: "Please provide a valid user id.",
});

const nameSchema = z
  .string({ error: "Name is required." })
  .trim()
  .min(2, "Name must be at least 2 characters long.")
  .max(120, "Name must not exceed 120 characters.");

const emailSchema = z
  .email({ error: "Please provide a valid email address." })
  .trim()
  .toLowerCase()
  .max(254, "Email must not exceed 254 characters.");

const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+?[0-9\s\-()]{7,20}$/, "Please provide a valid phone number.");

const roleSchema = z.enum(USER_ROLES, {
  error: "Role must be either 'ADMIN' or 'USER'.",
});

const isActiveSchema = z.boolean({ error: "isActive must be true or false." });

const passwordSchema = z
  .string({ error: "Password is required." })
  .min(8, "Password must be at least 8 characters long.")
  .regex(/[A-Za-z]/, "Password must contain at least one letter.")
  .regex(/[0-9]/, "Password must contain at least one number.");

export const createUserSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  phone: phoneSchema.optional(),
  role: roleSchema.default("USER"),
  isActive: isActiveSchema.default(true),
});

export const updateUserSchema = createUserSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { error: "At least one field must be provided to update the user." },
);

export const listUsersQuerySchema = z.object({
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
  role: roleSchema.optional(),
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
