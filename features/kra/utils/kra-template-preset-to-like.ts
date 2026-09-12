import type { KraTemplateLike } from "@/features/kra/types/kra-template-like.type";
import type { KraTemplatePreset } from "@/features/kra/types/kra-template-preset.type";

// Deliberately omits `id` -- see KraTemplateLike for why.
export function kraTemplatePresetToTemplateLike(
  preset: KraTemplatePreset,
): KraTemplateLike {
  return {
    name: preset.name,
    title: preset.title,
    description: preset.description,
    type: preset.type,
    repeat: preset.repeat,
    weightage: preset.weightage,
    remarks: preset.remarks,
  };
}
