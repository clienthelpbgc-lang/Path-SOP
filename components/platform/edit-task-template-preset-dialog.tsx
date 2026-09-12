"use client";

import type { TaskTemplatePreset } from "@/features/task/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TaskTemplatePresetForm } from "@/components/platform/task-template-preset-form";

type EditTaskTemplatePresetDialogProps = {
  preset: TaskTemplatePreset | null;
  onOpenChange: (open: boolean) => void;
};

export function EditTaskTemplatePresetDialog({
  preset,
  onOpenChange,
}: EditTaskTemplatePresetDialogProps) {
  return (
    <Dialog open={preset !== null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit preset</DialogTitle>
          <DialogDescription>
            Update what tasks created from this preset start with, across
            every company.
          </DialogDescription>
        </DialogHeader>

        {preset && (
          <TaskTemplatePresetForm
            preset={preset}
            onSuccess={() => onOpenChange(false)}
            onCancel={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
