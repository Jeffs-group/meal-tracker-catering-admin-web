import React, { useState } from "react";
import {
  Shield,
  Users,
  UtensilsCrossed,
  RotateCcw,
  Lock,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  FileSpreadsheet,
  Check,
  Calendar,
  Filter,
} from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { TeamTile } from "@/components/reports/TeamTile";
import { useLiveDistributionReport } from "@/hooks/useCatering";
import { exportLiveDistributionReportCsv } from "@/api/catering.api";
import { getTodayDateString } from "@/constants/catering";
import { cn } from "@/utils/cn";

export const CateringReportsOverviewPage: React.FC = () => {
  const [operatingDate, setOperatingDate] = useState<string>(() => getTodayDateString());
  const [selectedTeam, setSelectedTeam] = useState<string>("all");
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const {
    data: report,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useLiveDistributionReport({
    date: operatingDate,
    teamId: selectedTeam !== "all" ? selectedTeam : undefined,
  });

  const handleExportCsv = async () => {
    setIsExporting(true);
    setExportSuccess(false);
    try {
      const blob = await exportLiveDistributionReportCsv(
        operatingDate,
        selectedTeam !== "all" ? selectedTeam : undefined,
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `live-distribution-report_${operatingDate}${
        selectedTeam !== "all" ? `_${selectedTeam}` : ""
      }.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleReset = () => {
    setOperatingDate(getTodayDateString());
    setSelectedTeam("all");
    refetch();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex h-96 flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xs">
          <RefreshCw className="h-8 w-8 animate-spin text-[#C9A227]" />
          <h2 className="text-sm font-bold text-slate-800">
            Fetching Live Reconciliation Distribution Report…
          </h2>
          <p className="max-w-md text-xs text-slate-500">
            Aggregating real-time meal counts across matchday team rosters, operational staff, and audit protocols.
          </p>
        </div>
      </div>
    );
  }

  if (isError || !report) {
    const errorMsg =
      (error as { message?: string })?.message ||
      "Unable to fetch live distribution report from the server.";

    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-6 text-slate-800 shadow-xs">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h2 className="text-base font-bold text-rose-900">
                Live Distribution Report Error
              </h2>
              <p className="mt-1 text-sm text-rose-700 leading-relaxed">
                {errorMsg}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700 transition cursor-pointer"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Retry Loading</span>
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reset to Today</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isReconciled = report.kpis?.totalMealsProvided?.isReconciled ?? true;
  const teamsList = report.teamWiseDistribution?.teams ?? [];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-1 border-b border-slate-200 gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-[clamp(24px,2vw+16px,32px)] font-bold tracking-tight text-slate-900 leading-[1.25]">
              Live Reconciliation Distribution Report
            </h1>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold",
                isReconciled
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-amber-200 bg-amber-50 text-amber-800",
              )}
            >
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  isReconciled ? "bg-emerald-500" : "bg-amber-500",
                )}
              />
              <span>
                {report.kpis?.totalMealsProvided?.badge ||
                  (isReconciled ? "Reconciled 100%" : "Discrepancy Detected")}
              </span>
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-600 leading-relaxed">
            Consolidated matchday meal records, period share breakdown, operational staff allocations, and cryptographic audit protocol.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={isExporting}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-slate-800 active:scale-[0.99] transition disabled:opacity-60 cursor-pointer"
          >
            {isExporting ? (
              <RefreshCw className="h-4 w-4 animate-spin text-white" />
            ) : exportSuccess ? (
              <Check className="h-4 w-4 text-emerald-400" />
            ) : (
              <FileSpreadsheet className="h-4 w-4 text-[#DEC067]" />
            )}
            <span>
              {isExporting
                ? "Exporting CSV…"
                : exportSuccess
                  ? "Exported!"
                  : "Export Report (CSV)"}
            </span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            {/* Operating Date Input */}
            <div className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs">
              <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span className="text-slate-500 font-semibold">Date:</span>
              <input
                type="date"
                value={operatingDate}
                onChange={(e) => setOperatingDate(e.target.value)}
                className="text-xs font-bold text-slate-800 border-none outline-none cursor-pointer bg-transparent"
              />
            </div>

            {/* Team Filter Dropdown */}
            <div className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-1 text-xs">
              <Filter className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <select
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
                className="border-none outline-none bg-transparent font-medium text-slate-700 cursor-pointer py-1"
              >
                <option value="all">
                  All Teams ({report.teamWiseDistribution?.activeTeamsCount ?? teamsList.length} Active)
                </option>
                {teamsList.map((t) => (
                  <option key={t.teamId} value={t.teamId}>
                    {t.teamName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => refetch()}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer px-2 py-1"
              title="Refresh live data"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", isFetching && "animate-spin")} />
              <span>Refresh</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer px-2 py-1"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3 Top Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="TOTAL MEALS PROVIDED"
          value={report.kpis?.totalMealsProvided?.value ?? 0}
          subtitle={
            report.kpis?.totalMealsProvided?.subtitle ||
            "Total actual meals recorded across all eligible recipients today"
          }
          icon={<UtensilsCrossed className="h-5 w-5 text-[#C9A227]" />}
          badgeText={report.kpis?.totalMealsProvided?.badge || "Reconciled 100%"}
          badgeVariant={isReconciled ? "success" : "warning"}
        />

        <StatCard
          title="TEAM MEALS PROVIDED"
          value={report.kpis?.teamMealsProvided?.displayValue || "0 / 0 Active"}
          subtitle={
            report.kpis?.teamMealsProvided?.subtitle ||
            "Distributed to verified players, coaches & team staff"
          }
          icon={<Shield className="h-5 w-5 text-slate-400" />}
          badgeText={`${report.kpis?.teamMealsProvided?.activeTeamsCount ?? 0} Teams`}
          badgeVariant="neutral"
        />

        <StatCard
          title="STAFF MEALS PROVIDED"
          value={report.kpis?.staffMealsProvided?.displayValue || "00 / 00 Verified"}
          subtitle={
            report.kpis?.staffMealsProvided?.subtitle ||
            "Independently verified meals for approved operational staff"
          }
          icon={<Users className="h-5 w-5 text-emerald-600" />}
          badgeText="Direct Access"
          badgeVariant="success"
        />
      </div>

      {/* Grid: Meal Period Distribution & Staff Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Meal Period Distribution Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Meal Period Distribution
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Proportional share of today's total meals dispensed.
                </p>
              </div>
              <span className="rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-xs font-bold text-slate-700">
                {report.mealPeriodDistribution?.periodsBadge ||
                  `${report.mealPeriodDistribution?.totalPeriods ?? 0} Periods Total`}
              </span>
            </div>

            <div className="space-y-4">
              {(report.mealPeriodDistribution?.periods ?? []).length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  No meal period windows configured for this date.
                </div>
              ) : (
                report.mealPeriodDistribution.periods.map((p) => {
                  const pNameLower = p.name.toLowerCase();
                  const dotColor = pNameLower.includes("breakfast")
                    ? "bg-[#DEC067]"
                    : pNameLower.includes("lunch")
                      ? "bg-[#059669]"
                      : pNameLower.includes("dinner")
                        ? "bg-[#3B82F6]"
                        : "bg-slate-400";

                  const barColor = pNameLower.includes("lunch") ? "emerald" : "gold";

                  return (
                    <div key={p.id} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className={cn("h-2.5 w-2.5 rounded-full shrink-0", dotColor)} />
                          <span className="font-bold text-slate-900">{p.name}</span>
                          <span className="text-slate-400">({p.timingLabel})</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-slate-900">
                            {p.dispensedLabel || `${p.mealsDispensed} dispensed`}
                          </span>
                          <span className="text-slate-500 text-[11px] ml-1.5 font-medium">
                            ({p.percentage}%)
                          </span>
                        </div>
                      </div>

                      <ProgressBar
                        value={p.progressPercentage || p.percentage || 0}
                        size="sm"
                        color={barColor}
                      />

                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>{p.statusLabel || p.status}</span>
                        <span
                          className={cn(
                            "rounded px-1.5 py-0.5 text-[10px] font-bold uppercase",
                            p.isActive
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-slate-100 text-slate-600 border border-slate-200",
                          )}
                        >
                          {p.status}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-800">
            <span>Summary:</span>
            <span>
              {report.mealPeriodDistribution?.totalDailySumLabel ||
                `Total Daily Sum: ${report.mealPeriodDistribution?.totalDailySum ?? 0} Meals`}
            </span>
          </div>
        </div>

        {/* Approved Staff Distribution Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  Approved Staff Distribution
                </h3>
                <span className="rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                  {report.approvedStaffDistribution?.badge || "NON-MATCHDAY"}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-500 mb-3">
              {report.approvedStaffDistribution?.subtitle ||
                "Independent logistics & operational personnel"}
            </p>

            <div className="flex items-center justify-between text-xs text-slate-600 mb-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <span>
                Approved Staff Roster:{" "}
                <strong>
                  {report.approvedStaffDistribution?.summary?.approvedRosterLabel ||
                    `${report.approvedStaffDistribution?.summary?.approvedRosterCount ?? 0} Staff`}
                </strong>
              </span>
              <span>
                Total Meals Dispensed:{" "}
                <strong>
                  {report.approvedStaffDistribution?.summary?.mealsDispensedLabel ||
                    `${report.approvedStaffDistribution?.summary?.mealsDispensedCount ?? 0} Recorded`}
                </strong>
              </span>
            </div>

            {/* Staff Breakdown Rows */}
            <div className="space-y-2">
              {(report.approvedStaffDistribution?.recipients ?? []).length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  No staff distributions recorded for this date.
                </div>
              ) : (
                report.approvedStaffDistribution.recipients.map((staff) => (
                  <div
                    key={staff.id}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-[#F8F9FA]"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-white font-bold text-xs select-none shrink-0">
                        {staff.fullName.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 text-xs truncate">
                          {staff.fullName}
                        </p>
                        <p className="text-[10px] text-slate-500 font-mono truncate">
                          {staff.subtext || `${staff.registrantCode} • ${staff.role}`}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0 ml-2">
                      <span className="rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                        {staff.mealsCountLabel || `${staff.mealsCount} Meals`}
                      </span>
                      {staff.periodTags && staff.periodTags.length > 0 && (
                        <div className="flex items-center justify-end gap-1 mt-1">
                          {staff.periodTags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded bg-slate-200 px-1 py-0.2 text-[9px] font-bold text-slate-700"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-right text-xs text-slate-500">
            {report.approvedStaffDistribution?.summary?.approvedRosterLabel ?? "0 Staff"} roster personnel configured
          </div>
        </div>
      </div>

      {/* Team-wise Meal Distribution Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">
              Team-wise Meal Distribution
            </h3>
            <span className="rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 text-[11px] font-bold text-slate-700">
              {report.teamWiseDistribution?.activeTeamsBadge ||
                `${report.teamWiseDistribution?.activeTeamsCount ?? teamsList.length} Active Teams`}
            </span>
          </div>

          <span className="text-xs font-semibold text-slate-500">
            {report.teamWiseDistribution?.sumTeamMealsLabel ||
              `Sum: ${report.teamWiseDistribution?.sumTeamMeals ?? 0} Team Meals`}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3">Team</th>
                <th className="px-4 py-3">Eligible</th>
                <th className="px-4 py-3">Meals Provided</th>
                <th className="px-4 py-3 w-48">Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {teamsList.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                    No active tournament teams recorded for this date.
                  </td>
                </tr>
              ) : (
                teamsList.map((t) => (
                  <tr key={t.teamId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <TeamTile name={t.teamName} size="sm" />
                        <span className="font-bold text-slate-900">{t.teamName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {t.eligibleLabel || `${t.eligibleCount} eligible`}
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900">
                      {t.mealsProvidedLabel || `${t.mealsProvided} meals`}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-28">
                          <ProgressBar
                            value={t.progressPercentage}
                            size="sm"
                            color="gold"
                          />
                        </div>
                        <span className="font-semibold text-slate-800 text-[11px]">
                          {t.progressLabel || `${t.progressPercentage}%`}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {/* Table Footer Roll-up */}
            {report.teamWiseDistribution?.footer && (
              <tfoot className="border-t-2 border-slate-200 bg-slate-50 text-slate-800 font-bold">
                <tr>
                  <td className="px-4 py-3">
                    Total Delegations: {report.teamWiseDistribution.activeTeamsCount}
                  </td>
                  <td className="px-4 py-3">
                    {report.teamWiseDistribution.footer.totalAllocationLabel}
                  </td>
                  <td className="px-4 py-3">
                    {report.teamWiseDistribution.footer.totalProvidedLabel}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-between">
                      <span>{report.teamWiseDistribution.footer.averageProgressLabel}</span>
                      <span className="text-[#9B7415]">
                        {report.teamWiseDistribution.footer.sumMealsLabel}
                      </span>
                    </div>
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Recent Meal Distribution Activity */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Recent Meal Distribution Activity
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live chronological transaction log from the verified distribution counter.
            </p>
          </div>
          <span className="rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-xs font-bold text-slate-700">
            {(report.recentActivity ?? []).length} Recorded
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-2.5">Name</th>
                <th className="px-4 py-2.5">ID</th>
                <th className="px-4 py-2.5">Type</th>
                <th className="px-4 py-2.5">Team</th>
                <th className="px-4 py-2.5">Period</th>
                <th className="px-4 py-2.5">Date</th>
                <th className="px-4 py-2.5 text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {(report.recentActivity ?? []).length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    No recent distribution scans recorded for this date.
                  </td>
                </tr>
              ) : (
                report.recentActivity.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-2.5 font-bold text-slate-900">{r.registrantName}</td>
                    <td className="px-4 py-2.5 font-mono text-slate-600">{r.registeredId}</td>
                    <td className="px-4 py-2.5">
                      <span
                        className={cn(
                          "rounded px-2 py-0.5 text-[10px] font-semibold",
                          r.isStaff
                            ? "bg-purple-50 text-purple-700 border border-purple-200"
                            : "bg-slate-100 text-slate-700",
                        )}
                      >
                        {r.type || (r.isStaff ? "Staff" : "Team Member")}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-slate-700">{r.team}</td>
                    <td className="px-4 py-2.5">
                      <span className="rounded bg-emerald-50 text-emerald-800 px-2 py-0.5 text-[10px] font-bold">
                        {r.mealPeriod}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-slate-600">{r.date}</td>
                    <td className="px-4 py-2.5 text-right font-sans text-slate-600">
                      {r.time}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit & Cryptographic Reconciliation Protocol Card */}
      {report.auditProtocol && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-[#C9A227]" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                {report.auditProtocol.title}
              </h4>
            </div>

            <span
              className={cn(
                "inline-flex items-center gap-1.5 text-xs font-bold",
                report.auditProtocol.isReconciled ? "text-emerald-700" : "text-amber-700",
              )}
            >
              {report.auditProtocol.isReconciled ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>● ZERO DISCREPANCY VERIFIED</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                  <span>● DISCREPANCY DETECTED</span>
                </>
              )}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-500 font-semibold">Checksum Formula:</span>
            <code className="rounded bg-slate-100 px-2 py-0.5 font-mono font-bold text-slate-900 border border-slate-200">
              {report.auditProtocol.checksumFormula}
            </code>
            <span className="text-slate-400">
              ({report.auditProtocol.totalMeals} Total = {report.auditProtocol.teamMeals} Team + {report.auditProtocol.staffMeals} Staff)
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed italic">
            "{report.auditProtocol.statement}"
          </p>
        </div>
      )}
    </div>
  );
};

export default CateringReportsOverviewPage;
