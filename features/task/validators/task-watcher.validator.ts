import { z } from "zod";

export const createTaskWatcherSchema = z.object({
  taskId: z.uuid({ error: "Please provide a valid task id." }),
  userId: z.uuid({ error: "Please provide a valid user id." }),
});
