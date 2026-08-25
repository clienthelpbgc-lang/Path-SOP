export const KRA_TYPES = ["monthly", "weekly"] as const;

export type KraType = (typeof KRA_TYPES)[number];
