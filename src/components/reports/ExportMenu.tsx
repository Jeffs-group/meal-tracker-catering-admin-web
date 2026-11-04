import React, { useState, useRef, useEffect } from "react";
import { Download, ChevronDown, FileSpreadsheet, FileText, Loader2 } from "lucide-react";
import { cn } from "@/utils/cn";
import type { ExportFormat } from "@/types/reports.types";

export interface ExportMenuProps {
  onExport: (format: ExportFormat) => Promise<void> | void;
  isExporting?: boolean;
  disabled?: boolean;
  totalRecords?: number;
  className?: string;
}

export const ExportMenu: React.FC<ExportMenuProps> = ({
  onExport,
  isExporting = false,
  disabled = false,
  totalRecords = 1,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const isDisabled = disabled || isExporting || totalRecords === 0;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectFormat = (format: ExportFormat) => {
    setIsOpen(false);
    onExport(format);
  };

  return (
    <div className={cn("relative inline-block", className)} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        disabled={isDisabled}
        title={totalRecords === 0 ? "No rows to export" : "Export report dataset"}
        className={cn(
          "flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold shadow-xs transition-all cursor-pointer",
          isDisabled
            ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
            : "bg-[#111111] text-white hover:bg-[#222222] border border-[#282828] active:scale-[0.98]",
        )}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {isExporting ? (
          <Loader2 className="h-4 w-4 animate-spin text-[#DEC067]" />
        ) : (
          <Download className="h-4 w-4 text-[#DEC067]" />
        )}
        <span>{isExporting ? "Exporting..." : "Export Report"}</span>
        <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
      </button>

      {isOpen && !isDisabled && (
        <div className="absolute right-0 z-50 mt-1.5 w-52 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl animate-in fade-in zoom-in-95">
          <button
            type="button"
            onClick={() => handleSelectFormat("csv")}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer text-left"
          >
            <FileText className="h-4 w-4 text-slate-500" />
            <div>
              <p className="font-semibold text-slate-900">Download CSV</p>
              <p className="text-[10px] text-slate-400">UTF-8 BOM • Universal format</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleSelectFormat("xlsx")}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer text-left mt-0.5"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            <div>
              <p className="font-semibold text-slate-900">Download Excel (.xlsx)</p>
              <p className="text-[10px] text-slate-400">Styled workbook + Filters sheet</p>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

