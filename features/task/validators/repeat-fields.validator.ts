import { z } from "zod";

import { REPEAT_UNITS } from "@/features/task/constants/repeat-unit.constant";

export const repeatUnitSchema = z.enum(REPEAT_UNITS, {
  error: "Please provide a valid repeat unit.",
});

export const repeatIntervalSchema = z
  .number({ error: "Repeat interval must be a number." })
  .int("Repeat interval must be an integer.")
  .min(1, "Repeat interval must be at least 1.");

export const repeatDaysOfWeekSchema = z
  .array(
    z
      .number()
      .int()
      .min(0, "Day of week must be between 0 and 6.")
      .max(6, "Day of week must be between 0 and 6."),
  )
  .min(1, "Provide at least one day of the week.");

interface RepeatFields {
  isRepeating?: boolean;
  repeatUnit?: string;
  repeatInterval?: number;
  repeatDaysOfWeek?: number[];
}

/** Shared by `tasks`, `task_templates` and `task_template_presets`, whose repeat config columns are identical. */
export function checkRepeatFields(noun: "task" | "template" | "preset") {
  return (data: RepeatFields, ctx: z.RefinementCtx) => {
    if (data.isRepeating) {
      if (!data.repeatUnit) {
        ctx.addIssue({
          code: "custom",
          path: ["repeatUnit"],
          message: `Repeat unit is required for a repeating ${noun}.`,
        });
      }
      if (!data.repeatInterval) {
        ctx.addIssue({
          code: "custom",
          path: ["repeatInterval"],
          message: `Repeat interval is required for a repeating ${noun}.`,
        });
      }
    }
    if (
      data.repeatDaysOfWeek &&
      data.repeatDaysOfWeek.length > 0 &&
      data.repeatUnit !== "week"
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["repeatDaysOfWeek"],
        message: "Days of week can only be set when the repeat unit is weekly.",
      });
    }
  };
}
