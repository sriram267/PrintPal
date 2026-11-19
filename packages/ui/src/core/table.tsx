import * as React from "react";
import { cn } from "../lib/cn";

export interface Column<T> {
  /** Column heading. */
  header: React.ReactNode;
  /** What to show in this column for one row. */
  cell: (row: T) => React.ReactNode;
  /** CSS grid width, e.g. "2fr", "160px", "minmax(100px,1fr)". Default "1fr". */
  width?: string;
  align?: "left" | "right";
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  /** A unique key for each row. */
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  /** Shown instead of rows when there are none. */
  empty?: React.ReactNode;
  className?: string;
}

/**
 * The app's list table: a white card, a grey rounded header, 52px rows with hairlines.
 * Columns are a CSS grid, so every row lines up.
 */
export function DataTable<T>({ columns, rows, rowKey, onRowClick, empty, className }: DataTableProps<T>) {
  const template = columns.map((c) => c.width ?? "1fr").join(" ");
  return (
    <div role="table" className={cn("rounded-xl border border-line bg-white p-2", className)}>
      <div
        role="row"
        className="grid h-control items-center gap-3 rounded-md bg-surface px-4 text-xs font-medium text-muted"
        style={{ gridTemplateColumns: template }}
      >
        {columns.map((c, i) => (
          <div key={i} role="columnheader" className={cn("truncate", c.align === "right" && "text-right")}>
            {c.header}
          </div>
        ))}
      </div>
      {rows.length === 0 && empty ? (
        <div className="py-10">{empty}</div>
      ) : (
        rows.map((r) => (
          <div
            key={rowKey(r)}
            role="row"
            tabIndex={onRowClick ? 0 : undefined}
            onClick={onRowClick ? () => onRowClick(r) : undefined}
            onKeyDown={onRowClick ? (e) => e.key === "Enter" && onRowClick(r) : undefined}
            className={cn(
              "grid min-h-[52px] items-center gap-3 border-b border-line px-4 py-2 text-base text-ink transition-colors duration-fast last:border-b-0 hover:bg-surface-hover",
              onRowClick && "cursor-pointer focus-visible:bg-surface-2 focus-visible:outline-none",
            )}
            style={{ gridTemplateColumns: template }}
          >
            {columns.map((c, i) => (
              <div key={i} role="cell" className={cn("min-w-0", c.align === "right" && "flex justify-end text-right")}>
                {c.cell(r)}
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
}
