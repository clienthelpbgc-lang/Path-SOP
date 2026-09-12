"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";

import type { TaskTemplatePreset } from "@/features/task/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function TaskTemplatePresetRowsSkeleton({
  columnCount,
}: {
  columnCount: number;
}) {
  return (
    <>
      {Array.from({ length: 4 }).map((_, index) => (
        <TableRow key={index} className="hover:bg-transparent">
          <TableCell colSpan={columnCount}>
            <div className="h-5 w-full animate-pulse rounded bg-muted" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

type TaskTemplatePresetTableProps = {
  columns: ColumnDef<TaskTemplatePreset, unknown>[];
  data: TaskTemplatePreset[];
  isLoading: boolean;
};

// Filtering, sorting and pagination all happen server-side (see
// TaskTemplatePresetList / useTaskTemplatePresets), so this only needs the
// core row model.
export function TaskTemplatePresetTable({
  columns,
  data,
  isLoading,
}: TaskTemplatePresetTableProps) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (preset) => preset.id,
  });

  return (
    <div className="rounded-xl border border-border bg-card">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="hover:bg-transparent">
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className={header.column.id === "actions" ? "w-10" : undefined}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TaskTemplatePresetRowsSkeleton columnCount={columns.length} />
          ) : (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} className="hover:bg-transparent">
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
