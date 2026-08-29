import { z } from "zod";

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

const passwordSchema = z
  .string({ error: "Password is required." })
  .min(8, "Password must be at least 8 characters long.")
  .regex(/[A-Za-z]/, "Password must contain at least one letter.")
  .regex(/[0-9]/, "Password must contain at least one number.");

export const createPlatformAdminSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
});
