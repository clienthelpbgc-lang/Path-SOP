import type { TaskTemplateLike } from "@/features/task/types/task-template-like.type";
import type { TaskTemplatePreset } from "@/features/task/types/task-template-preset.type";

// Deliberately omits `id` -- see TaskTemplateLike for why.
export function taskTemplatePresetToTemplateLike(
  preset: TaskTemplatePreset,
): TaskTemplateLike {
  return {
    name: preset.name,
    title: preset.title,
    description: preset.description,
    weightage: preset.weightage,
    checklist: preset.checklist,
    reminders: preset.reminders,
    isRepeating: preset.isRepeating,
    repeatUnit: preset.repeatUnit,
    repeatInterval: preset.repeatInterval,
    repeatDaysOfWeek: preset.repeatDaysOfWeek,
  };
}
