"use client";

import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";

import { useCreateKraTemplate } from "@/features/kra/hooks";
import type { KraTemplatePreset } from "@/features/kra/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type DuplicateKraTemplatePresetDialogProps = {
  preset: KraTemplatePreset | null;
  onOpenChange: (open: boolean) => void;
};

// Copies a platform-wide preset into a new, private, company-owned template
// that the company can then edit freely -- reuses createKraTemplate
// unchanged, the same way CreateKraTemplateDialog copies fields off an
// existing KRA.
export function DuplicateKraTemplatePresetDialog({
  preset,
  onOpenChange,
}: DuplicateKraTemplatePresetDialogProps) {
  const [name, setName] = useState(preset?.name ?? "");
  const [error, setError] = useState<string | null>(null);
  const { mutate, isPending } = useCreateKraTemplate();

  function handleOpenChange(nextOpen: boolean) {
    onOpenChange(nextOpen);
    if (!nextOpen) {
      setError(null);
    } else {
      setName(preset?.name ?? "");
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      setError("Template name must be at least 2 characters long.");
      return;
    }
    if (!preset) return;

    mutate(
      {
        name: trimmedName,
        title: preset.title,
        description: preset.description ?? undefined,
        type: preset.type,
        weightage: preset.weightage,
        remarks: preset.remarks ?? undefined,
        repeat: preset.repeat,
        isActive: true,
      },
      { onSuccess: () => handleOpenChange(false) },
    );
  }

  return (
    <Dialog open={preset !== null} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Duplicate to my templates</DialogTitle>
          <DialogDescription>
            Save a private, editable copy of &quot;{preset?.name}&quot; to
            your company&apos;s own templates.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="duplicateKraTemplateName">Template name</Label>
            <Input
              id="duplicateKraTemplateName"
              placeholder="e.g. Monthly customer response time"
              value={name}
              onChange={(event) => setName(event.target.value)}
              aria-invalid={!!error}
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>

          <DialogFooter className="mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="animate-spin" />
                  Duplicating...
                </>
              ) : (
                "Duplicate"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
