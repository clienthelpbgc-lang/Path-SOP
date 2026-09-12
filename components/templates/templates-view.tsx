"use client";

import { useState } from "react";

import type { UserRole } from "@/features/user/constants/role.constant";
import { TaskTemplateList } from "@/components/task/table/task-template-list";
import { TaskTemplatePresetList } from "@/components/task/table/task-template-preset-list";
import { KraTemplateList } from "@/components/kra/table/kra-template-list";
import { KraTemplatePresetList } from "@/components/kra/table/kra-template-preset-list";
import { TemplateSourceTabs } from "@/components/templates/template-source-tabs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type TemplateTab = "task" | "kra";

type TemplatesViewProps = {
  role: UserRole;
};

export function TemplatesView({ role }: TemplatesViewProps) {
  // KRA templates are admin tooling -- only admins can assign a KRA (see
  // KRA Admin), so only admins have any use for the tab that manages the
  // templates behind that.
  const isAdmin = role === "ADMIN";

  const templateTabs: { value: TemplateTab; label: string }[] = [
    { value: "task", label: "Task Templates" },
    ...(isAdmin
      ? [{ value: "kra" as const, label: "KRA Templates" }]
      : []),
  ];

  const [tab, setTab] = useState<TemplateTab>("task");

  return (
    <Tabs value={tab} onValueChange={(value) => setTab(value as TemplateTab)}>
      <TabsList variant="line" className="w-full">
        {templateTabs.map((item) => (
          <TabsTrigger key={item.value} value={item.value}>
            {item.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {/* `keepMounted` so switching tabs doesn't tear down and recreate
          the list (and its query subscription) on every switch -- it
          renders once and is just hidden, matching how TaskList keeps its
          own tab content mounted throughout. */}
      <TabsContent value="task" keepMounted>
        <TemplateSourceTabs
          presets={<TaskTemplatePresetList />}
          mine={<TaskTemplateList />}
        />
      </TabsContent>
      {isAdmin && (
        <TabsContent value="kra" keepMounted>
          <TemplateSourceTabs
            presets={<KraTemplatePresetList />}
            mine={<KraTemplateList />}
          />
        </TabsContent>
      )}
    </Tabs>
  );
}
