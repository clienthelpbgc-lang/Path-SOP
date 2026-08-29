"use client";

import { useState } from "react";
import { Building2, Search } from "lucide-react";

import { useCompanies } from "@/features/company/hooks";
import type { Company } from "@/features/company/types";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { Input } from "@/components/ui/input";
import { PagePlaceholder } from "@/components/layout/page-placeholder";
import { getTenantColumns } from "@/components/platform/table/tenant-columns";
import { TenantDetailsSheet } from "@/components/platform/tenant-details-sheet";
import { TenantPagination } from "@/components/platform/table/tenant-pagination";
import { TenantTable } from "@/components/platform/table/tenant-table";

const PAGE_SIZE = 20;

export function TenantList() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);
  const debouncedSearch = useDebouncedValue(search, 300);

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  const { data, isLoading } = useCompanies({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
  });
  const tenants: Company[] = data?.data ?? [];
  const columns = getTenantColumns();

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="relative max-w-sm">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by tenant name..."
            value={search}
            onChange={(event) => handleSearchChange(event.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {!isLoading && tenants.length === 0 ? (
        <PagePlaceholder
          icon={Building2}
          title="No tenants found"
          description={
            search
              ? "Try a different search term."
              : "Tenants you onboard will show up here."
          }
        />
      ) : (
        <>
          <TenantTable
            columns={columns}
            data={tenants}
            isLoading={isLoading}
            onRowClick={(tenant) => setSelectedTenantId(tenant.id)}
          />
          {data && (
            <TenantPagination pagination={data.pagination} onPageChange={setPage} />
          )}
        </>
      )}

      <TenantDetailsSheet
        tenantId={selectedTenantId}
        onOpenChange={(open) => {
          if (!open) setSelectedTenantId(null);
        }}
      />
    </div>
  );
}
