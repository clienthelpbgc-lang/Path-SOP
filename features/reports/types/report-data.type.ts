import type { KraStatus } from "@/features/kra/constants/kra-status.constant";
import type { KraType } from "@/features/kra/constants/kra-type.constant";
import type { TaskStatus } from "@/features/task/constants/task-status.constant";

export type ReportTaskRow = {
  id: string;
  title: string;
  status: TaskStatus;
  dueAt: Date;
  weightage: number;
};

export type ReportKraRow = {
  id: string;
  title: string;
  status: KraStatus;
  type: KraType;
  periodStart: Date;
  periodEnd: Date;
  weightage: number;
};

export type ReportWeightageStats = {
  total: number;
  completed: number;
  rate: number;
};

export type ReportData = {
  companyName: string;
  user: { id: string; name: string; email: string };
  periodLabel: string;
  periodStart: Date;
  periodEnd: Date;
  generatedAt: Date;
  performanceScore: { score: number; taskScore: number; kraScore: number };
  taskStats: ReportWeightageStats;
  kraStats: ReportWeightageStats;
  tasks: ReportTaskRow[];
  kras: ReportKraRow[];
};
