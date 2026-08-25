import { z } from "zod";

import { ATTACHMENT_CONTEXTS } from "@/features/task/constants/attachment-context.constant";

export const taskAttachmentIdSchema = z.uuid({
  error: "Please provide a valid attachment id.",
});

const taskIdSchema = z.uuid({
  error: "Please provide a valid task id.",
});

export const createTaskAttachmentSchema = z.object({
  taskId: taskIdSchema,
  context: z
    .enum(ATTACHMENT_CONTEXTS, {
      error: "Please provide a valid attachment context.",
    })
    .default("initial"),
  fileKey: z
    .string({ error: "File key is required." })
    .trim()
    .min(1, "File key cannot be empty.")
    .max(1024, "File key must not exceed 1024 characters."),
  fileName: z
    .string({ error: "File name is required." })
    .trim()
    .min(1, "File name cannot be empty.")
    .max(255, "File name must not exceed 255 characters."),
  mimeType: z
    .string()
    .trim()
    .min(1, "Mime type cannot be empty.")
    .max(255, "Mime type must not exceed 255 characters.")
    .optional(),
  sizeBytes: z
    .number({ error: "Size must be a number." })
    .int("Size must be an integer.")
    .min(0, "Size cannot be negative.")
    .optional(),
});
