import type { kras } from "@/features/kra/schema";

export type Kra = typeof kras.$inferSelect;
export type NewKra = typeof kras.$inferInsert;
