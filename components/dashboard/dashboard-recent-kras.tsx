"use client";

import { useState } from "react";
import { Target } from "lucide-react";

import type { DashboardRecentKra } from "@/features/dashboard/types";
import { LIST_CARD_HEIGHT } from "@/components/dashboard/constants";
import { KraDetailsSheet } from "@/components/kra/kra-details-sheet";
import { KRA_TYPE_LABELS } from "@/components/kra/kra-form-constants";
import { KraStatusBadge } from "@/components/kra/kra-status-badge";
import { PagePlaceholder } from "@/components/layout/page-placeholder";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getAvatarColor } from "@/lib/avatar";

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

export function DashboardRecentKras({
  kras,
}: {
  kras: DashboardRecentKra[];
}) {
  const [selectedKraId, setSelectedKraId] = useState<string | null>(null);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recently Assigned KRAs</CardTitle>
      </CardHeader>
      <CardContent>
        {kras.length === 0 ? (
          <div className={`${LIST_CARD_HEIGHT} flex items-center justify-center`}>
            <PagePlaceholder
              icon={Target}
              title="No KRAs yet"
              description="KRAs assigned to you will show up here."
            />
          </div>
        ) : (
          <ScrollArea className={LIST_CARD_HEIGHT}>
            <ul className="flex flex-col gap-4 pr-3">
              {kras.map((kra) => (
                <li
                  key={kra.id}
                  onClick={() => setSelectedKraId(kra.id)}
                  className="-mx-2 flex cursor-pointer items-center gap-3 rounded-md px-2 py-1 transition-colors hover:bg-muted/40"
                >
                  <Avatar size="sm">
                    <AvatarFallback
                      className={`text-white ${getAvatarColor(kra.assignedBy.id)}`}
                    >
                      {initials(kra.assignedBy.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm font-medium text-foreground">
                      {kra.title}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {KRA_TYPE_LABELS[kra.type]} · Ends {formatDate(kra.periodEnd)}
                    </span>
                  </div>
                  <KraStatusBadge status={kra.status} className="shrink-0" />
                </li>
              ))}
            </ul>
          </ScrollArea>
        )}
      </CardContent>
      <KraDetailsSheet
        kraId={selectedKraId}
        onOpenChange={(open) => {
          if (!open) setSelectedKraId(null);
        }}
      />
    </Card>
  );
}

export function DashboardRecentKrasSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recently Assigned KRAs</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className={`${LIST_CARD_HEIGHT} flex flex-col gap-4`}>
          {[0, 1, 2].map((i) => (
            <li key={i} className="flex items-center gap-3">
              <div className="size-8 shrink-0 animate-pulse rounded-full bg-muted" />
              <div className="flex flex-1 flex-col gap-2">
                <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
