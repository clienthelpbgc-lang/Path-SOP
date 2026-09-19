"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type OnChangeFn,
  type RowSelectionState,
} from "@tanstack/react-table";

import type { Task } from "@/features/task/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function TaskRowsSkeleton({ columnCount }: { columnCount: number }) {
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

type TaskTableProps = {
  columns: ColumnDef<Task, unknown>[];
  data: Task[];
  isLoading: boolean;
  onRowClick?: (task: Task) => void;
  // Row-selection checkboxes are opt-in: omitting these leaves the table
  // exactly as it was before bulk actions existed.
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
  isRowSelectable?: (task: Task) => boolean;
};

// Filtering, sorting and pagination all happen server-side (see TaskList /
// useTasks), so this only needs the core row model -- no
// getFilteredRowModel/getPaginationRowModel.
export function TaskTable({
  columns,
  data,
  isLoading,
  onRowClick,
  rowSelection,
  onRowSelectionChange,
  isRowSelectable,
}: TaskTableProps) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (task) => task.id,
    enableRowSelection: isRowSelectable
      ? (row) => isRowSelectable(row.original)
      : false,
    onRowSelectionChange,
    state: rowSelection ? { rowSelection } : undefined,
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
                  className={
                    header.column.id === "actions" || header.column.id === "select"
                      ? "w-10"
                      : undefined
                  }
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
            <TaskRowsSkeleton columnCount={columns.length} />
          ) : (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className={onRowClick ? "cursor-pointer hover:bg-muted/40" : undefined}
                onClick={() => onRowClick?.(row.original)}
              >
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
