import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .email({ error: "Please enter a valid email address." })
    .trim()
    .toLowerCase(),
  password: z
    .string({ error: "Password is required." })
    .min(1, "Password is required."),
});
