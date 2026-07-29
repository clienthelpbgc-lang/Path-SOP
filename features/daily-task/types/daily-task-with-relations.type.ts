import type { User } from "@/features/user/types";
import type { DailyTask } from "@/features/daily-task/types/daily-task.type";

export type DailyTaskParty = Pick<User, "id" | "name" | "email">;

export type DailyTaskWithRelations = DailyTask & {
  assignee: DailyTaskParty;
  assigner: DailyTaskParty;
};
