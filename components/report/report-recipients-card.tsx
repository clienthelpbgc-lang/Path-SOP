"use client";

import { Mail, Users } from "lucide-react";

import { useUsers } from "@/features/user/hooks/use-users";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function ReportRecipientsCard() {
  const { data, isLoading } = useUsers({
    role: "ADMIN",
    isActive: "true",
    limit: 50,
  });
  const admins = data?.data ?? [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2.5">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Users className="size-4.5" />
        </div>
        <div className="flex flex-col gap-0.5">
          <CardTitle>Recipients</CardTitle>
          <CardDescription>
            Active admins who receive every scheduled report
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        {isLoading &&
          [0, 1].map((i) => (
            <div key={i} className="h-11 animate-pulse rounded-lg bg-muted" />
          ))}

        {!isLoading && admins.length === 0 && (
          <p className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2.5 text-sm text-muted-foreground">
            <Mail className="size-4 shrink-0" />
            No active admins yet — reports won&apos;t be sent until one is
            added.
          </p>
        )}

        {admins.map((admin) => (
          <div
            key={admin.id}
            className="flex items-center gap-2.5 rounded-lg px-1 py-1.5"
          >
            <Avatar size="sm">
              <AvatarFallback className="bg-muted text-xs">
                {initials(admin.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-medium text-foreground">
                {admin.name}
              </span>
              <span className="truncate text-xs text-muted-foreground">
                {admin.email}
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
