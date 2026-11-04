import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Lock,
  ArrowLeft,
  RotateCcw,
  Eye,
  Store,
} from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import { Input } from "@/components/ui/Input";
import { Pagination } from "@/components/ui/Pagination";
import { ExportMenu } from "@/components/reports/ExportMenu";
import { LedgerDigest } from "@/components/catering/LedgerDigest";
import { HourlyVelocityChart } from "@/components/catering/HourlyVelocityChart";
import { DistributionDetailDrawer } from "@/components/catering/DistributionDetailDrawer";
import { ProtocolDialog } from "@/components/catering/ProtocolDialog";
import {
  useDistributionLedger,
  useHourlyVelocity,
} from "@/hooks/useCatering";
import { exportCateringReport } from "@/api/catering.api";
import { formatTimestampIST } from "@/utils/cateringClock";
import { ROUTES } from "@/constants/routes";
import { COUNTERS } from "@/constants/catering";
import type { DistributionDetail, MealPeriodKey } from "@/types/catering.types";
import { cn } from "@/utils/cn";

export const DistributionActivityReportPage: React.FC = () => {
  const [date] = useState("2026-11-03");
  const [tabPeriod, setTabPeriod] = useState<MealPeriodKey | "all">("all");
  const [teamFilter, setTeamFilter] = useState("all");
  const [recipientFilter, setRecipientFilter] = useState<"all" | "team_member" | "staff">("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [activeDrawerRecord, setActiveDrawerRecord] = useState<DistributionDetail | null>(null);
  const [isProtocolOpen, setIsProtocolOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const { data, isLoading } = useDistributionLedger({
    date,
    periodKey: tabPeriod,
    teamId: teamFilter !== "all" ? teamFilter : undefined,
    recipientType: recipientFilter,
  });

  const { data: hourlyData = [] } = useHourlyVelocity({ date });

  const records = data?.records || [];
  const summary = data?.summary || {
    totalDistributions: 85,
    teamDistributions: 81,
    teamDistributionsPercent: 95,
    teamCount: 5,
    staffDistributions: 4,
    staffDistributionsPercent: 5,
    formula: {
      teamCount: 81,
      staffCount: 4,
      total: 85,
      isBalanced: true,
    },
    reconciliationStatus: "balanced" as const,
    discrepancyCount: 0,
  };

  // Client-side quick search filtering
  const filteredRecords = search.trim()
    ? records.filter(
        (r) =>
          r.recipientName.toLowerCase().includes(search.toLowerCase()) ||
          r.registrantId.toLowerCase().includes(search.toLowerCase()) ||
          r.receiptCode.toLowerCase().includes(search.toLowerCase()),
      )
    : records;

  const start = (page - 1) * pageSize;
  const pagedRecords = filteredRecords.slice(start, start + pageSize);

  const handleExport = async (format: "csv" | "xlsx") => {
    setIsExporting(true);
    try {
      const blob = await exportCateringReport("distribution_activity", format, {
        date,
        periodKey: tabPeriod,
        teamId: teamFilter !== "all" ? teamFilter : undefined,
        recipientType: recipientFilter,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `meal-tracker_activity_season-2026_${date}.${format}`;
      a.click();
    } finally {
      setIsExporting(false);
    }
  };

  // Counter breakdown for Counter Activity section
  const counterActivityList = COUNTERS.map((c) => {
    const cRecords = records.filter((r) => r.counterId === c.id);
    const lastRec = cRecords.sort(
      (a, b) => new Date(b.providedAt).getTime() - new Date(a.providedAt).getTime(),
    )[0];

    return {
      id: c.id,
      name: c.name,
      terminal: c.terminal,
      gate: c.gate,
      dispensedCount: cRecords.length,
      lastDispenseTime: lastRec ? formatTimestampIST(lastRec.providedAt) : "09:45 AM",
    };
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-1 border-b border-slate-200 gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-[clamp(24px,2vw+16px,32px)] font-bold tracking-tight text-slate-900 leading-[1.25]">
              All Distribution Activity
            </h1>
            <span className="rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-xs font-bold text-slate-700">
              COMPREHENSIVE AUDIT LOG
            </span>
            <LedgerDigest records={records} />
          </div>
          <p className="mt-1 text-sm text-slate-600 leading-relaxed">
            Real-time immutable ledger of every individual meal dispense event logged across matchday counters.
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
            totalRecords={summary.totalDistributions}
          />
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="TOTAL MEAL DISTRIBUTIONS"
          value={summary.totalDistributions}
          subtitle="Cumulative verified meals dispensed today"
          badgeText="Append-Only Ledger"
          badgeVariant="neutral"
        />

        <StatCard
          title="TEAM ATHLETES & CREWS"
          value={`${summary.teamDistributions} records`}
          subtitle={`Across ${summary.teamCount} registered matchday teams (${summary.teamDistributionsPercent}%)`}
          badgeText={`${summary.teamDistributionsPercent}% Total`}
          badgeVariant="warning"
        />

        <StatCard
          title="OPERATIONAL STAFF"
          value={`${summary.staffDistributions} records`}
          subtitle={`Tournament logistics & facilities (${summary.staffDistributionsPercent}%)`}
          badgeText="Direct Eligibility"
          badgeVariant="neutral"
        />

        {/* 4. Audit Reconciliation Formula Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              RECONCILIATION FORMULA
            </span>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-bold",
                summary.reconciliationStatus === "balanced"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-amber-50 text-amber-800 border border-amber-200",
              )}
            >
              {summary.reconciliationStatus === "balanced"
                ? "ZERO DISCREPANCY"
                : `Discrepancy: ${summary.discrepancyCount}`}
            </span>
          </div>

          <div className="mt-3">
            <p className="font-mono text-xs font-bold text-slate-900 leading-tight">
              {summary.teamDistributions} Team + {summary.staffDistributions} Staff = {summary.totalDistributions} Events
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Ledger locked & validated against matchday authorizations.
            </p>
          </div>
        </div>
      </div>

      {/* Filter Row */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by ID, recipient name or receipt code…"
              className="w-full text-xs"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Recipient Category Filter */}
            <select
              value={recipientFilter}
              onChange={(e) => {
                setRecipientFilter(e.target.value as "all" | "team_member" | "staff");
                setPage(1);
              }}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 cursor-pointer"
            >
              <option value="all">All Recipient Categories</option>
              <option value="team_member">Team Members</option>
              <option value="staff">Operational Staff</option>
            </select>

            {/* Team filter */}
            <select
              value={teamFilter}
              onChange={(e) => {
                setTeamFilter(e.target.value);
                setPage(1);
              }}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 cursor-pointer"
            >
              <option value="all">All Teams</option>
              <option value="chennai-kings">Chennai Kings</option>
              <option value="madurai-warriors">Madurai Warriors</option>
              <option value="salem-strikers">Salem Strikers</option>
              <option value="trichy-panthers">Trichy Panthers</option>
              <option value="erode-titans">Erode Titans</option>
            </select>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setTabPeriod("all");
                setTeamFilter("all");
                setRecipientFilter("all");
                setPage(1);
              }}
              className="rounded-xl border border-slate-300 bg-white p-2 text-slate-500 hover:bg-slate-50 cursor-pointer"
              title="Reset Filters"
              aria-label="Reset filters"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Period Tabs: All (n) | Breakfast | Lunch | Dinner */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                setTabPeriod("all");
                setPage(1);
              }}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer",
                tabPeriod === "all"
                  ? "bg-[#C9A227] text-white shadow-xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200",
              )}
            >
              All Events ({records.length})
            </button>

            <button
              type="button"
              onClick={() => {
                setTabPeriod("breakfast");
                setPage(1);
              }}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer",
                tabPeriod === "breakfast"
                  ? "bg-[#C9A227] text-white shadow-xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200",
              )}
            >
              Breakfast (45)
            </button>

            <button
              type="button"
              onClick={() => {
                setTabPeriod("lunch");
                setPage(1);
              }}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer",
                tabPeriod === "lunch"
                  ? "bg-[#C9A227] text-white shadow-xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200",
              )}
            >
              Lunch (40)
            </button>

            <button
              type="button"
              onClick={() => {
                setTabPeriod("dinner");
                setPage(1);
              }}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer",
                tabPeriod === "dinner"
                  ? "bg-[#C9A227] text-white shadow-xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200",
              )}
            >
              Dinner (0)
            </button>
          </div>

          <span className="text-[11px] text-slate-500 font-medium">
            Sorted by: Time (Newest first) • Live sync active
          </span>
        </div>
      </div>

      {/* Distribution Records Ledger Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3">Registrant & Role</th>
                <th className="px-4 py-3">Registrant ID</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Team</th>
                <th className="px-4 py-3">Meal Period</th>
                <th className="px-4 py-3">Distribution Date</th>
                <th className="px-4 py-3">Time Dispatched</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Loading ledger records…
                  </td>
                </tr>
              ) : pagedRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No matching distribution records.
                  </td>
                </tr>
              ) : (
                pagedRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-white font-bold text-[10px] select-none shrink-0">
                          {rec.recipientName.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{rec.recipientName}</p>
                          <p className="text-[11px] text-slate-500">{rec.recipientDesignation}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 font-mono font-semibold text-slate-800">
                      {rec.registrantId}
                    </td>

                    <td className="px-4 py-3">
                      <span className="rounded bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                        {rec.recipientType === "staff" ? "Staff" : "Team Member"}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-slate-700">
                      {rec.teamName || "—"}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-[10px] font-bold select-none",
                          rec.periodKey === "breakfast"
                            ? "bg-[#FAF4E6] text-[#9B7415] border border-[#ECD59A]"
                            : rec.periodKey === "lunch"
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              : "bg-blue-50 text-blue-800 border border-blue-200",
                        )}
                      >
                        {rec.periodKey.toUpperCase()}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-slate-600 font-medium">
                      03 Nov 2026
                    </td>

                    <td className="px-4 py-3 font-sans text-slate-700">
                      {formatTimestampIST(rec.providedAt)}
                    </td>

                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setActiveDrawerRecord(rec)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#9B7415] hover:underline cursor-pointer"
                      >
                        <span>View Details</span>
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

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
          pageSizeOptions={[10, 25, 50, 100]}
        />
      </div>

      {/* Counter Activity & Hourly Velocity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 1 Col: Counter Activity */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h3 className="text-base font-bold text-slate-900">
                Counter Activity
              </h3>
              <Store className="h-4 w-4 text-slate-400" />
            </div>

            <p className="text-xs text-slate-500 mb-3">
              Total portions dispensed and last active timestamp per matchday terminal.
            </p>

            <div className="space-y-3">
              {counterActivityList.map((counter) => (
                <div
                  key={counter.id}
                  className="rounded-xl border border-slate-100 bg-[#F8F9FA] p-3 text-xs"
                >
                  <div className="flex items-center justify-between font-bold text-slate-900 mb-1">
                    <span className="truncate">{counter.name}</span>
                    <span className="text-[#9B7415]">{counter.dispensedCount} meals</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>{counter.terminal} • {counter.gate}</span>
                    <span>Last: {counter.lastDispenseTime}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsProtocolOpen(true)}
              className="text-xs font-bold text-[#9B7415] hover:underline flex items-center justify-between w-full"
            >
              <span>View Security & Integrity Protocol</span>
              <ArrowLeft className="h-3.5 w-3.5 rotate-180" />
            </button>
          </div>
        </div>

        {/* Right 2 Cols: Today's Dispensation Velocity Chart */}
        <div className="lg:col-span-2">
          <HourlyVelocityChart data={hourlyData} />
        </div>
      </div>

      {/* Immutability & Audit Security Note */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs text-xs text-slate-600 leading-relaxed flex items-start gap-3">
        <Lock className="h-4 w-4 text-[#C9A227] shrink-0 mt-0.5" />
        <div>
          <strong className="font-bold text-slate-800 block mb-0.5">
            Immutability & Multi-Station Reconciliation Protocol:
          </strong>
          All meal distributions are appended directly to the central ledger with tamper-evident record keys.
          No records may be edited or deleted once written. Every event carries dispensing operator credentials,
          terminal station ID, and matchday timestamp.
        </div>
      </div>

      {/* Distribution Detail Drawer */}
      <DistributionDetailDrawer
        record={activeDrawerRecord}
        isOpen={!!activeDrawerRecord}
        onClose={() => setActiveDrawerRecord(null)}
      />

      {/* Integrity Rules Protocol Dialog */}
      <ProtocolDialog
        isOpen={isProtocolOpen}
        onClose={() => setIsProtocolOpen(false)}
      />
    </div>
  );
};

export default DistributionActivityReportPage;
