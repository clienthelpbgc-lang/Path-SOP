"use client";

import { CalendarClock, CalendarRange, Repeat } from "lucide-react";

import { useKra } from "@/features/kra/hooks";
import { KRA_TYPE_LABELS } from "@/components/kra/kra-form-constants";
import { KraStatusBadge } from "@/components/kra/kra-status-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

function formatDateTime(value: string | Date) {
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDate(value: string | Date) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function DetailField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="text-foreground">{children}</div>
    </div>
  );
}

function PartyRow({ name, email }: { name: string; email: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <Avatar size="sm">
        <AvatarFallback>{initials(name)}</AvatarFallback>
      </Avatar>
      <div className="flex min-w-0 flex-col">
        <span className="truncate text-sm font-medium text-foreground">
          {name}
        </span>
        <span className="truncate text-xs text-muted-foreground">
          {email}
        </span>
      </div>
    </div>
  );
}

function DetailsSkeleton() {
  return (
    <div className="flex flex-col gap-5 p-4">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="h-5 w-full animate-pulse rounded bg-muted" />
      ))}
    </div>
  );
}

type KraDetailsSheetProps = {
  kraId: string | null;
  onOpenChange: (open: boolean) => void;
};

export function KraDetailsSheet({ kraId, onOpenChange }: KraDetailsSheetProps) {
  const { data: kra, isLoading } = useKra(kraId ?? "");

  return (
    <Sheet open={kraId !== null} onOpenChange={onOpenChange}>
      <SheetContent className="w-full min-w-[320px] gap-0 overflow-y-auto p-0 data-[side=right]:sm:w-1/2 data-[side=right]:sm:max-w-none">
        {isLoading || !kra ? (
          <DetailsSkeleton />
        ) : (
          <>
            <SheetHeader className="gap-2 p-5 pr-10">
              <KraStatusBadge status={kra.status} className="w-fit" />
              <SheetTitle className="text-lg leading-snug break-words">
                {kra.title}
              </SheetTitle>
              <SheetDescription>
                Assigned by {kra.assigner.name} on {formatDateTime(kra.createdAt)}
              </SheetDescription>
            </SheetHeader>

            <Separator />

            <div className="flex flex-col gap-5 p-5">
              {kra.description && (
                <DetailField label="Description">
                  <p className="whitespace-pre-wrap text-sm">
                    {kra.description}
                  </p>
                </DetailField>
              )}

              <div className="grid grid-cols-2 gap-4">
                <DetailField label="Assignee">
                  <PartyRow name={kra.assignee.name} email={kra.assignee.email} />
                </DetailField>

                <DetailField label="Assigned by">
                  <PartyRow name={kra.assigner.name} email={kra.assigner.email} />
                </DetailField>

                <DetailField label="Type">
                  <span className="text-sm">{KRA_TYPE_LABELS[kra.type]}</span>
                </DetailField>

                <DetailField label="Weightage">
                  <span className="text-sm">{kra.weightage}</span>
                </DetailField>
              </div>

              <div className="grid grid-cols-2 gap-4 rounded-lg border border-border bg-muted/30 p-3">
                <div className="col-span-2 flex items-center gap-1.5 text-sm font-medium text-foreground">
                  <CalendarRange className="size-3.5 text-muted-foreground" />
                  Period
                </div>

                <DetailField label="Start">
                  <span className="text-sm">{formatDate(kra.periodStart)}</span>
                </DetailField>

                <DetailField label="End">
                  <span className="text-sm">{formatDate(kra.periodEnd)}</span>
                </DetailField>
              </div>

              {kra.repeat && (
                <div className="flex items-center gap-1.5 text-sm text-foreground">
                  <Repeat className="size-3.5 text-muted-foreground" />
                  Repeats every period
                </div>
              )}

              {kra.remarks && (
                <DetailField label="Remarks">
                  <p className="whitespace-pre-wrap text-sm">{kra.remarks}</p>
                </DetailField>
              )}

              <Separator />

              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <CalendarClock className="size-3.5" />
                Last updated {formatDateTime(kra.updatedAt)}
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
