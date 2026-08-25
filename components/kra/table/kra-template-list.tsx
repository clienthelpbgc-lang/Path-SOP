"use client";

import { useState } from "react";
import { LayoutTemplate } from "lucide-react";

import { useKraTemplates } from "@/features/kra/hooks";
import type { KraTemplate } from "@/features/kra/types";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { PagePlaceholder } from "@/components/layout/page-placeholder";
import {
  EMPTY_KRA_TEMPLATE_FILTERS,
  hasActiveKraTemplateFilters,
  KraTemplateTableTools,
  type KraTemplateFilters,
} from "@/components/kra/table/kra-template-table-tools";
import { getKraTemplateColumns } from "@/components/kra/table/kra-template-columns";
import { KraTemplatePagination } from "@/components/kra/table/kra-template-pagination";
import { KraTemplateTable } from "@/components/kra/table/kra-template-table";

const PAGE_SIZE = 20;

export function KraTemplateList() {
  const [filters, setFilters] = useState<KraTemplateFilters>(
    EMPTY_KRA_TEMPLATE_FILTERS,
  );
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(filters.search, 300);

  function handleFiltersChange(patch: Partial<KraTemplateFilters>) {
    setFilters((prev) => ({ ...prev, ...patch }));
    setPage(1);
  }

  const { data, isLoading } = useKraTemplates({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
  });
  const templates: KraTemplate[] = data?.data ?? [];

  const columns = getKraTemplateColumns();

  return (
    <div className="flex flex-col gap-4">
      <KraTemplateTableTools
        filters={filters}
        onFiltersChange={handleFiltersChange}
      />

      {!isLoading && templates.length === 0 ? (
        <PagePlaceholder
          icon={LayoutTemplate}
          title="No KRA templates found"
          description={
            hasActiveKraTemplateFilters(filters)
              ? "Try a different search term."
              : "Save a KRA as a template to see it here."
          }
        />
      ) : (
        <>
          <KraTemplateTable
            columns={columns}
            data={templates}
            isLoading={isLoading}
          />
          {data && (
            <KraTemplatePagination
              pagination={data.pagination}
              onPageChange={setPage}
            />
          )}
        </>
      )}
    </div>
  );
}
