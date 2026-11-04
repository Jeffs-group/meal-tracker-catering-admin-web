import React from "react";
import type { TeamReportSummary } from "@/types/reports.types";

export interface SummaryRowProps {
  summary: TeamReportSummary;
  isMobileCard?: boolean;
}

export const SummaryRow: React.FC<SummaryRowProps> = ({
  summary,
  isMobileCard = false,
}) => {
  const { totalTeams, activeTeams, kspl, iscl, overallCompliance } = summary;
  const totalRegistrations = kspl.totalRegistrations + iscl.totalRegistrations;
  const totalApproved = kspl.approvedCount + iscl.approvedCount;
  const totalPending = kspl.pendingCount + iscl.pendingCount;
  const totalRejected = kspl.rejectedCount + iscl.rejectedCount;

  if (isMobileCard) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 mb-4 shadow-2xs">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
            All Filtered Teams ({totalTeams})
          </span>
          <span className="rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-semibold px-2 py-0.5">
            {activeTeams} Active
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-slate-500">Total Reg:</span>{" "}
            <span className="font-bold font-mono text-slate-900">{totalRegistrations}</span>
          </div>
          <div>
            <span className="text-slate-500">Approved:</span>{" "}
            <span className="font-bold font-mono text-emerald-700">
              {totalApproved} ({totalRegistrations > 0 ? Math.round((totalApproved / totalRegistrations) * 100) : 0}%)
            </span>
          </div>
          <div>
            <span className="text-slate-500">Pending:</span>{" "}
            <span className="font-bold font-mono text-amber-700">{totalPending}</span>
          </div>
          <div>
            <span className="text-slate-500">Rejected:</span>{" "}
            <span className="font-bold font-mono text-rose-700">{totalRejected}</span>
          </div>
        </div>
        <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="font-medium text-slate-600">Weighted Compliance:</span>
          <span className="font-bold font-mono text-slate-900">{overallCompliance}%</span>
        </div>
      </div>
    );
  }

  return (
    <tfoot className="border-t-2 border-slate-300 bg-slate-100/90 font-semibold text-slate-900 sticky bottom-0 z-10 text-xs">
      <tr>
        <td className="px-4 py-3 font-bold">
          All filtered teams ({totalTeams})
        </td>
        <td className="px-4 py-3 font-mono text-slate-600">
          {activeTeams} Active
        </td>
        <td className="px-4 py-3 font-mono font-bold text-slate-900">
          {totalRegistrations}
        </td>
        <td className="px-4 py-3 font-mono text-emerald-700 font-bold">
          {totalApproved}{" "}
          <span className="text-slate-500 text-[11px] font-normal">
            ({totalRegistrations > 0 ? Math.round((totalApproved / totalRegistrations) * 100) : 0}%)
          </span>
        </td>
        <td className="px-4 py-3 font-mono text-amber-700">
          {totalPending}
        </td>
        <td className="px-4 py-3 font-mono text-rose-700">
          {totalRejected}
        </td>
        <td className="px-4 py-3 text-slate-500 font-normal">
          —
        </td>
        <td className="px-4 py-3 font-mono font-bold text-slate-900">
          {overallCompliance}%
        </td>
      </tr>
    </tfoot>
  );
};

