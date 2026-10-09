import { z } from "zod";

import { passwordSchema } from "@/features/user/validation";

const emailSchema = z
  .email({ error: "Please enter a valid email address." })
  .trim()
  .toLowerCase()
  .max(254, "Email must not exceed 254 characters.");

export const loginSchema = z.object({
  email: emailSchema,
  password: z
    .string({ error: "Password is required." })
    .min(1, "Password is required."),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

const confirmPasswordSchema = z
  .string({ error: "Please confirm your password." })
  .min(1, "Please confirm your password.");

export const resetPasswordSchema = z
  .object({
    tokenHash: z
      .string({ error: "This reset link is invalid." })
      .min(1, "This reset link is invalid.")
      .max(512, "This reset link is invalid."),
    password: passwordSchema,
    confirmPassword: confirmPasswordSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string({ error: "Current password is required." })
      .min(1, "Current password is required."),
    newPassword: passwordSchema,
    confirmPassword: confirmPasswordSchema,
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    error: "Passwords do not match.",
    path: ["confirmPassword"],
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    error: "New password must be different from your current password.",
    path: ["newPassword"],
  });

export type ChangePasswordInput = z.input<typeof changePasswordSchema>;
