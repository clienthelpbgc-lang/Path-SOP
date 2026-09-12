import type { ReminderAnchor } from "@/features/task/constants/reminder-anchor.constant";
import type { ReminderChannel } from "@/features/task/constants/reminder-channel.constant";
import type { RepeatUnit } from "@/features/task/constants/repeat-unit.constant";

// The subset of a TaskTemplate that CreateTaskDialog actually reads to
// prefill a new task. TaskTemplate satisfies this unchanged. A
// TaskTemplatePreset also satisfies it once mapped through
// taskTemplatePresetToTemplateLike -- deliberately WITHOUT `id`, so
// `template?.id` (used as the new task's `templateId` FK) comes out
// `undefined` for a preset instead of pointing at a row that isn't a real
// task_templates id.
export interface TaskTemplateLike {
  id?: string;
  name: string;
  title: string;
  description: string | null;
  weightage: number;
  checklist: { text: string; sortOrder: number }[];
  reminders: {
    channel: ReminderChannel;
    anchor: ReminderAnchor;
    offsetMinutes: number;
  }[];
  isRepeating: boolean;
  repeatUnit: RepeatUnit | null;
  repeatInterval: number | null;
  repeatDaysOfWeek: number[] | null;
}
