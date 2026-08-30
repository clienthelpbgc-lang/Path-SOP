import { weightageRate } from "./score.util";
import type {
  AdminLeaderboardEntry,
  AdminOverallLeaderboardEntry,
} from "../types";

export type UserWeightageRow = {
  userId: string;
  name: string;
  total: number;
  completed: number;
};

const DEFAULT_LEADERBOARD_LIMIT = 5;

export function buildLeaderboard(
  rows: UserWeightageRow[],
  limit: number = DEFAULT_LEADERBOARD_LIMIT,
): AdminLeaderboardEntry[] {
  return rows
    .filter((row) => row.total > 0)
    .map((row) => ({
      userId: row.userId,
      name: row.name,
      completed: row.completed,
      total: row.total,
      score: weightageRate(row),
    }))
    .sort((a, b) => b.score - a.score || b.completed - a.completed)
    .slice(0, limit);
}

// Same 50/50 task+KRA split as the personal dashboard's performance score,
// applied per team member instead of just the current user. `taskRows` and
// `kraRows` come from two separate grouped-by-user aggregate queries -- a
// user missing from one side is treated as having zero weightage there.
export function buildOverallLeaderboard(
  taskRows: UserWeightageRow[],
  kraRows: UserWeightageRow[],
  limit: number = DEFAULT_LEADERBOARD_LIMIT,
): AdminOverallLeaderboardEntry[] {
  const byUser = new Map<
    string,
    { name: string; task: UserWeightageRow; kra: UserWeightageRow }
  >();

  for (const row of taskRows) {
    byUser.set(row.userId, {
      name: row.name,
      task: row,
      kra: { userId: row.userId, name: row.name, total: 0, completed: 0 },
    });
  }
  for (const row of kraRows) {
    const existing = byUser.get(row.userId);
    if (existing) {
      existing.kra = row;
    } else {
      byUser.set(row.userId, {
        name: row.name,
        task: { userId: row.userId, name: row.name, total: 0, completed: 0 },
        kra: row,
      });
    }
  }

  return Array.from(byUser.entries())
    .filter(([, entry]) => entry.task.total > 0 || entry.kra.total > 0)
    .map(([userId, entry]) => {
      const taskScore = weightageRate(entry.task);
      const kraScore = weightageRate(entry.kra);
      return {
        userId,
        name: entry.name,
        taskScore,
        kraScore,
        score: Math.round(taskScore * 0.5 + kraScore * 0.5),
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
