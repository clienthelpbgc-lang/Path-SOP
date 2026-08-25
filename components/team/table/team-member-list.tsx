"use client";

import { useState } from "react";
import { Users } from "lucide-react";

import { useUsers } from "@/features/user/hooks";
import type { UserRole } from "@/features/user/constants/role.constant";
import type { User } from "@/features/user/types";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { PagePlaceholder } from "@/components/layout/page-placeholder";
import {
  EMPTY_TEAM_MEMBER_FILTERS,
  hasActiveTeamMemberFilters,
  TeamMemberTableTools,
  type TeamMemberFilters,
} from "@/components/team/table/team-member-table-tools";
import { getTeamMemberColumns } from "@/components/team/table/team-member-columns";
import { TeamMemberPagination } from "@/components/team/table/team-member-pagination";
import { TeamMemberTable } from "@/components/team/table/team-member-table";

const PAGE_SIZE = 20;

type TeamMemberListProps = {
  currentUserId: string;
  currentUserRole: UserRole;
};

export function TeamMemberList({
  currentUserId,
  currentUserRole,
}: TeamMemberListProps) {
  const [filters, setFilters] = useState<TeamMemberFilters>(
    EMPTY_TEAM_MEMBER_FILTERS,
  );
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(filters.search, 300);

  function handleFiltersChange(patch: Partial<TeamMemberFilters>) {
    setFilters((prev) => ({ ...prev, ...patch }));
    setPage(1);
  }

  const { data, isLoading } = useUsers({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
  });
  const members: User[] = (data?.data ?? []).filter(
    (member) => member.id !== currentUserId,
  );

  const canManage = currentUserRole === "ADMIN";
  const columns = getTeamMemberColumns({ canManage });

  return (
    <div className="flex flex-col gap-4">
      <TeamMemberTableTools filters={filters} onFiltersChange={handleFiltersChange} />

      {!isLoading && members.length === 0 ? (
        <PagePlaceholder
          icon={Users}
          title="No team members found"
          description={
            hasActiveTeamMemberFilters(filters)
              ? "Try a different search term."
              : "Members you add will show up here."
          }
        />
      ) : (
        <>
          <TeamMemberTable columns={columns} data={members} isLoading={isLoading} />
          {data && (
            <TeamMemberPagination
              pagination={data.pagination}
              onPageChange={setPage}
            />
          )}
        </>
      )}
    </div>
  );
}
