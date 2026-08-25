export const KRA_STATUSES = ["assigned", "completed", "not_completed"] as const;

export type KraStatus = (typeof KRA_STATUSES)[number];
