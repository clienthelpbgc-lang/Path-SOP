"use client";

import { useState } from "react";
import { Copy, ListPlus, MoreHorizontal } from "lucide-react";

import type { KraTemplatePreset } from "@/features/kra/types";
import { kraTemplatePresetToTemplateLike } from "@/features/kra/utils/kra-template-preset-to-like";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CreateKraDialog } from "@/components/kra/create-kra-dialog";
import { DuplicateKraTemplatePresetDialog } from "@/components/kra/duplicate-kra-template-preset-dialog";

type DialogKind = "assign-kra" | "duplicate" | null;

type KraTemplatePresetRowActionsProps = {
  preset: KraTemplatePreset;
};

export function KraTemplatePresetRowActions({
  preset,
}: KraTemplatePresetRowActionsProps) {
  const [openDialog, setOpenDialog] = useState<DialogKind>(null);

  return (
    <div onClick={(event) => event.stopPropagation()}>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button variant="ghost" size="icon-sm" />}
          aria-label="Preset actions"
        >
          <MoreHorizontal />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-auto min-w-48">
          <DropdownMenuItem onClick={() => setOpenDialog("assign-kra")}>
            <ListPlus />
            Use preset
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpenDialog("duplicate")}>
            <Copy />
            Duplicate to my templates
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CreateKraDialog
        key={openDialog === "assign-kra" ? preset.id : "assign-kra-dialog"}
        template={
          openDialog === "assign-kra"
            ? kraTemplatePresetToTemplateLike(preset)
            : null
        }
        open={openDialog === "assign-kra"}
        onOpenChange={(open) => !open && setOpenDialog(null)}
      />
      <DuplicateKraTemplatePresetDialog
        preset={openDialog === "duplicate" ? preset : null}
        onOpenChange={(open) => !open && setOpenDialog(null)}
      />
    </div>
  );
}
