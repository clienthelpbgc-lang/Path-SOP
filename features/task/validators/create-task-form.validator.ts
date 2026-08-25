import { z } from "zod";

import { checkRepeatFields } from "./repeat-fields.validator";
import {
  checkTaskFormDueDate,
  checkTaskFormStartNotPast,
  taskFormBaseSchema,
} from "./task-form-fields.validator";

// Client-side shape for the "New task" form. Distinct from
// `createTaskWithRelationsSchema`: attachments are tracked as separate
// upload state rather than a form field, and checklist items are simplified
// to what react-hook-form actually needs.
export const createTaskFormSchema = taskFormBaseSchema
  .extend({
    checklistItems: z.array(z.object({ text: z.string() })),
    watcherIds: z.array(z.uuid()),
  })
  .superRefine((data, ctx) => {
    checkTaskFormStartNotPast(data, ctx);
    checkTaskFormDueDate(data, ctx);
    checkRepeatFields("task")(data, ctx);
  });
