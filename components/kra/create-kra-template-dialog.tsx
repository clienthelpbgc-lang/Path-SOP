"use client";

import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";

import { useCreateKraTemplate } from "@/features/kra/hooks";
import type { Kra } from "@/features/kra/types";
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

type CreateKraTemplateDialogProps = {
  kra: Kra | null;
  onOpenChange: (open: boolean) => void;
};

// Unlike tasks, a `Kra` row already carries every field a template needs
// (no separate checklist/reminder relations to fetch), so this reads
// straight off the row passed in.
export function CreateKraTemplateDialog({
  kra,
  onOpenChange,
}: CreateKraTemplateDialogProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { mutate, isPending } = useCreateKraTemplate();

  function handleOpenChange(nextOpen: boolean) {
    onOpenChange(nextOpen);
    if (!nextOpen) {
      setName("");
      setError(null);
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      setError("Template name must be at least 2 characters long.");
      return;
    }
    if (!kra) return;

    mutate(
      {
        name: trimmedName,
        sourceKraId: kra.id,
        title: kra.title,
        description: kra.description ?? undefined,
        type: kra.type,
        weightage: kra.weightage,
        remarks: kra.remarks ?? undefined,
        repeat: kra.repeat,
        defaultAssignee: kra.assignedTo,
        isActive: true,
      },
      { onSuccess: () => handleOpenChange(false) },
    );
  }

  return (
    <Dialog open={kra !== null} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create template</DialogTitle>
          <DialogDescription>
            Save &quot;{kra?.title}&quot; as a reusable KRA template.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="kraTemplateName">Template name</Label>
            <Input
              id="kraTemplateName"
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
                  Creating...
                </>
              ) : (
                "Create template"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
