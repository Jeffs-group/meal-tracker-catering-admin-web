import React from "react";
import { Link } from "react-router-dom";
import { FileText, FileSpreadsheet, ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/utils/cn";
import type { ReportItemConfig } from "@/constants/reports";
import type { ExportFormat } from "@/types/reports.types";

export interface ReportCardProps {
  config: ReportItemConfig;
  icon: React.ReactNode;
  onExport: (format: ExportFormat) => void;
  isExporting?: boolean;
  className?: string;
}

export const ReportCard: React.FC<ReportCardProps> = ({
  config,
  icon,
  onExport,
  isExporting = false,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:shadow-subtle transition-shadow",
        className,
      )}
    >
      <div>
        {/* Header: Icon tile + Eyebrow */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FAF4E6] text-[#C9A227] border border-[#ECD59A] shadow-2xs">
            {icon}
          </div>
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">
            {config.eyebrow}
          </span>
        </div>

        {/* Title & 2-Line Description */}
        <h3 className="mt-4 text-lg font-bold tracking-tight text-slate-900 leading-snug">
          {config.title}
        </h3>
        <p className="mt-2 text-xs text-slate-500 line-clamp-2 leading-relaxed">
          {config.description}
        </p>
      </div>

      {/* Actions footer: CSV & Excel buttons + View Report link */}
      <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onExport("csv")}
            disabled={isExporting}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition-colors cursor-pointer disabled:opacity-50"
            title="Download full report dataset in CSV"
          >
            {isExporting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-500" />
            ) : (
              <FileText className="h-3.5 w-3.5 text-slate-500" />
            )}
            <span>CSV</span>
          </button>

          <button
            type="button"
            onClick={() => onExport("xlsx")}
            disabled={isExporting}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition-colors cursor-pointer disabled:opacity-50"
            title="Download full report dataset in Excel (.xlsx)"
          >
            {isExporting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-600" />
            ) : (
              <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
            )}
            <span>Excel</span>
          </button>
        </div>

        <Link
          to={config.route}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#C9A227] px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#B8901E] transition-colors cursor-pointer group"
        >
          <span>View Report</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
};

