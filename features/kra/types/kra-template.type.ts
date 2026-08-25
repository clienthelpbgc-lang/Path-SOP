import type { kraTemplates } from "@/features/kra/schema";

export type KraTemplate = typeof kraTemplates.$inferSelect;
export type NewKraTemplate = typeof kraTemplates.$inferInsert;
