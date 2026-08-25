import { Users } from "lucide-react";
import Link from "next/link";

import type { AdminMemberWorkload } from "@/features/dashboard/types";
import { LIST_CARD_HEIGHT } from "@/components/dashboard/constants";
import { PagePlaceholder } from "@/components/layout/page-placeholder";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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

export function AdminMemberWorkload({
  members,
}: {
  members: AdminMemberWorkload[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Workload</CardTitle>
      </CardHeader>
      <CardContent>
        {members.length === 0 ? (
          <div className={`${LIST_CARD_HEIGHT} flex items-center justify-center`}>
            <PagePlaceholder
              icon={Users}
              title="No team members"
              description="Active team members and their open tasks will show up here."
            />
          </div>
        ) : (
          <ScrollArea className={LIST_CARD_HEIGHT}>
            <ul className="flex flex-col gap-4 pr-3">
              {members.map((member) => (
                <li key={member.userId}>
                  <Link
                    href={`/admin-dashboard/${member.userId}`}
                    className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-1 transition-colors hover:bg-accent/50"
                  >
                    <Avatar size="sm">
                      <AvatarFallback
                        className={`text-white ${getAvatarColor(member.userId)}`}
                      >
                        {initials(member.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                      {member.name}
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {member.openCount} open
                    </span>
                    <Badge
                      variant="outline"
                      className={cn(
                        "shrink-0 border-transparent",
                        member.overdueCount > 0
                          ? "bg-red-500/10 text-red-600 dark:bg-red-500/15 dark:text-red-400"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {member.overdueCount} overdue
                    </Badge>
                  </Link>
                </li>
              ))}
            </ul>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

export function AdminMemberWorkloadSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Workload</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className={`${LIST_CARD_HEIGHT} flex flex-col gap-4`}>
          {[0, 1, 2, 3].map((i) => (
            <li key={i} className="flex items-center gap-3">
              <div className="size-8 shrink-0 animate-pulse rounded-full bg-muted" />
              <div className="h-4 flex-1 animate-pulse rounded bg-muted" />
              <div className="h-4 w-12 animate-pulse rounded bg-muted" />
              <div className="h-5 w-16 animate-pulse rounded-full bg-muted" />
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
