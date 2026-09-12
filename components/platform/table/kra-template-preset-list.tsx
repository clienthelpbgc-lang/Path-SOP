"use client";

import { useState } from "react";
import { LayoutTemplate } from "lucide-react";

import { useKraTemplatePresets } from "@/features/kra/hooks";
import type { KraTemplatePreset } from "@/features/kra/types";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { PagePlaceholder } from "@/components/layout/page-placeholder";
import {
  EMPTY_KRA_TEMPLATE_PRESET_FILTERS,
  hasActiveKraTemplatePresetFilters,
  KraTemplatePresetTableTools,
  type KraTemplatePresetFilters,
} from "@/components/platform/table/kra-template-preset-table-tools";
import { getKraTemplatePresetColumns } from "@/components/platform/table/kra-template-preset-columns";
import { KraTemplatePresetPagination } from "@/components/platform/table/kra-template-preset-pagination";
import { KraTemplatePresetTable } from "@/components/platform/table/kra-template-preset-table";

const PAGE_SIZE = 20;

export function KraTemplatePresetList() {
  const [filters, setFilters] = useState<KraTemplatePresetFilters>(
    EMPTY_KRA_TEMPLATE_PRESET_FILTERS,
  );
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(filters.search, 300);

  function handleFiltersChange(patch: Partial<KraTemplatePresetFilters>) {
    setFilters((prev) => ({ ...prev, ...patch }));
    setPage(1);
  }

  const { data, isLoading } = useKraTemplatePresets({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
  });
  const presets: KraTemplatePreset[] = data?.data ?? [];

  const columns = getKraTemplatePresetColumns();

  return (
    <div className="flex flex-col gap-4">
      <KraTemplatePresetTableTools
        filters={filters}
        onFiltersChange={handleFiltersChange}
      />

      {!isLoading && presets.length === 0 ? (
        <PagePlaceholder
          icon={LayoutTemplate}
          title="No KRA presets found"
          description={
            hasActiveKraTemplatePresetFilters(filters)
              ? "Try a different search term."
              : "Create a preset to make it available to every company."
          }
        />
      ) : (
        <>
          <KraTemplatePresetTable
            columns={columns}
            data={presets}
            isLoading={isLoading}
          />
          {data && (
            <KraTemplatePresetPagination
              pagination={data.pagination}
              onPageChange={setPage}
            />
          )}
        </>
      )}
    </div>
  );
}
