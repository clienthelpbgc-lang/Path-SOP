import type { kraTemplatePresets } from "@/features/kra/schema";

export type KraTemplatePreset = typeof kraTemplatePresets.$inferSelect;
export type NewKraTemplatePreset = typeof kraTemplatePresets.$inferInsert;
