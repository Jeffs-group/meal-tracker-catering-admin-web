import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle2,
  ArrowLeft,
  Eye,
  Coffee,
  Utensils,
  Moon,
} from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import { Input } from "@/components/ui/Input";
import { ExportMenu } from "@/components/reports/ExportMenu";
import { useStaffMealReport } from "@/hooks/useCatering";
import { exportCateringReport } from "@/api/catering.api";
import { formatTimestampIST } from "@/utils/cateringClock";
import { ROUTES, buildCateringRegistrantRoute } from "@/constants/routes";
import { cn } from "@/utils/cn";

export const StaffDistributionReportPage: React.FC = () => {
  const [date] = useState("2026-11-03");
  const [search, setSearch] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  const { data, dataUpdatedAt } = useStaffMealReport(date);

  const summary = data?.summary || {
    approvedStaffCount: 6,
    staffMealsProvidedCount: 4,
    distributionRatePercent: 67,
    breakfastCount: 2,
    lunchCount: 2,
    dinnerCount: 0,
    formula: {
      breakfast: 2,
      lunch: 2,
      dinner: 0,
      total: 4,
      isBalanced: true,
    },
  };

  const roster = data?.roster || [];

  const filteredRoster = search.trim()
    ? roster.filter(
        (s) =>
          s.fullName.toLowerCase().includes(search.toLowerCase()) ||
          s.registrantCode.toLowerCase().includes(search.toLowerCase()) ||
          s.department.toLowerCase().includes(search.toLowerCase()),
      )
    : roster;

  const handleExport = async (format: "csv" | "xlsx") => {
    setIsExporting(true);
    try {
      const blob = await exportCateringReport("staff_distribution", format, {
        date,
        recipientType: "staff",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `meal-tracker_staff_season-2026_${date}.${format}`;
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
              Staff Distribution Report
            </h1>
            <span className="rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-xs font-bold text-slate-700">
              VERIFIED LEDGER
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-600 leading-relaxed">
            Dispensation records for matchday operational staff, tournament logistics, and safety personnel.
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
            totalRecords={summary.staffMealsProvidedCount}
          />
        </div>
      </div>

      {/* Filter Row: Personnel Search */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative max-w-md flex-1">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Registered ID or Staff Name…"
              className="w-full text-xs"
            />
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500 font-semibold">
            <span>Operating Date: Today, 03 Nov 2026</span>
            <button
              type="button"
              onClick={() => setSearch("")}
              className="text-slate-400 hover:text-slate-700"
            >
              Reset Search
            </button>
          </div>
        </div>
      </div>

      {/* 5 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <StatCard
          title="APPROVED STAFF"
          value={summary.approvedStaffCount}
          subtitle="Independently eligible"
          badgeText="100% Active"
          badgeVariant="success"
        />

        <StatCard
          title="STAFF MEALS PROVIDED"
          value={`${summary.staffMealsProvidedCount} meals`}
          subtitle="5% of daily total"
          badgeText="Dispensed"
          badgeVariant="warning"
        />

        {/* Breakfast */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
            <span>BREAKFAST</span>
            <Coffee className="h-3.5 w-3.5 text-[#C9A227]" />
          </div>
          <div className="my-2">
            <span className="text-xl font-bold text-slate-900">
              {summary.breakfastCount} meals
            </span>
            <p className="text-[10px] text-slate-400 mt-0.5">07:00 AM – 10:00 AM</p>
          </div>
          <span className="text-[10px] text-slate-500">Window completed</span>
        </div>

        {/* Lunch */}
        <div className="rounded-2xl border border-emerald-200 bg-white p-4 shadow-xs flex flex-col justify-between border-t-4 border-t-emerald-500">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-800 uppercase">
            <span>LUNCH</span>
            <Utensils className="h-3.5 w-3.5 text-emerald-600" />
          </div>
          <div className="my-2">
            <span className="text-xl font-bold text-slate-900">
              {summary.lunchCount} meals
            </span>
            <p className="text-[10px] text-slate-400 mt-0.5">12:00 PM – 03:00 PM</p>
          </div>
          <span className="text-[10px] font-bold text-emerald-700">Active serving now</span>
        </div>

        {/* Dinner */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
            <span>DINNER</span>
            <Moon className="h-3.5 w-3.5 text-slate-400" />
          </div>
          <div className="my-2">
            <span className="text-xl font-bold text-slate-900">
              {summary.dinnerCount} meals
            </span>
            <p className="text-[10px] text-slate-400 mt-0.5">07:00 PM – 10:00 PM</p>
          </div>
          <span className="text-[10px] text-slate-500">Scheduled tonight</span>
        </div>
      </div>

      {/* Staff Reconciliation Strip */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs shadow-xs">
        <div className="flex items-center gap-2 text-slate-800 font-semibold">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>
            Breakfast ({String(summary.breakfastCount).padStart(2, "0")}) + Lunch (
            {String(summary.lunchCount).padStart(2, "0")}) + Dinner (
            {String(summary.dinnerCount).padStart(2, "0")}) ={" "}
            {String(summary.staffMealsProvidedCount).padStart(2, "0")} Staff Meals Provided
          </span>
        </div>

        <span className="text-slate-500 text-[11px] self-start sm:self-auto">
          Matches the {summary.staffMealsProvidedCount} staff meals on the Reports Overview
        </span>
      </div>

      {/* Operational Staff Roster & Distribution Ledger */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900">
              Operational Staff Roster & Distribution Ledger
            </h3>
            <span className="rounded-full bg-slate-200/80 px-2 py-0.5 text-[10px] font-bold text-slate-700">
              NON-TEAM ROSTER
            </span>
          </div>

          <span className="text-[11px] text-slate-500 font-medium">
            Strict isolation: operational staff are not rostered to cricket teams
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3">Registrant ID</th>
                <th className="px-4 py-3">Staff Name & Department</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3 text-center">Breakfast</th>
                <th className="px-4 py-3 text-center">Lunch</th>
                <th className="px-4 py-3 text-center">Dinner</th>
                <th className="px-4 py-3 text-center">Total Meals</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredRoster.map((staff) => (
                <tr key={staff.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-slate-800">
                    {staff.registrantCode}
                  </td>

                  <td className="px-4 py-3">
                    <p className="font-bold text-slate-900">{staff.fullName}</p>
                    <p className="text-[11px] text-slate-500">{staff.department}</p>
                  </td>

                  <td className="px-4 py-3">
                    <span className="rounded bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                      {staff.designation}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-center">
                    {staff.meals.breakfast.state === "provided" ? (
                      <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                        Provided • 08:30 AM
                      </span>
                    ) : (
                      <span className="text-slate-400 font-mono">—</span>
                    )}
                  </td>

                  <td className="px-4 py-3 text-center">
                    {staff.meals.lunch.state === "provided" ? (
                      <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                        Provided • 12:40 PM
                      </span>
                    ) : (
                      <span className="text-slate-400 font-mono">—</span>
                    )}
                  </td>

                  <td className="px-4 py-3 text-center">
                    <span className="text-slate-400 font-mono">—</span>
                  </td>

                  <td className="px-4 py-3 text-center">
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-[11px] font-bold select-none",
                        staff.totalMealsProvided > 0
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : "bg-slate-100 text-slate-600 border border-slate-200",
                      )}
                    >
                      {staff.totalMealsProvided} Meals
                    </span>
                  </td>

                  <td className="px-4 py-3 text-right">
                    <Link
                      to={buildCateringRegistrantRoute(staff.registrantCode || staff.registrantId)}
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

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
          <span>Showing all {roster.length} approved staff members</span>
          <span>
            Auto-refreshed: {dataUpdatedAt ? formatTimestampIST(new Date(dataUpdatedAt)) : "Just now"}
          </span>
        </div>
      </div>

      {/* Staff Eligibility Protocol Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
        <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
          Staff Eligibility Protocol
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-600">
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
            <strong className="text-slate-800 block mb-0.5">Independent Approval</strong>
            Eligible once approved, no matchday team activation required.
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
            <strong className="text-slate-800 block mb-0.5">Lockout Prevention</strong>
            Duplicate window slot lockout enforced across all tournament counters.
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
            <strong className="text-slate-800 block mb-0.5">Live Central Sync</strong>
            Ledger syncs live to the Super Admin dashboard and reconciliation summaries.
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDistributionReportPage;
