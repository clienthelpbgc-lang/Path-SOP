"use client";

import type { KraTemplatePreset } from "@/features/kra/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { KraTemplatePresetForm } from "@/components/platform/kra-template-preset-form";

type EditKraTemplatePresetDialogProps = {
  preset: KraTemplatePreset | null;
  onOpenChange: (open: boolean) => void;
};

export function EditKraTemplatePresetDialog({
  preset,
  onOpenChange,
}: EditKraTemplatePresetDialogProps) {
  return (
    <Dialog open={preset !== null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit preset</DialogTitle>
          <DialogDescription>
            Update what KRAs assigned from this preset start with, across
            every company.
          </DialogDescription>
        </DialogHeader>

        {preset && (
          <KraTemplatePresetForm
            preset={preset}
            onSuccess={() => onOpenChange(false)}
            onCancel={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
