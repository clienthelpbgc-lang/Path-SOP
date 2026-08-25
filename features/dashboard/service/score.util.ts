export type WeightageTotals = { total: number; completed: number };

export function weightageRate({ total, completed }: WeightageTotals): number {
  return total > 0 ? Math.round((completed / total) * 100) : 0;
}
