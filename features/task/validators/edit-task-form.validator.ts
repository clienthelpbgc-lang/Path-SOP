import { z } from "zod";

import { checkRepeatFields } from "./repeat-fields.validator";
import {
  checkTaskFormDueDate,
  taskFormBaseSchema,
} from "./task-form-fields.validator";

// Client-side shape for the "Edit task" form. Mirrors `createTaskFormSchema`,
// but each checklist item also carries the original row's id (when it has
// one) so the dialog can diff added/edited/removed rows against the
// checklist-item create/update/delete endpoints on submit.
export const editTaskFormSchema = taskFormBaseSchema
  .extend({
    checklistItems: z.array(
      z.object({ itemId: z.uuid().optional(), text: z.string() }),
    ),
    watcherIds: z.array(z.uuid()),
  })
  .superRefine((data, ctx) => {
    checkTaskFormDueDate(data, ctx);
    checkRepeatFields("task")(data, ctx);
  });
