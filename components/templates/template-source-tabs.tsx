"use client";

import { useState } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type SourceTab = "presets" | "mine";

type TemplateSourceTabsProps = {
  presets: React.ReactNode;
  mine: React.ReactNode;
};

// Sub-tabs nested inside each of Task Templates / KRA Templates: "Presets"
// (platform-wide, shared) and "My Templates" (this company's own). Each
// Task/KRA tab gets its own instance, so switching sub-tabs in one doesn't
// affect the other.
export function TemplateSourceTabs({ presets, mine }: TemplateSourceTabsProps) {
  const [tab, setTab] = useState<SourceTab>("mine");

  return (
    <Tabs value={tab} onValueChange={(value) => setTab(value as SourceTab)}>
      <TabsList variant="line">
        <TabsTrigger value="mine">My Templates</TabsTrigger>
        <TabsTrigger value="presets">Presets</TabsTrigger>
      </TabsList>

      <TabsContent value="mine" keepMounted>
        {mine}
      </TabsContent>
      <TabsContent value="presets" keepMounted>
        {presets}
      </TabsContent>
    </Tabs>
  );
}
