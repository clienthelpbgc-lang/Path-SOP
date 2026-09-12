"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import type { PaginationMeta } from "@/utils/types";
import { Button } from "@/components/ui/button";

type TaskTemplatePresetPaginationProps = {
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
};

export function TaskTemplatePresetPagination({
  pagination,
  onPageChange,
}: TaskTemplatePresetPaginationProps) {
  const { page, limit, total, totalPages } = pagination;

  if (total === 0) {
    return null;
  }

  const rangeStart = (page - 1) * limit + 1;
  const rangeEnd = Math.min(page * limit, total);

  return (
    <div className="flex items-center justify-between gap-3">
      <p className="text-sm text-muted-foreground">
        Showing {rangeStart}–{rangeEnd} of {total}
      </p>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          aria-label="Previous page"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft />
        </Button>
        <span className="text-sm text-foreground">
          Page {page} of {totalPages}
        </span>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          aria-label="Next page"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}
