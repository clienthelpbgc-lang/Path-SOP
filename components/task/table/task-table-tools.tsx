"use client";

import { ListChecks, Search } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TaskDateRangeFilter,
  type TaskDateRange,
} from "@/components/task/task-date-range-filter";
import { UserFilterCombobox } from "@/components/task/user-filter-combobox";
import {
  TASK_STATUS_ICONS,
  type EffectiveTaskStatus,
} from "@/components/task/task-status-badge";

export type StatusTab = "all" | EffectiveTaskStatus;

export type TaskFilters = {
  search: string;
  statusTab: StatusTab;
  dateRange: TaskDateRange;
  assignedTo: string | undefined;
};

export const EMPTY_TASK_FILTERS: TaskFilters = {
  search: "",
  statusTab: "all",
  dateRange: {},
  assignedTo: undefined,
};

export function hasActiveTaskFilters(filters: TaskFilters): boolean {
  return (
    filters.search !== "" ||
    filters.statusTab !== "all" ||
    Boolean(filters.dateRange.from) ||
    Boolean(filters.dateRange.to) ||
    filters.assignedTo !== undefined
  );
}

const STATUS_TABS: { value: StatusTab; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "overdue", label: "Overdue" },
];

const STATUS_TAB_ICONS = {
  all: ListChecks,
  ...TASK_STATUS_ICONS,
} as const;

const STATUS_TAB_ICON_CLASSES: Record<StatusTab, string> = {
  all: "text-muted-foreground",
  pending: "text-amber-500",
  in_progress: "text-blue-500",
  completed: "text-emerald-500",
  overdue: "text-red-500",
};

type TaskTableToolsProps = {
  filters: TaskFilters;
  onFiltersChange: (patch: Partial<TaskFilters>) => void;
  // "Assigned to" only makes sense on the admin's company-wide view -- a
  // regular user's list is already pinned to their own tasks by the server.
  showAssigneeFilter: boolean;
};

export function TaskTableTools({
  filters,
  onFiltersChange,
  showAssigneeFilter,
}: TaskTableToolsProps) {
  return (
    <div className="flex flex-col gap-3">
      <Tabs
        value={filters.statusTab}
        onValueChange={(value) =>
          onFiltersChange({ statusTab: value as StatusTab })
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
            <Label htmlFor="task-search">Search</Label>
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="task-search"
                placeholder="Search by title..."
                value={filters.search}
                onChange={(event) =>
                  onFiltersChange({ search: event.target.value })
                }
                className="pl-8"
              />
            </div>
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

          <div className="flex w-full flex-col gap-1.5 sm:w-44">
            <Label>Due date</Label>
            <TaskDateRangeFilter
              value={filters.dateRange}
              onChange={(dateRange) => onFiltersChange({ dateRange })}
              className="w-full"
            />
          </div>

          {hasActiveTaskFilters(filters) && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onFiltersChange(EMPTY_TASK_FILTERS)}
            >
              Clear filters
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
