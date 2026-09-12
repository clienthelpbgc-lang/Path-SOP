import type { KraType } from "@/features/kra/constants/kra-type.constant";

// The subset of a KraTemplate that CreateKraDialog actually reads to
// prefill a new KRA. KraTemplate satisfies this unchanged. A
// KraTemplatePreset also satisfies it once mapped through
// kraTemplatePresetToTemplateLike -- deliberately WITHOUT `id`, so
// `template?.id` (used as the new KRA's `templateId` FK) comes out
// `undefined` for a preset instead of pointing at a row that isn't a real
// kra_templates id.
export interface KraTemplateLike {
  id?: string;
  name: string;
  title: string;
  description: string | null;
  type: KraType;
  repeat: boolean;
  weightage: number;
  remarks: string | null;
}
