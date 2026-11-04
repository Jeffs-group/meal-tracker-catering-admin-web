import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, RefreshCw, ChevronRight } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/utils/cn";
import { formatTimeOnlyIST } from "@/utils/formatDate";

export interface ReportPageShellProps {
  title: string;
  description: string;
  generatedAt?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  exportAction?: React.ReactNode;
  children: React.ReactNode;
}

export const ReportPageShell: React.FC<ReportPageShellProps> = ({
  title,
  description,
  generatedAt,
  onRefresh,
  isRefreshing = false,
  exportAction,
  children,
}) => {
  const updatedTimeStr = generatedAt ? formatTimeOnlyIST(generatedAt) : formatTimeOnlyIST(new Date().toISOString());

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Navigation */}
      <div>
        <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-2.5">
          <Link to={ROUTES.DASHBOARD} className="hover:text-slate-800 transition-colors">
            Dashboard
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          <Link to={ROUTES.REPORTS} className="hover:text-slate-800 transition-colors">
            Reports
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          <span className="font-semibold text-slate-800">{title}</span>
        </nav>

        {/* Back Link */}
        <Link
          to={ROUTES.REPORTS}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#9B7415] hover:text-[#7D5C13] transition-colors mb-2 cursor-pointer group"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
          <span>Back to Reports Hub</span>
        </Link>
      </div>

      {/* Page Header Banner */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 pb-1 border-b border-slate-200">
        <div className="max-w-3xl">
          <h1 className="text-[clamp(24px,2vw+16px,32px)] font-bold tracking-tight text-slate-900 leading-[1.25]">
            {title}
          </h1>
          <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">
            {description}
          </p>
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
            <span>Updated {updatedTimeStr}</span>
            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                disabled={isRefreshing}
                title="Refresh report metrics"
                className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
                aria-label="Refresh report metrics"
              >
                <RefreshCw
                  className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin text-[#C9A227]")}
                />
              </button>
            )}
          </div>
        </div>

        {/* Export control: full width on mobile, inline on desktop */}
        {exportAction && (
          <div className="w-full md:w-auto shrink-0 pt-1">
            {exportAction}
          </div>
        )}
      </div>

      {/* Main Page Content */}
      <div>{children}</div>
    </div>
  );
};

