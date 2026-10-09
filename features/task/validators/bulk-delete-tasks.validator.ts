import { z } from "zod";

// One page of the task table (see TaskList's PAGE_SIZE) fits comfortably;
// the cap just bounds how much a single request can do.
export const BULK_DELETE_TASKS_MAX = 100;

export const bulkDeleteTasksSchema = z.object({
  ids: z
    .array(z.uuid({ error: "Please provide valid task ids." }), {
      error: "Please provide the tasks to delete.",
    })
    .min(1, "Select at least one task to delete.")
    .max(
      BULK_DELETE_TASKS_MAX,
      `You can delete at most ${BULK_DELETE_TASKS_MAX} tasks at once.`,
    )
    .transform((ids) => [...new Set(ids)]),
});

export type BulkDeleteTasksInput = z.input<typeof bulkDeleteTasksSchema>;
