import { Trophy } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";

import type { AdminLeaderboardEntry } from "@/features/dashboard/types";
import { LIST_CARD_HEIGHT } from "@/components/dashboard/constants";
import { getScoreTier, SCORE_TIERS } from "@/components/dashboard/score-tier";
import { PagePlaceholder } from "@/components/layout/page-placeholder";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getAvatarColor } from "@/lib/avatar";
import { cn } from "@/lib/utils";

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function AdminLeaderboardCard({
  title,
  icon: Icon = Trophy,
  entries,
  emptyDescription,
}: {
  title: string;
  icon?: LucideIcon;
  entries: AdminLeaderboardEntry[];
  emptyDescription: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <div className={`${LIST_CARD_HEIGHT} flex items-center justify-center`}>
            <PagePlaceholder icon={Icon} title="No data yet" description={emptyDescription} />
          </div>
        ) : (
          <ScrollArea className={LIST_CARD_HEIGHT}>
            <ul className="flex flex-col gap-4 pr-3">
              {entries.map((entry, index) => {
                const tier = SCORE_TIERS[getScoreTier(entry.score)];

                return (
                  <li key={entry.userId}>
                    <Link
                      href={`/admin-dashboard/${entry.userId}`}
                      className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-1 transition-colors hover:bg-accent/50"
                    >
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                        {index + 1}
                      </span>
                      <Avatar size="sm">
                        <AvatarFallback
                          className={`text-white ${getAvatarColor(entry.userId)}`}
                        >
                          {initials(entry.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate text-sm font-medium text-foreground">
                          {entry.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {entry.completed}/{entry.total} pts completed
                        </span>
                      </div>
                      <span
                        className={cn(
                          "shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold",
                          tier.bg,
                          tier.text,
                        )}
                      >
                        {entry.score}%
                      </span>
                    </Link>
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

export function AdminLeaderboardCardSkeleton({ title }: { title: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className={`${LIST_CARD_HEIGHT} flex flex-col gap-4`}>
          {[0, 1, 2].map((i) => (
            <li key={i} className="flex items-center gap-3">
              <div className="size-6 shrink-0 animate-pulse rounded-full bg-muted" />
              <div className="size-8 shrink-0 animate-pulse rounded-full bg-muted" />
              <div className="h-4 flex-1 animate-pulse rounded bg-muted" />
              <div className="h-5 w-10 animate-pulse rounded-full bg-muted" />
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
