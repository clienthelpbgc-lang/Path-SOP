"use client";

import { LayoutTemplate } from "lucide-react";

import { useCompanyTaskTemplatePresets } from "@/features/task/hooks";
import { PagePlaceholder } from "@/components/layout/page-placeholder";
import { getTaskTemplatePresetColumns } from "@/components/task/table/task-template-preset-columns";
import { TaskTemplatePresetTable } from "@/components/task/table/task-template-preset-table";

// Global, platform-admin-curated presets -- the "Presets" sub-tab alongside
// "My Templates" on the Task Templates tab. Unpaginated and unfiltered
// since this is expected to stay a small, curated list.
export function TaskTemplatePresetList() {
  const { data: presets, isLoading } = useCompanyTaskTemplatePresets();

  if (!isLoading && (!presets || presets.length === 0)) {
    return (
      <PagePlaceholder
        icon={LayoutTemplate}
        title="No presets yet"
        description="Your platform admin hasn't added any shared task presets yet."
      />
    );
  }

  const columns = getTaskTemplatePresetColumns();

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-muted-foreground">
        Shared starting points available to every company.
      </p>
      <TaskTemplatePresetTable
        columns={columns}
        data={presets ?? []}
        isLoading={isLoading}
      />
    </div>
  );
}
