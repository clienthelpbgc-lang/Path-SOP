export const REPEAT_UNITS = ["day", "week", "month"] as const;

export type RepeatUnit = (typeof REPEAT_UNITS)[number];
