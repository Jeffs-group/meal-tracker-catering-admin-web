import React from "react";
import { Filter } from "lucide-react";
import { cn } from "@/utils/cn";

export interface ReportStatGridProps {
  children: React.ReactNode;
  isFiltered?: boolean;
  activeFilterCount?: number;
  className?: string;
  columns?: 3 | 4;
}

export const ReportStatGrid: React.FC<ReportStatGridProps> = ({
  children,
  isFiltered = false,
  activeFilterCount = 0,
  className,
  columns = 4,
}) => {
  return (
    <div className="relative mb-6">
      {isFiltered && (
        <div className="flex items-center justify-end mb-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800 shadow-2xs animate-in fade-in">
            <Filter className="h-3 w-3 text-amber-600" />
            <span>
              Filtered Metrics ({activeFilterCount} filter{activeFilterCount > 1 ? "s" : ""} active)
            </span>
          </span>
        </div>
      )}

      <div
        className={cn(
          "grid grid-cols-1 sm:grid-cols-2 gap-4",
          columns === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
};

