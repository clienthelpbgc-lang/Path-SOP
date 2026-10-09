"use client";

import { CheckCircle2, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";

type TaskSelectionBarProps = {
  selectedCount: number;
  // How many of the selected tasks each action actually applies to -- a
  // selection can mix tasks you can complete (assigned to you) with tasks
  // you can delete (pending ones you created).
  completableCount: number;
  deletableCount: number;
  onComplete: () => void;
  onDelete: () => void;
  onClear: () => void;
};

function countSuffix(count: number, selectedCount: number): string {
  return count === selectedCount ? "" : ` (${count})`;
}

export function TaskSelectionBar({
  selectedCount,
  completableCount,
  deletableCount,
  onComplete,
  onDelete,
  onClear,
}: TaskSelectionBarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-2.5">
      <p className="text-sm font-medium text-foreground">
        {selectedCount} task{selectedCount === 1 ? "" : "s"} selected
      </p>
      <div className="flex items-center gap-2">
        {completableCount > 0 && (
          <Button type="button" size="sm" onClick={onComplete}>
            <CheckCircle2 />
            Mark complete{countSuffix(completableCount, selectedCount)}
          </Button>
        )}
        {deletableCount > 0 && (
          <Button
            type="button"
            size="sm"
            variant="destructive"
            onClick={onDelete}
          >
            <Trash2 />
            Delete{countSuffix(deletableCount, selectedCount)}
          </Button>
        )}
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Clear selection"
          onClick={onClear}
        >
          <X />
        </Button>
      </div>
    </div>
  );
}
