"use client";

import { Building2, CalendarClock, Mail, MapPin, Phone, Shield, Users } from "lucide-react";

import { useCompany } from "@/features/company/hooks";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

function formatDate(value: string | Date) {
  // Fixed locale, not `undefined`: the server and browser can have different
  // default locales, which would cause a hydration mismatch.
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function DetailRow({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2.5 text-sm">
      <Icon className="size-4 shrink-0 text-muted-foreground" />
      <span className="min-w-0 truncate text-foreground">{children}</span>
    </div>
  );
}

function StatTile({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
}) {
  return (
    <div className="flex flex-col gap-1.5 rounded-lg border border-border bg-muted/30 p-3">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="size-3.5" />
        {label}
      </div>
      <span className="text-xl font-semibold text-foreground">{value}</span>
    </div>
  );
}

function DetailsSkeleton() {
  return (
    <div className="flex flex-col gap-5 p-5">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="h-5 w-full animate-pulse rounded bg-muted" />
      ))}
    </div>
  );
}

type TenantDetailsSheetProps = {
  tenantId: string | null;
  onOpenChange: (open: boolean) => void;
};

export function TenantDetailsSheet({
  tenantId,
  onOpenChange,
}: TenantDetailsSheetProps) {
  const { data: tenant, isLoading } = useCompany(tenantId ?? "");

  return (
    <Sheet open={tenantId !== null} onOpenChange={onOpenChange}>
      <SheetContent className="w-full min-w-[320px] gap-0 overflow-y-auto p-0 data-[side=right]:sm:w-1/2 data-[side=right]:sm:max-w-none">
        {isLoading || !tenant ? (
          <DetailsSkeleton />
        ) : (
          <>
            <SheetHeader className="gap-3 p-5 pr-10">
              <div className="flex items-center gap-3">
                <Avatar size="lg" className="rounded-lg after:rounded-lg">
                  <AvatarImage
                    src={tenant.logo ?? undefined}
                    alt={tenant.name}
                    className="rounded-lg object-contain"
                  />
                  <AvatarFallback className="rounded-lg">
                    <Building2 className="size-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex min-w-0 flex-col gap-1">
                  <SheetTitle className="truncate text-lg leading-snug">
                    {tenant.name}
                  </SheetTitle>
                  <Badge
                    variant="outline"
                    className={cn(
                      "w-fit border-transparent",
                      tenant.isActive
                        ? "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {tenant.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </SheetHeader>

            <Separator />

            <div className="flex flex-col gap-5 p-5">
              <div className="grid grid-cols-2 gap-3">
                <StatTile icon={Users} label="Team size" value={tenant.totalUsers} />
                <StatTile icon={Shield} label="Total admins" value={tenant.totalAdmins} />
              </div>

              <div className="flex flex-col gap-2.5">
                <DetailRow icon={Mail}>{tenant.email}</DetailRow>
                {tenant.phone && <DetailRow icon={Phone}>{tenant.phone}</DetailRow>}
                {tenant.address && (
                  <DetailRow icon={MapPin}>{tenant.address}</DetailRow>
                )}
              </div>

              <Separator />

              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <CalendarClock className="size-3.5" />
                Added {formatDate(tenant.createdAt)}
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
