"use client";

import { CalendarRange, ListChecks, Search } from "lucide-react";

import type { KraStatus } from "@/features/kra/constants/kra-status.constant";
import type { KraType } from "@/features/kra/constants/kra-type.constant";
import { KRA_TYPE_LABELS } from "@/components/kra/kra-form-constants";
import { KRA_STATUS_ICONS } from "@/components/kra/kra-status-badge";
import { UserFilterCombobox } from "@/components/task/user-filter-combobox";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

type StatusTab = "all" | KraStatus;

const STATUS_TABS: { value: StatusTab; label: string }[] = [
  { value: "all", label: "All" },
  { value: "assigned", label: "Assigned" },
  { value: "completed", label: "Completed" },
  { value: "not_completed", label: "Not Completed" },
];

const STATUS_TAB_ICONS = {
  all: ListChecks,
  ...KRA_STATUS_ICONS,
} as const;

const STATUS_TAB_ICON_CLASSES: Record<StatusTab, string> = {
  all: "text-muted-foreground",
  assigned: "text-blue-500",
  completed: "text-emerald-500",
  not_completed: "text-red-500",
};

export type KraFilters = {
  search: string;
  status: KraStatus | undefined;
  type: KraType | undefined;
  assignedTo: string | undefined;
  assignedBy: string | undefined;
  periodStartFrom: Date | undefined;
  periodStartTo: Date | undefined;
};

export const EMPTY_KRA_FILTERS: KraFilters = {
  search: "",
  status: undefined,
  type: undefined,
  assignedTo: undefined,
  assignedBy: undefined,
  periodStartFrom: undefined,
  periodStartTo: undefined,
};

export function hasActiveKraFilters(filters: KraFilters): boolean {
  return (
    filters.search !== "" ||
    filters.status !== undefined ||
    filters.type !== undefined ||
    filters.assignedTo !== undefined ||
    filters.assignedBy !== undefined ||
    filters.periodStartFrom !== undefined ||
    filters.periodStartTo !== undefined
  );
}

const ALL_VALUE = "__all__";

function formatDate(date?: Date): string | undefined {
  if (!date) return undefined;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

type KraTableToolsProps = {
  filters: KraFilters;
  onFiltersChange: (patch: Partial<KraFilters>) => void;
  // Both "assigned to" and "assigned by" only make sense on the admin's
  // company-wide view -- a regular user's list is already pinned to their
  // own KRAs by the server, and every KRA they see was assigned by an
  // admin, so filtering by either would be a no-op.
  showAssigneeFilter: boolean;
  showAssignedByFilter: boolean;
};

export function KraTableTools({
  filters,
  onFiltersChange,
  showAssigneeFilter,
  showAssignedByFilter,
}: KraTableToolsProps) {
  const hasPeriodRange = Boolean(
    filters.periodStartFrom || filters.periodStartTo,
  );
  const periodLabel = hasPeriodRange
    ? `${formatDate(filters.periodStartFrom) ?? "Any"} – ${formatDate(filters.periodStartTo) ?? "Any"}`
    : "Period start range";

  const typeItems = [
    { value: ALL_VALUE, label: "All types" },
    ...Object.entries(KRA_TYPE_LABELS).map(([value, label]) => ({
      value,
      label,
    })),
  ];

  return (
    <div className="flex flex-col gap-3">
      <Tabs
        value={filters.status ?? "all"}
        onValueChange={(value) =>
          onFiltersChange({
            status: value === "all" ? undefined : (value as KraStatus),
          })
        }
      >
        <TabsList variant="line">
          {STATUS_TABS.map((tab) => {
            const Icon = STATUS_TAB_ICONS[tab.value];

            return (
              <TabsTrigger key={tab.value} value={tab.value}>
                <Icon
                  className={cn("size-3.5", STATUS_TAB_ICON_CLASSES[tab.value])}
                />
                {tab.label}
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>

      <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end">
          <div className="flex min-w-40 flex-1 flex-col gap-1.5">
            <Label htmlFor="kra-search">Search</Label>
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="kra-search"
                placeholder="Search by title..."
                value={filters.search}
                onChange={(event) =>
                  onFiltersChange({ search: event.target.value })
                }
                className="pl-8"
              />
            </div>
          </div>

          <div className="flex w-full flex-col gap-1.5 sm:w-32">
            <Label>Type</Label>
            <Select
              items={typeItems}
              value={filters.type ?? ALL_VALUE}
              onValueChange={(value) =>
                onFiltersChange({
                  type: value === ALL_VALUE ? undefined : (value as KraType),
                })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {typeItems.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {showAssigneeFilter && (
            <div className="flex w-full flex-col gap-1.5 sm:w-32">
              <Label>Assigned to</Label>
              <UserFilterCombobox
                value={filters.assignedTo}
                onValueChange={(value) => onFiltersChange({ assignedTo: value })}
                className="w-full"
              />
            </div>
          )}

          {showAssignedByFilter && (
            <div className="flex w-full flex-col gap-1.5 sm:w-32">
              <Label>Assigned by</Label>
              <UserFilterCombobox
                value={filters.assignedBy}
                onValueChange={(value) => onFiltersChange({ assignedBy: value })}
                className="w-full"
              />
            </div>
          )}

          <div className="flex w-full flex-col gap-1.5 sm:w-44">
            <Label>Period start</Label>
            <Popover>
              <PopoverTrigger
                className={cn(
                  "flex h-9 w-full items-center gap-2 rounded-lg border border-input bg-transparent px-3 text-left text-sm whitespace-nowrap text-foreground transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30",
                )}
              >
                <CalendarRange className="size-4 shrink-0 text-muted-foreground" />
                <span
                  className={cn(
                    "truncate",
                    !hasPeriodRange && "text-muted-foreground",
                  )}
                >
                  {hasPeriodRange ? periodLabel : "Any"}
                </span>
              </PopoverTrigger>
              <PopoverContent className="w-64">
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1.5">
                    <Label>From</Label>
                    <DatePicker
                      value={filters.periodStartFrom}
                      onChange={(date) =>
                        onFiltersChange({ periodStartFrom: date })
                      }
                      placeholder="Any"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label>To</Label>
                    <DatePicker
                      value={filters.periodStartTo}
                      onChange={(date) => onFiltersChange({ periodStartTo: date })}
                      placeholder="Any"
                    />
                  </div>
                  {hasPeriodRange && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        onFiltersChange({
                          periodStartFrom: undefined,
                          periodStartTo: undefined,
                        })
                      }
                    >
                      Clear dates
                    </Button>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {hasActiveKraFilters(filters) && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onFiltersChange(EMPTY_KRA_FILTERS)}
            >
              Clear filters
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
