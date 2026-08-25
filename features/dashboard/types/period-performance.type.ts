export type PeriodWeightageStats = {
  total: number;
  completed: number;
  rate: number;
};

export type PeriodPerformance = {
  periodLabel: string;
  taskStats: PeriodWeightageStats;
  kraStats: PeriodWeightageStats;
  performanceScore: { score: number; taskScore: number; kraScore: number };
};
