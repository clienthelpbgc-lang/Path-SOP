"use client";

import { useState } from "react";

import { TaskTemplatePresetList } from "@/components/platform/table/task-template-preset-list";
import { KraTemplatePresetList } from "@/components/platform/table/kra-template-preset-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type PresetTab = "task" | "kra";

const PRESET_TABS: { value: PresetTab; label: string }[] = [
  { value: "task", label: "Task Presets" },
  { value: "kra", label: "KRA Presets" },
];

export function PresetsView() {
  const [tab, setTab] = useState<PresetTab>("task");

  return (
    <Tabs value={tab} onValueChange={(value) => setTab(value as PresetTab)}>
      <TabsList variant="line">
        {PRESET_TABS.map((item) => (
          <TabsTrigger key={item.value} value={item.value}>
            {item.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {/* `keepMounted` so switching tabs doesn't tear down and recreate the
          list (and its query subscription) on every switch. */}
      <TabsContent value="task" keepMounted>
        <TaskTemplatePresetList />
      </TabsContent>
      <TabsContent value="kra" keepMounted>
        <KraTemplatePresetList />
      </TabsContent>
    </Tabs>
  );
}
