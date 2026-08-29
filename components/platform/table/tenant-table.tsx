"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";

import type { Company } from "@/features/company/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function TenantRowsSkeleton({ columnCount }: { columnCount: number }) {
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

type TenantTableProps = {
  columns: ColumnDef<Company, unknown>[];
  data: Company[];
  isLoading: boolean;
  onRowClick?: (tenant: Company) => void;
};

// Filtering and pagination happen server-side (see TenantList), so this only
// needs the core row model.
export function TenantTable({
  columns,
  data,
  isLoading,
  onRowClick,
}: TenantTableProps) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (tenant) => tenant.id,
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
            <TenantRowsSkeleton columnCount={columns.length} />
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
