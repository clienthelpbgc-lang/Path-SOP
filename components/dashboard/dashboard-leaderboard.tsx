import { Trophy } from "lucide-react";

import type { DashboardLeaderboardEntry } from "@/features/dashboard/types";
import { LIST_CARD_HEIGHT } from "@/components/dashboard/constants";
import { PagePlaceholder } from "@/components/layout/page-placeholder";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getAvatarColor } from "@/lib/avatar";
import { cn } from "@/lib/utils";

const RANK_BADGE_CLASSES: Record<number, string> = {
  1: "bg-amber-500/10 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
  2: "bg-slate-500/10 text-slate-600 dark:bg-slate-500/15 dark:text-slate-400",
  3: "bg-orange-500/10 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400",
};

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function DashboardLeaderboard({
  entries,
  currentUserId,
}: {
  entries: DashboardLeaderboardEntry[];
  currentUserId: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Leaderboard · This Month</CardTitle>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <div className={`${LIST_CARD_HEIGHT} flex items-center justify-center`}>
            <PagePlaceholder
              icon={Trophy}
              title="No completions yet"
              description="Complete tasks this month to appear on the leaderboard."
            />
          </div>
        ) : (
          <ScrollArea className={LIST_CARD_HEIGHT}>
            <ul className="flex flex-col gap-4 pr-3">
              {entries.map((entry, index) => {
                const rank = index + 1;
                const isCurrentUser = entry.userId === currentUserId;

                return (
                  <li
                    key={entry.userId}
                    className={cn(
                      "flex items-center gap-3 rounded-lg",
                      isCurrentUser && "bg-accent/50 px-2 py-1 -mx-2",
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                        RANK_BADGE_CLASSES[rank] ??
                          "bg-muted text-muted-foreground",
                      )}
                    >
                      {rank}
                    </span>
                    <Avatar size="sm">
                      <AvatarFallback
                        className={`text-white ${getAvatarColor(entry.userId)}`}
                      >
                        {initials(entry.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                      {entry.name}
                      {isCurrentUser && (
                        <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                          (you)
                        </span>
                      )}
                    </span>
                    <span className="shrink-0 text-sm font-semibold text-foreground">
                      {entry.completedCount}
                    </span>
                  </li>
                );
              })}
            </ul>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

export function DashboardLeaderboardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Leaderboard · This Month</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className={`${LIST_CARD_HEIGHT} flex flex-col gap-4`}>
          {[0, 1, 2].map((i) => (
            <li key={i} className="flex items-center gap-3">
              <div className="size-6 shrink-0 animate-pulse rounded-full bg-muted" />
              <div className="size-8 shrink-0 animate-pulse rounded-full bg-muted" />
              <div className="h-4 flex-1 animate-pulse rounded bg-muted" />
              <div className="h-4 w-4 animate-pulse rounded bg-muted" />
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
