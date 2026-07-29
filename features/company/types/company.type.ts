import type { companies } from "@/features/company/schema";

export type Company = typeof companies.$inferSelect;
export type NewCompany = typeof companies.$inferInsert;
