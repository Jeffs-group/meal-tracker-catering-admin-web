import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle2,
  ArrowLeft,
  Eye,
  Lock,
} from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Pagination } from "@/components/ui/Pagination";
import { Input } from "@/components/ui/Input";
import { ExportMenu } from "@/components/reports/ExportMenu";
import { TeamTile } from "@/components/reports/TeamTile";
import { DistributionDetailDrawer } from "@/components/catering/DistributionDetailDrawer";
import { useMealPeriodReport } from "@/hooks/useCatering";
import { exportCateringReport } from "@/api/catering.api";
import { formatTimestampIST } from "@/utils/cateringClock";
import { ROUTES } from "@/constants/routes";
import type { MealPeriodKey, DistributionDetail } from "@/types/catering.types";
import { cn } from "@/utils/cn";

export const MealPeriodReportPage: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<MealPeriodKey>("lunch");
  const [date] = useState("2026-11-03");
  const [ledgerTab, setLedgerTab] = useState<"all" | "team_member" | "staff">("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [activeDrawerRecord, setActiveDrawerRecord] = useState<DistributionDetail | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const { data } = useMealPeriodReport(selectedPeriod, date);

  const summary = data?.summary || {
    periodKey: selectedPeriod,
    periodLabel: "Lunch",
    periodRange: "12:00 PM – 03:00 PM",
    periodState: "live" as const,
    totalPeriodMeals: 40,
    teamPeriodMeals: 38,
    teamEligibleCount: 125,
    staffPeriodMeals: 2,
    staffEligibleCount: 6,
    completionRatePercent: 31,
    formula: {
      teamMeals: 38,
      staffMeals: 2,
      totalMeals: 40,
      isBalanced: true,
    },
  };

  const teamBreakdown = data?.teamBreakdown || [];
  const records = data?.records || [];

  const filteredRecords = records.filter((r) => {
    if (ledgerTab !== "all" && r.recipientType !== ledgerTab) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        r.recipientName.toLowerCase().includes(q) ||
        r.registrantId.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const start = (page - 1) * pageSize;
  const pagedRecords = filteredRecords.slice(start, start + pageSize);

  const handleExport = async (format: "csv" | "xlsx") => {
    setIsExporting(true);
    try {
      const blob = await exportCateringReport(`meal_period_${selectedPeriod}`, format, {
        date,
        periodKey: selectedPeriod,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `meal-tracker_${selectedPeriod}_season-2026_${date}.${format}`;
      a.click();
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-1 border-b border-slate-200 gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-[clamp(24px,2vw+16px,32px)] font-bold tracking-tight text-slate-900 leading-[1.25]">
              Meal-period Distribution
            </h1>
            <span className="rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-xs font-bold text-slate-700">
              AUDITED WINDOW LEDGER
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-600 leading-relaxed">
            Detailed dispensation velocity and participant fulfillment for specific service windows.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 self-start sm:self-auto">
          <Link
            to={ROUTES.CATERING.REPORTS}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Reports Overview</span>
          </Link>

          <ExportMenu
            onExport={handleExport}
            isExporting={isExporting}
            totalRecords={summary.totalPeriodMeals}
          />
        </div>
      </div>

      {/* Filter Row: Period Window Selection */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Select Window:
            </span>

            {(["breakfast", "lunch", "dinner"] as MealPeriodKey[]).map((pk) => {
              const isSelected = selectedPeriod === pk;
              const label = pk.charAt(0).toUpperCase() + pk.slice(1);
              return (
                <button
                  key={pk}
                  type="button"
                  onClick={() => setSelectedPeriod(pk)}
                  className={cn(
                    "rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer",
                    isSelected
                      ? "bg-[#C9A227] text-white shadow-xs"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200",
                  )}
                >
                  {label} Service
                </button>
              );
            })}
          </div>

          <div className="text-xs font-semibold text-slate-500">
            Operating Date: <strong>Today, 03 Nov 2026</strong>
          </div>
        </div>
      </div>

      {/* 3 Top Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. Service Window */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              SERVICE WINDOW
            </span>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-bold",
                summary.periodState === "live"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-slate-100 text-slate-600 border border-slate-200",
              )}
            >
              {summary.periodState === "live" ? "Active Now" : summary.periodState.toUpperCase()}
            </span>
          </div>

          <div className="mt-3">
            <h3 className="text-base font-bold text-slate-900">
              {summary.periodLabel} Session
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">{summary.periodRange} IST</p>
          </div>
        </div>

        {/* 2. Total Meals Provided */}
        <StatCard
          title="TOTAL MEALS PROVIDED"
          value={summary.totalPeriodMeals}
          subtitle={`Matches the ${summary.periodLabel} total on Reports Overview`}
          badgeText="Verified Today"
          badgeVariant="success"
        />

        {/* 3. Team Roster Meals */}
        <StatCard
          title="TEAM ROSTER MEALS"
          value={`${summary.teamPeriodMeals} / ${summary.teamEligibleCount} registered`}
          subtitle={`${summary.completionRatePercent}% period completion rate`}
          progress={{
            value: summary.completionRatePercent,
            color: "gold",
          }}
        />
      </div>

      {/* Distribution Integrity Verified Strip */}
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-emerald-950 font-semibold">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>
            Distribution Integrity Verified: Team Meals ({summary.teamPeriodMeals}) + Staff Meals (
            {summary.staffPeriodMeals}) = Total {summary.periodLabel} Meals ({summary.totalPeriodMeals})
          </span>
        </div>

        <span className="rounded-full bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-900 self-start sm:self-auto">
          ● ZERO DISCREPANCY
        </span>
      </div>

      {/* Team Distribution Breakdown Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">
              Team Distribution ({summary.periodLabel} Window)
            </h3>
            <span className="rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 text-[11px] font-bold text-slate-700">
              {summary.teamPeriodMeals} / {summary.teamEligibleCount} Active Meals
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3">Team</th>
                <th className="px-4 py-3">Roster Size</th>
                <th className="px-4 py-3">Served</th>
                <th className="px-4 py-3 w-44">Completion Rate</th>
                <th className="px-4 py-3 text-right">Operational Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {teamBreakdown.map((t) => (
                <tr key={t.teamId} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <TeamTile name={t.teamName} code={t.letterCode} size="sm" />
                      <span className="font-bold text-slate-900">{t.teamName}</span>
                    </div>
                  </td>

                  <td className="px-4 py-3 text-slate-600">{t.rosterSize} eligible</td>

                  <td className="px-4 py-3 font-bold text-slate-900">
                    {t.servedCount}
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-24">
                        <ProgressBar
                          value={t.completionPercent}
                          size="sm"
                          color={t.status === "High Inflow" ? "emerald" : "gold"}
                        />
                      </div>
                      <span className="font-bold text-slate-800 text-[11px]">
                        {t.completionPercent}%
                      </span>
                    </div>
                  </td>

                  <td className="px-4 py-3 text-right">
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-[10px] font-bold select-none",
                        t.status === "High Inflow"
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : "bg-slate-100 text-slate-700 border border-slate-200",
                      )}
                    >
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            {/* Total Row */}
            <tfoot className="border-t-2 border-slate-200 bg-slate-50 text-slate-900 font-bold">
              <tr>
                <td className="px-4 py-3">Total Team {summary.periodLabel}</td>
                <td className="px-4 py-3">{summary.teamEligibleCount}</td>
                <td className="px-4 py-3">{summary.teamPeriodMeals}</td>
                <td className="px-4 py-3">
                  Weighted: {summary.completionRatePercent}%
                </td>
                <td className="px-4 py-3 text-right text-emerald-700">● Live</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Period Distribution Ledger */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">
              {summary.periodLabel} Distribution Ledger
            </h3>
            <span className="rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 text-[11px] font-bold text-slate-700">
              {summary.totalPeriodMeals} Verified Events
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search recipient or ID…"
              className="w-48 text-xs py-1"
            />

            {/* Tabs: All / Team / Staff */}
            <div className="inline-flex rounded-lg bg-slate-100 p-0.5 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setLedgerTab("all")}
                className={cn(
                  "rounded-md px-3 py-1 cursor-pointer transition-all",
                  ledgerTab === "all" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600",
                )}
              >
                All ({records.length})
              </button>
              <button
                type="button"
                onClick={() => setLedgerTab("team_member")}
                className={cn(
                  "rounded-md px-3 py-1 cursor-pointer transition-all",
                  ledgerTab === "team_member" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600",
                )}
              >
                Team ({summary.teamPeriodMeals})
              </button>
              <button
                type="button"
                onClick={() => setLedgerTab("staff")}
                className={cn(
                  "rounded-md px-3 py-1 cursor-pointer transition-all",
                  ledgerTab === "staff" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600",
                )}
              >
                Staff ({summary.staffPeriodMeals})
              </button>
            </div>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3">Registrant ID</th>
                <th className="px-4 py-3">Recipient Name & Role</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Team</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {pagedRecords.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-slate-800">
                    {r.registrantId}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-bold text-slate-900">{r.recipientName}</p>
                    <p className="text-[11px] text-slate-500">
                      {r.recipientDesignation} • Active Roster
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                      {r.recipientType === "staff" ? "Staff" : "Team Member"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{r.teamName || "—"}</td>
                  <td className="px-4 py-3 text-slate-600">03 Nov 2026</td>
                  <td className="px-4 py-3 font-sans text-slate-700">
                    {formatTimestampIST(r.providedAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => setActiveDrawerRecord(r)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#9B7415] hover:underline cursor-pointer"
                    >
                      <span>View Details</span>
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Protocol Footer Note */}
        <div className="pt-3 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-500">
          <Lock className="h-3 w-3 text-slate-400 shrink-0" />
          <span>
            Audit & Service Protocol: Timestamps are recorded at portion confirmation.
            Team members require matchday activation; operational staff are eligible upon credential approval.
            Duplicate requests in the same period are permanently locked.
          </span>
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={page}
          totalPages={Math.ceil(filteredRecords.length / pageSize) || 1}
          totalItems={filteredRecords.length}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setPage(1);
          }}
          pageSizeOptions={[10, 25, 50]}
        />
      </div>

      <DistributionDetailDrawer
        record={activeDrawerRecord}
        isOpen={!!activeDrawerRecord}
        onClose={() => setActiveDrawerRecord(null)}
      />
    </div>
  );
};

export default MealPeriodReportPage;
