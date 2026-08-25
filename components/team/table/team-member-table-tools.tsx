"use client";

import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type TeamMemberFilters = {
  search: string;
};

export const EMPTY_TEAM_MEMBER_FILTERS: TeamMemberFilters = {
  search: "",
};

export function hasActiveTeamMemberFilters(
  filters: TeamMemberFilters,
): boolean {
  return filters.search !== "";
}

type TeamMemberTableToolsProps = {
  filters: TeamMemberFilters;
  onFiltersChange: (patch: Partial<TeamMemberFilters>) => void;
};

export function TeamMemberTableTools({
  filters,
  onFiltersChange,
}: TeamMemberTableToolsProps) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end">
        <div className="flex min-w-40 flex-1 flex-col gap-1.5">
          <Label htmlFor="team-member-search">Search</Label>
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="team-member-search"
              placeholder="Search by name or email..."
              value={filters.search}
              onChange={(event) =>
                onFiltersChange({ search: event.target.value })
              }
              className="pl-8"
            />
          </div>
        </div>

        {hasActiveTeamMemberFilters(filters) && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onFiltersChange(EMPTY_TEAM_MEMBER_FILTERS)}
          >
            Clear filters
          </Button>
        )}
      </div>
    </div>
  );
}
