"use client";

import { LayoutTemplate } from "lucide-react";

import { useCompanyKraTemplatePresets } from "@/features/kra/hooks";
import { PagePlaceholder } from "@/components/layout/page-placeholder";
import { getKraTemplatePresetColumns } from "@/components/kra/table/kra-template-preset-columns";
import { KraTemplatePresetTable } from "@/components/kra/table/kra-template-preset-table";

// Global, platform-admin-curated presets -- the "Presets" sub-tab alongside
// "My Templates" on the KRA Templates tab. Unpaginated and unfiltered since
// this is expected to stay a small, curated list.
export function KraTemplatePresetList() {
  const { data: presets, isLoading } = useCompanyKraTemplatePresets();

  if (!isLoading && (!presets || presets.length === 0)) {
    return (
      <PagePlaceholder
        icon={LayoutTemplate}
        title="No presets yet"
        description="Your platform admin hasn't added any shared KRA presets yet."
      />
    );
  }

  const columns = getKraTemplatePresetColumns();

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-muted-foreground">
        Shared starting points available to every company.
      </p>
      <KraTemplatePresetTable
        columns={columns}
        data={presets ?? []}
        isLoading={isLoading}
      />
    </div>
  );
}
