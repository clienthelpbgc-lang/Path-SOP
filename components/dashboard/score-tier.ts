export const SCORE_TIERS = {
  low: {
    bg: "bg-red-500/10 dark:bg-red-500/15",
    ring: "ring-red-500/20",
    text: "text-red-600 dark:text-red-400",
    label: "Needs attention",
  },
  mid: {
    bg: "bg-amber-500/10 dark:bg-amber-500/15",
    ring: "ring-amber-500/20",
    text: "text-amber-600 dark:text-amber-400",
    label: "On track",
  },
  high: {
    bg: "bg-emerald-500/10 dark:bg-emerald-500/15",
    ring: "ring-emerald-500/20",
    text: "text-emerald-600 dark:text-emerald-400",
    label: "Excellent",
  },
} as const;

export type ScoreTierKey = keyof typeof SCORE_TIERS;

export function getScoreTier(score: number): ScoreTierKey {
  if (score < 50) return "low";
  if (score <= 70) return "mid";
  return "high";
}
