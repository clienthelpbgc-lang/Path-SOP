"use client";

import { useState } from "react";
import { Target } from "lucide-react";

import { useKras } from "@/features/kra/hooks";
import type { Kra } from "@/features/kra/types";
import { useUsers } from "@/features/user/hooks";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { PagePlaceholder } from "@/components/layout/page-placeholder";
import {
  EMPTY_KRA_FILTERS,
  hasActiveKraFilters,
  KraTableTools,
  type KraFilters,
} from "@/components/kra/table/kra-table-tools";
import { getKraColumns } from "@/components/kra/table/kra-columns";
import { KraDetailsSheet } from "@/components/kra/kra-details-sheet";
import { KraPagination } from "@/components/kra/table/kra-pagination";
import { KraTable } from "@/components/kra/table/kra-table";

const PAGE_SIZE = 20;

type KraListProps = {
  currentUserId: string;
  // "mine" (default) scopes the list to KRAs assigned to the current user,
  // read-only. "all" is the admin-only overview: every KRA in the company,
  // filterable and manageable (edit/delete).
  scope?: "mine" | "all";
};

export function KraList({ currentUserId, scope = "mine" }: KraListProps) {
  const [filters, setFilters] = useState<KraFilters>(EMPTY_KRA_FILTERS);
  const [page, setPage] = useState(1);
  const [selectedKraId, setSelectedKraId] = useState<string | null>(null);
  const debouncedSearch = useDebouncedValue(filters.search, 300);

  function handleFiltersChange(patch: Partial<KraFilters>) {
    setFilters((prev) => ({ ...prev, ...patch }));
    setPage(1);
  }

  const { data, isLoading } = useKras({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
    status: filters.status,
    type: filters.type,
    assignedTo: scope === "mine" ? currentUserId : filters.assignedTo,
    assignedBy: scope === "all" ? filters.assignedBy : undefined,
    periodStartFrom: filters.periodStartFrom,
    periodStartTo: filters.periodStartTo,
  });
  const kras: Kra[] = data?.data ?? [];

  const usersQuery = useUsers({ limit: 100 });
  const userNames = new Map(
    (usersQuery.data?.data ?? []).map((user) => [user.id, user.name]),
  );

  const showAssigneeColumn = scope === "all";
  const canManage = scope === "all";

  const columns = getKraColumns({
    userNames,
    showAssigneeColumn,
    canManage,
    currentUserId,
  });

  return (
    <div className="flex flex-col gap-4">
      <KraTableTools
        filters={filters}
        onFiltersChange={handleFiltersChange}
        showAssigneeFilter={scope === "all"}
        showAssignedByFilter={scope === "all"}
      />

      {!isLoading && kras.length === 0 ? (
        <PagePlaceholder
          icon={Target}
          title="No KRAs found"
          description={
            hasActiveKraFilters(filters)
              ? "Try a different search term or filter."
              : scope === "all"
                ? "KRAs assigned across your company will show up here."
                : "KRAs assigned to you will show up here."
          }
        />
      ) : (
        <>
          <KraTable
            columns={columns}
            data={kras}
            isLoading={isLoading}
            onRowClick={(kra) => setSelectedKraId(kra.id)}
          />
          {data && (
            <KraPagination pagination={data.pagination} onPageChange={setPage} />
          )}
        </>
      )}

      <KraDetailsSheet
        kraId={selectedKraId}
        onOpenChange={(open) => {
          if (!open) setSelectedKraId(null);
        }}
      />
    </div>
  );
}
