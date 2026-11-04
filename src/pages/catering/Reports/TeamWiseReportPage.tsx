import React, { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Printer,
  Lock,
  ArrowLeft,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Pagination } from "@/components/ui/Pagination";
import { ExportMenu } from "@/components/reports/ExportMenu";
import { TeamTile } from "@/components/reports/TeamTile";
import { useTeamMealReport } from "@/hooks/useCatering";
import { exportCateringReport } from "@/api/catering.api";
import { TOURNAMENT_TEAMS } from "@/constants/catering";
import { ROUTES, buildCateringRegistrantRoute } from "@/constants/routes";
import { cn } from "@/utils/cn";

export const TeamWiseReportPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const teamIdParam = searchParams.get("teamId") || "chennai-kings";

  const [selectedTeamId, setSelectedTeamId] = useState(teamIdParam);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isExporting, setIsExporting] = useState(false);

  const { data } = useTeamMealReport(selectedTeamId, "2026-11-03");

  const summary = data?.summary || {
    teamId: selectedTeamId,
    teamName: "Chennai Kings",
    letterCode: "A",
    eligibleCount: 25,
    mealsProvidedCount: 18,
    distributionRatePercent: 72,
    activatedDate: "Today, 03 Nov 2026",
    activatedBy: "Alex Morgan (Event Admin)",
    periods: [
      { key: "breakfast", label: "Breakfast", range: "07:00 AM – 10:00 AM", state: "closed" as const, count: 10 },
      { key: "lunch", label: "Lunch", range: "12:00 PM – 03:00 PM", state: "live" as const, count: 8 },
      { key: "dinner", label: "Dinner", range: "07:00 PM – 10:00 PM", state: "upcoming" as const, count: 0 },
    ],
  };

  const roster = data?.roster || [];

  const filteredRoster = search.trim()
    ? roster.filter(
        (m) =>
          m.fullName.toLowerCase().includes(search.toLowerCase()) ||
          m.registrantCode.toLowerCase().includes(search.toLowerCase()),
      )
    : roster;

  const start = (page - 1) * pageSize;
  const pagedRoster = filteredRoster.slice(start, start + pageSize);

  const handlePrint = () => {
    window.print();
  };

  const handleExport = async (format: "csv" | "xlsx") => {
    setIsExporting(true);
    try {
      const blob = await exportCateringReport(`team_${selectedTeamId}`, format, {
        date: "2026-11-03",
        teamId: selectedTeamId,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `meal-tracker_team_${selectedTeamId}_season-2026_2026-11-03.${format}`;
      a.click();
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Print-specific style block */}
      <style>{`
        @media print {
          aside, header, nav, .no-print {
            display: none !important;
          }
          body, main {
            background: white !important;
            padding: 0 !important;
            overflow: visible !important;
          }
          .print-full-width {
            width: 100% !important;
            max-width: 100% !important;
          }
        }
      `}</style>

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-1 border-b border-slate-200 gap-3 no-print">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-[clamp(24px,2vw+16px,32px)] font-bold tracking-tight text-slate-900 leading-[1.25]">
              Team-wise Meal Distribution
            </h1>
            <span className="rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-xs font-bold text-slate-700">
              LIVE LEDGER
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-600 leading-relaxed">
            Individual participant meal logs and window fulfilment by matchday cricket team.
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

          <Button
            variant="outline"
            size="md"
            onClick={handlePrint}
            className="rounded-xl text-xs"
            leftIcon={<Printer className="h-4 w-4" />}
          >
            Print Roster
          </Button>

          <ExportMenu
            onExport={handleExport}
            isExporting={isExporting}
            totalRecords={summary.mealsProvidedCount}
          />
        </div>
      </div>

      {/* Filter Row: Select Team & Search */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs no-print">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Select Team:
            </label>
            <select
              value={selectedTeamId}
              onChange={(e) => {
                setSelectedTeamId(e.target.value);
                setSearchParams({ teamId: e.target.value });
                setPage(1);
              }}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 cursor-pointer"
            >
              {TOURNAMENT_TEAMS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} (Team {t.letterCode})
                </option>
              ))}
            </select>
          </div>

          <div className="relative max-w-sm flex-1">
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search athlete by name or ID…"
              className="w-full text-xs"
            />
          </div>
        </div>
      </div>

      {/* Roster Status Profile Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <TeamTile
              name={summary.teamName}
              code={summary.letterCode}
              size="lg"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 leading-tight">
                  {summary.teamName}
                </h3>
                <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                  Activated by Event Admin
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Karnataka State Premier League • {summary.activatedDate} • {summary.activatedBy}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
            <div className="text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Eligible Registrants
              </span>
              <span className="text-base font-bold text-slate-900">
                {summary.eligibleCount} approved
              </span>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div className="text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Meals Provided Today
              </span>
              <span className="text-base font-bold text-[#9B7415]">
                {summary.mealsProvidedCount} dispensed
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Service Window Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {summary.periods.map((p) => {
          const isLive = p.state === "live";
          const isClosed = p.state === "closed";

          return (
            <div
              key={p.key}
              className={cn(
                "rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between space-y-3",
                isLive && "border-t-4 border-t-[#C9A227] shadow-sm",
                isClosed && "border-t-4 border-t-slate-400",
              )}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">
                  {p.label}
                </span>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-bold select-none",
                    isLive
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : isClosed
                        ? "bg-slate-100 text-slate-700 border border-slate-200"
                        : "bg-amber-50 text-amber-800 border border-amber-200",
                  )}
                >
                  {isLive ? "ACTIVE NOW" : isClosed ? "CLOSED" : "UPCOMING"}
                </span>
              </div>

              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {p.count} meals
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">{p.range}</p>
              </div>

              <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                {isClosed && "Window completed cleanly"}
                {isLive && "Dispensation in progress"}
                {!isLive && !isClosed && "Scheduled tonight"}
              </div>
            </div>
          );
        })}
      </div>

      {/* Registrant Distribution Roster Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900">
              {summary.teamName} Registrant Distribution Roster
            </h3>
            <span className="rounded-full bg-slate-200/80 px-2 py-0.5 text-[10px] font-bold text-slate-700">
              {summary.eligibleCount} Registrants
            </span>
          </div>

          <span className="text-[11px] text-slate-400 font-medium">
            Sorted by: ID (Ascending)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3">Registrant ID</th>
                <th className="px-4 py-3">Name & Role</th>
                <th className="px-4 py-3">Member Type</th>
                <th className="px-4 py-3 text-center">Breakfast</th>
                <th className="px-4 py-3 text-center">Lunch</th>
                <th className="px-4 py-3 text-center">Dinner</th>
                <th className="px-4 py-3 text-center">Total Meals</th>
                <th className="px-4 py-3 text-right no-print">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {pagedRoster.map((member) => (
                <tr key={member.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-slate-800">
                    {member.registrantCode}
                  </td>

                  <td className="px-4 py-3">
                    <p className="font-bold text-slate-900">{member.fullName}</p>
                    <p className="text-[11px] text-slate-500">{member.designation}</p>
                  </td>

                  <td className="px-4 py-3">
                    <span className="rounded bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                      {member.memberType}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-center">
                    {member.meals.breakfast.state === "provided" ? (
                      <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                        Provided • 08:45 AM
                      </span>
                    ) : (
                      <span className="text-slate-400 font-mono">—</span>
                    )}
                  </td>

                  <td className="px-4 py-3 text-center">
                    {member.meals.lunch.state === "provided" ? (
                      <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                        Provided • 12:45 PM
                      </span>
                    ) : (
                      <span className="text-slate-400 font-mono">—</span>
                    )}
                  </td>

                  <td className="px-4 py-3 text-center">
                    <span className="text-slate-400 font-mono">—</span>
                  </td>

                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#FAF4E6] border border-[#ECD59A] text-[#9B7415] font-bold text-xs">
                      {member.totalMealsProvided}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-right no-print">
                    <Link
                      to={buildCateringRegistrantRoute(member.registrantCode || member.registrantId)}
                      className="inline-flex items-center gap-1 font-semibold text-[#9B7415] hover:underline"
                    >
                      <span>View Details</span>
                      <Eye className="h-3 w-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Contrast Compliant Audit Protocol Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center gap-2 text-[11px] text-slate-600">
          <Lock className="h-3.5 w-3.5 text-slate-500 shrink-0" />
          <span>
            Team Roster Integrity: Individual portions recorded live against matchday team allocations.
            All records verified by operator session tokens.
          </span>
        </div>

        <div className="no-print">
          <Pagination
            currentPage={page}
            totalPages={Math.ceil(filteredRoster.length / pageSize) || 1}
            totalItems={filteredRoster.length}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setPage(1);
            }}
            pageSizeOptions={[10, 25, 50]}
          />
        </div>
      </div>
    </div>
  );
};

export default TeamWiseReportPage;
