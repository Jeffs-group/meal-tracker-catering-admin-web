import React, { useState } from "react";
import { SearchInput, Button } from "@/components/ui";
import { RotateCcw, Filter, X } from "lucide-react";
import { DateRangePicker } from "./DateRangePicker";

export interface ReportFilterBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  searchPlaceholder?: string;
  hasDateRange?: boolean;
  fromDate?: string;
  toDate?: string;
  onDateRangeChange?: (from: string, to: string) => void;
  children?: React.ReactNode;
  onReset: () => void;
  isFiltered?: boolean;
  activeFilterCount?: number;
  className?: string;
}

export const ReportFilterBar: React.FC<ReportFilterBarProps> = ({
  search,
  onSearchChange,
  searchPlaceholder = "Search records…",
  hasDateRange = false,
  fromDate,
  toDate,
  onDateRangeChange,
  children,
  onReset,
  isFiltered = false,
  activeFilterCount = 0,
}) => {
  const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(false);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs mb-6">
      {/* Primary Row: Search Bar + Mobile Filter Trigger + Desktop Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex-1 min-w-[240px]">
          <SearchInput
            value={search}
            onChange={onSearchChange}
            placeholder={searchPlaceholder}
            className="w-full"
          />
        </div>

        {/* Mobile Filter Toggle */}
        <div className="flex sm:hidden items-center justify-between gap-2 pt-2 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsMobilePanelOpen(true)}
            className="flex-1 justify-center"
            leftIcon={<Filter className="h-3.5 w-3.5 text-[#C9A227]" />}
          >
            Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onReset}
            disabled={!isFiltered}
            leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
          >
            Reset
          </Button>
        </div>

        {/* Desktop Filter Row Inline / Wrappable */}
        <div className="hidden sm:flex flex-wrap items-center gap-2.5">
          {hasDateRange && onDateRangeChange && (
            <DateRangePicker
              from={fromDate}
              to={toDate}
              onChange={onDateRangeChange}
            />
          )}

          {children}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onReset}
            disabled={!isFiltered}
            leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
            className="text-xs"
          >
            Reset Filters
          </Button>
        </div>
      </div>

      {/* Mobile Filters Modal / Drawer */}
      {isMobilePanelOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:hidden bg-black/50 backdrop-blur-xs animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-h-[85vh] overflow-y-auto rounded-t-2xl bg-white p-5 shadow-2xl animate-in slide-in-from-bottom duration-250">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-[#C9A227]" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Filter Records ({activeFilterCount} active)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsMobilePanelOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:text-slate-600"
                aria-label="Close filters"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {hasDateRange && onDateRangeChange && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Date Range
                  </label>
                  <DateRangePicker
                    from={fromDate}
                    to={toDate}
                    onChange={onDateRangeChange}
                    className="w-full"
                  />
                </div>
              )}

              {/* Injected filter dropdowns */}
              <div className="space-y-3">{children}</div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  onReset();
                  setIsMobilePanelOpen(false);
                }}
                disabled={!isFiltered}
              >
                Reset
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={() => setIsMobilePanelOpen(false)}
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

