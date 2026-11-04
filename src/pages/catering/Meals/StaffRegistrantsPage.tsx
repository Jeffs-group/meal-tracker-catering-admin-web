import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  QrCode,
  CheckCircle2,
  Clock,
  XCircle,
  ChevronRight,
  Store,
  ArrowRight,
} from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Pagination } from "@/components/ui/Pagination";
import { ScanDialog } from "@/components/catering/ScanDialog";
import { useStaffMealRoster, useMealConfig } from "@/hooks/useCatering";
import { useAuthStore } from "@/stores/authStore";
import { formatCountdown, getPeriodState, formatTimestampIST, getNow } from "@/utils/cateringClock";
import { COUNTERS, DEFAULT_MEALS_CONFIG } from "@/constants/catering";
import { ROUTES, buildCateringRegistrantRoute } from "@/constants/routes";
import { cn } from "@/utils/cn";
import type { MealStatusCell } from "@/types/catering.types";

const getMealStatusCell = (
  meals: Record<string, MealStatusCell | undefined> | undefined,
  periodKey: string,
  index: number,
  periodName?: string,
): MealStatusCell => {
  if (!meals) return { state: "pending" };
  if (meals[periodKey]) return meals[periodKey]!;
  const lowerKey = periodKey.toLowerCase();
  if (meals[lowerKey]) return meals[lowerKey]!;
  if (periodName && meals[periodName.toLowerCase()]) return meals[periodName.toLowerCase()]!;
  const legacyKeys = ["breakfast", "lunch", "dinner", "snack"];
  const legacyKey = legacyKeys[index];
  if (legacyKey && meals[legacyKey]) return meals[legacyKey]!;
  const mealN = `meal${index + 1}`;
  if (meals[mealN]) return meals[mealN]!;
  return { state: "pending" };
};

export const StaffRegistrantsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isScanOpen, setIsScanOpen] = useState(false);

  const { data: rawConfig } = useMealConfig();
  const config = (rawConfig && rawConfig.length > 0) ? rawConfig : DEFAULT_MEALS_CONFIG;
  const now = getNow();

  const currentCounter =
    COUNTERS.find((c) => c.id === user?.currentCounterId) ?? COUNTERS[0]!;

  const livePeriod = config.find((p) => getPeriodState(p, now) === "live");
  const nextPeriod = config.find((p) => getPeriodState(p, now) === "upcoming");

  const { data, isLoading, error, refetch } = useStaffMealRoster({
    search,
    page,
    pageSize,
  });

  const renderStatusPill = (cell: MealStatusCell, periodLabel: string) => {
    if (cell.state === "provided") {
      return (
        <span
          className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800"
          title={cell.providedAt ? `Provided at ${formatTimestampIST(cell.providedAt)} IST` : "Provided"}
        >
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
          <span>Provided</span>
        </span>
      );
    }
    if (cell.state === "not_collected") {
      return (
        <span
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500"
          title={`${periodLabel} window closed without dispensation`}
        >
          <XCircle className="h-3 w-3 text-slate-400" />
          <span>Not collected</span>
        </span>
      );
    }
    return (
      <span
        className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-600"
        title="Scheduled for distribution"
      >
        <Clock className="h-3 w-3 text-slate-400" />
        <span>Pending</span>
      </span>
    );
  };

  const totalStaff = data?.total || 0;
  const providedCount =
    data?.items.reduce((acc, curr) => acc + curr.totalMealsProvided, 0) || 0;

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-500">
        <Link to={ROUTES.CATERING.MEALS} className="hover:text-slate-800 transition-colors">
          Manage Meals
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
        <span className="font-semibold text-slate-800">Operational Staff</span>
      </nav>

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-1 border-b border-slate-200 gap-3">
        <div>
          <h1 className="text-[clamp(24px,2vw+16px,32px)] font-bold tracking-tight text-slate-900 leading-[1.25]">
            Operational Staff – Registrants
          </h1>
          <p className="mt-1 text-sm text-slate-600 leading-relaxed">
            Authorized tournament logistics, safety and medical personnel.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => setIsScanOpen(true)}
          className="rounded-xl bg-[#C9A227] hover:bg-[#B8901E] text-white shadow-xs font-semibold self-start sm:self-auto"
          leftIcon={<QrCode className="h-4 w-4" />}
        >
          Scan QR Code
        </Button>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div>
            <p className="font-bold">Error loading staff roster</p>
            <p className="mt-0.5 text-red-600">
              {(error as Error)?.message || "Failed to retrieve staff meal roster from the server."}
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => refetch()}
            className="self-start sm:self-auto shrink-0 border-red-200 bg-white hover:bg-red-50 text-red-700"
          >
            Retry
          </Button>
        </div>
      )}

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              STAFF ENTITY
            </span>
            <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
              Active Roster
            </span>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 text-white font-bold text-xs select-none shadow-2xs">
              ST
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-slate-900 text-sm truncate">
                Operational Staff
              </h3>
              <p className="text-[11px] text-slate-500 truncate mt-0.5">
                Tournament Personnel
              </p>
            </div>
          </div>
        </div>

        <StatCard
          title="APPROVED STAFF"
          value={totalStaff}
          subtitle="Directly eligible via approval"
          badgeText="Authorized"
          badgeVariant="neutral"
        />

        <StatCard
          title="MEALS PROVIDED TODAY"
          value={`${providedCount} / ${totalStaff}`}
          subtitle={`${Math.round((providedCount / totalStaff) * 100)}% staff fulfilled`}
          progress={{
            value: Math.min(100, Math.round((providedCount / totalStaff) * 100)),
            color: "emerald",
          }}
        />

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              CATERING SESSION
            </span>
            {livePeriod ? (
              <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                {formatCountdown(livePeriod, now)}
              </span>
            ) : nextPeriod ? (
              <span className="rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                Next: {nextPeriod.label}
              </span>
            ) : (
              <span className="rounded-full bg-slate-100 text-slate-600 px-2 py-0.5 text-[10px] font-bold">
                No active window
              </span>
            )}
          </div>
          <div className="mt-3">
            <h3 className="text-sm font-bold text-slate-900 truncate">
              {livePeriod ? `${livePeriod.label} Session` : "Service Closed"}
            </h3>
            <p className="text-[11px] text-slate-500 truncate mt-0.5 flex items-center gap-1">
              <Store className="h-3 w-3 text-slate-400" />
              <span>{currentCounter.name}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Filter Row */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="relative max-w-md">
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by Staff ID, Name or Department…"
            className="w-full text-xs"
          />
        </div>
      </div>

      {/* Staff Table / Mobile Card List */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        {/* Desktop Table (>=768px) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3">Profile</th>
                <th className="px-4 py-3">Staff ID</th>
                <th className="px-4 py-3">Name & Department</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Contact</th>
                {config.map((period) => (
                  <th key={period.key} className="px-4 py-3 text-center">
                    {period.label || period.name}
                  </th>
                ))}
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={6 + config.length} className="py-12 text-center text-slate-400">
                    Loading staff roster…
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6 + config.length} className="py-12 text-center text-red-600">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <p className="font-semibold">Failed to load staff roster</p>
                      <p className="text-xs text-slate-500">
                        {(error as Error)?.message || "Server error occurred while loading staff registrants."}
                      </p>
                      <Button size="sm" variant="outline" onClick={() => refetch()}>
                        Retry
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : data?.items.length === 0 ? (
                <tr>
                  <td colSpan={6 + config.length} className="py-12 text-center text-slate-400">
                    No matching staff members found.
                  </td>
                </tr>
              ) : (
                data?.items.map((staff) => (
                  <tr key={staff.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-white font-bold text-xs select-none">
                        {staff.fullName.slice(0, 2).toUpperCase()}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono font-semibold text-slate-800">
                      {staff.registrantCode}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-bold text-slate-900">{staff.fullName}</p>
                      <p className="text-[11px] text-slate-500">{staff.department}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-md bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                        {staff.designation}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 font-mono text-[11px]">
                      {staff.contactNumber}
                    </td>
                    {config.map((period, pIdx) => {
                      const cell = getMealStatusCell(
                        staff.meals as Record<string, MealStatusCell | undefined>,
                        period.key,
                        pIdx,
                        period.name,
                      );
                      return (
                        <td key={period.key} className="px-4 py-3 text-center">
                          {renderStatusPill(cell, period.label || period.name || "Meal")}
                        </td>
                      );
                    })}
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={buildCateringRegistrantRoute(staff.registrantCode || staff.registrantId)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-[#9B7415] hover:bg-slate-50 hover:border-slate-300 transition-colors"
                      >
                        <span>View Details</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card List (<768px) */}
        <div className="md:hidden divide-y divide-slate-100">
          {isLoading ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              Loading staff roster…
            </div>
          ) : error ? (
            <div className="p-6 text-center text-red-600 text-xs space-y-2">
              <p className="font-semibold">Failed to load staff roster</p>
              <Button size="sm" variant="outline" onClick={() => refetch()}>
                Retry
              </Button>
            </div>
          ) : data?.items.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No matching staff members found.
            </div>
          ) : (
            data?.items.map((staff) => (
              <div key={staff.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-white font-bold text-xs select-none">
                      {staff.fullName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">
                        {staff.fullName}
                      </h4>
                      <p className="font-mono text-[11px] text-slate-500">
                        {staff.registrantCode} • {staff.department}
                      </p>
                    </div>
                  </div>

                  <span className="rounded bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                    {staff.designation}
                  </span>
                </div>

                {/* Status pills inline */}
                <div className={cn("grid gap-2 text-center text-xs", config.length === 4 ? "grid-cols-4" : "grid-cols-3")}>
                  {config.map((period, pIdx) => {
                    const cell = getMealStatusCell(
                      staff.meals as Record<string, MealStatusCell | undefined>,
                      period.key,
                      pIdx,
                      period.name,
                    );
                    return (
                      <div key={period.key}>
                        <span className="text-[10px] text-slate-400 block mb-0.5 truncate">
                          {period.label || period.name}
                        </span>
                        {renderStatusPill(cell, period.label || period.name || "Meal")}
                      </div>
                    );
                  })}
                </div>

              <div className="pt-2 flex justify-end">
                <Link
                  to={buildCateringRegistrantRoute(staff.registrantCode || staff.registrantId)}
                  className="flex items-center justify-center gap-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 py-2 text-xs font-semibold text-[#9B7415]"
                >
                  <span>Dispense Meal / View Status</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          )))}
        </div>

        <Pagination
          currentPage={page}
          totalPages={Math.ceil((data?.total || 1) / pageSize)}
          totalItems={data?.total || 0}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setPage(1);
          }}
          pageSizeOptions={[10, 25, 50]}
        />
      </div>

      <ScanDialog
        isOpen={isScanOpen}
        onClose={() => setIsScanOpen(false)}
        onScanSuccess={(regId) => navigate(buildCateringRegistrantRoute(regId))}
      />
    </div>
  );
};

export default StaffRegistrantsPage;
