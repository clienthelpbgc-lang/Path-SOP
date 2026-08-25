import type { DashboardPerformanceScore } from "@/features/dashboard/types";
import { getScoreTier, SCORE_TIERS } from "@/components/dashboard/score-tier";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function DashboardScoreCard({
  performance,
}: {
  performance: DashboardPerformanceScore;
}) {
  const tier = SCORE_TIERS[getScoreTier(performance.score)];

  return (
    <Card className={cn("h-full ring-1", tier.bg, tier.ring)}>
      <CardContent className="flex h-full flex-col items-center justify-center gap-1 text-center">
        <span className={cn("text-3xl font-bold tracking-tight", tier.text)}>
          {performance.score}%
        </span>
        <span className="text-sm font-medium text-foreground">
          Performance Score
        </span>
        <span className={cn("text-xs", tier.text)}>{tier.label}</span>
      </CardContent>
    </Card>
  );
}

export function DashboardScoreCardSkeleton() {
  return (
    <Card className="h-full">
      <CardContent className="flex h-full flex-col items-center justify-center gap-2">
        <div className="h-8 w-16 animate-pulse rounded bg-muted" />
        <div className="h-4 w-28 animate-pulse rounded bg-muted" />
        <div className="h-3 w-20 animate-pulse rounded bg-muted" />
      </CardContent>
    </Card>
  );
}
