import React from "react";
import { cn } from "@/utils/cn";
import { Skeleton } from "./Skeleton";
import { EmptyState } from "./EmptyState";

export interface ColumnDef<T> {
  key: string;
  header: React.ReactNode;
  width?: string;
  align?: "left" | "center" | "right";
  className?: string;
  render?: (row: T, index: number) => React.ReactNode;
}

export interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
  selectedIds?: string[];
  onSelectRow?: (id: string, selected: boolean) => void;
  onSelectAll?: (selected: boolean) => void;
  getId?: (row: T) => string;
  className?: string;
  skeletonRowCount?: number;
}

export function DataTable<T>({
  columns,
  data,
  isLoading = false,
  emptyTitle,
  emptyDescription,
  emptyActionLabel,
  onEmptyAction,
  selectedIds,
  onSelectRow,
  onSelectAll,
  getId,
  className,
  skeletonRowCount = 5,
}: DataTableProps<T>) {
  const hasSelection =
    selectedIds !== undefined &&
    onSelectRow !== undefined &&
    getId !== undefined;
  const isAllSelected =
    hasSelection &&
    data.length > 0 &&
    data.every((row) => selectedIds.includes(getId!(row)));
  const isPartiallySelected =
    hasSelection &&
    !isAllSelected &&
    data.some((row) => selectedIds.includes(getId!(row)));

  return (
    <div
      className={cn(
        "w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs",
        className,
      )}
    >
      <div className="w-full overflow-x-auto scrollbar-thin">
        <table className="w-full min-w-full border-collapse text-left text-xs whitespace-nowrap">
          <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500 whitespace-nowrap">
            <tr>
              {hasSelection && (
                <th
                  scope="col"
                  className="w-10 px-4 py-3 text-center whitespace-nowrap"
                >
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = isPartiallySelected;
                    }}
                    onChange={(e) => onSelectAll?.(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-[#C9A227] focus:ring-[#C9A227] cursor-pointer"
                    aria-label="Select all rows"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  style={{ width: col.width }}
                  className={cn(
                    "px-4 py-3 whitespace-nowrap",
                    col.align === "center" && "text-center",
                    col.align === "right" && "text-right",
                    col.className,
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-slate-700 whitespace-nowrap">
            {isLoading ? (
              Array.from({ length: skeletonRowCount }).map((_, rIdx) => (
                <tr key={`skeleton-row-${rIdx}`} className="animate-pulse">
                  {hasSelection && (
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <Skeleton className="h-4 w-4 rounded mx-auto" />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td
                      key={`skeleton-col-${col.key}`}
                      className="px-4 py-3.5 whitespace-nowrap"
                    >
                      <Skeleton className="h-4 w-3/4 rounded" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (hasSelection ? 1 : 0)}
                  className="p-0 whitespace-nowrap"
                >
                  <EmptyState
                    title={emptyTitle}
                    description={emptyDescription}
                    actionLabel={emptyActionLabel}
                    onAction={onEmptyAction}
                  />
                </td>
              </tr>
            ) : (
              data.map((row, index) => {
                const rowId = getId ? getId(row) : String(index);
                const isSelected = selectedIds?.includes(rowId) ?? false;

                return (
                  <tr
                    key={rowId}
                    className={cn(
                      "transition-colors hover:bg-slate-50/70 whitespace-nowrap",
                      isSelected && "bg-[#FAF4E6]/40",
                    )}
                  >
                    {hasSelection && (
                      <td className="w-10 px-4 py-3.5 text-center whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => onSelectRow(rowId, e.target.checked)}
                          className="h-4 w-4 rounded border-slate-300 text-[#C9A227] focus:ring-[#C9A227] cursor-pointer"
                          aria-label={`Select row ${rowId}`}
                        />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={cn(
                          "px-4 py-3.5 align-middle whitespace-nowrap",
                          col.align === "center" && "text-center",
                          col.align === "right" && "text-right",
                          col.className,
                        )}
                      >
                        {col.render
                          ? col.render(row, index)
                          : String(
                              (row as Record<string, unknown>)[col.key] ?? "",
                            )}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DataTable;
