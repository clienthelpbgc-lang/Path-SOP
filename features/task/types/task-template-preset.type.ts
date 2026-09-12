import type { taskTemplatePresets } from "@/features/task/schema";

export type TaskTemplatePreset = typeof taskTemplatePresets.$inferSelect;
export type NewTaskTemplatePreset = typeof taskTemplatePresets.$inferInsert;
