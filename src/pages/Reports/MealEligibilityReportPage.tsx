import React, { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  DataTable,
  type ColumnDef,
  Select,
  Pagination,
  StatCard,
  StatusPill,
  Avatar,
  ProgressBar,
} from "@/components/ui";
import {
  ReportPageShell,
  ReportStatGrid,
  ReportFilterBar,
  ExportMenu,
  MealAccessPill,
  ReportCardList,
  RegistrantDetailsHost,
  BatchPrintModal,
} from "@/components/reports";
import {
  useMealEligibilityReportSummary,
  useMealEligibilityReportRows,
  useReportExport,
} from "@/hooks/useReports";
import { useReportFilters } from "@/hooks/useReportFilters";
import { usePermissions } from "@/hooks/usePermissions";
import { reportsApi } from "@/api/reports.api";
import { LEAGUE_OPTIONS } from "@/constants/status";
import {
  UtensilsCrossed,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Printer,
  ArrowUpDown,
  Info,
} from "lucide-react";
import type { MealEligibilityReportRow } from "@/types/reports.types";

export const MealEligibilityReportPage: React.FC = () => {
  const {
    filters,
    rawSearch,
    setSearch,
    from,
    to,
    setDateRange,
    league,
    setLeague,
    teamId,
    type,
    setType,
    eligibility,
    setEligibility,
    sortBy,
    sortOrder,
    setSort,
    setPage,
    setPageSize,
    resetFilters,
    isFiltered,
    activeFilterCount,
  } = useReportFilters();

  const [, setSearchParams] = useSearchParams();
  const { can } = usePermissions();
  const [isBatchPrintOpen, setIsBatchPrintOpen] = useState(false);

  const { data: summary, isLoading: isSummaryLoading, refetch: refetchSummary } =
    useMealEligibilityReportSummary(filters);
  const { data: rowsData, isLoading: isRowsLoading, refetch: refetchRows } =
    useMealEligibilityReportRows(filters);

  const handleRefresh = () => {
    refetchSummary();
    refetchRows();
  };

  const handleOpenRegistrant = (id: string) => {
    if (!can("registrations", "view")) return;
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("registrant", id);
      return next;
    });
  };

  // Export Hook
  const { isExporting, toast, handleExport } = useReportExport<MealEligibilityReportRow>({
    key: "meal-eligibility",
    slug: "meal-eligibility-report",
    sheetTitle: "Meal Eligibility Manifest",
    columns: [
      { header: "Registrant ID", key: "registrantId", accessor: (r) => r.formattedId },
      { header: "Name", key: "name", accessor: (r) => r.name },
      { header: "Type", key: "type", accessor: (r) => r.type },
      { header: "Team", key: "teamName", accessor: (r) => r.teamName },
      { header: "Role", key: "role", accessor: (r) => r.roleWithDesignation },
      { header: "Phone", key: "phone", accessor: (r) => r.phone },
      { header: "Approval Status", key: "approvalStatus", accessor: (r) => r.approvalStatus },
      { header: "Team Status", key: "teamStatus", accessor: (r) => r.teamStatus },
      { header: "Meal Access Status", key: "mealAccess", accessor: (r) => r.reasonLabel },
      { header: "Eligible For Gate Access", key: "isEligible", accessor: (r) => (r.isEligible ? "YES" : "NO") },
    ],
    fetchAllRows: async (appliedFilters) => {
      const res = await reportsApi.getMealEligibilityRows({
        ...appliedFilters,
        pageSize: 5000,
      });
      return res.data;
    },
  });

  const toggleSort = (colKey: string) => {
    if (sortBy === colKey) {
      setSort(colKey, sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSort(colKey, "asc");
    }
  };

  const columns: ColumnDef<MealEligibilityReportRow>[] = [
    {
      key: "registrantId",
      header: (
        <button
          type="button"
          onClick={() => toggleSort("registrantId")}
          className="inline-flex items-center gap-1 hover:text-slate-900 cursor-pointer"
        >
          <span>Registrant ID</span>
          <ArrowUpDown className="h-3 w-3 text-slate-400" />
        </button>
      ),
      render: (row) => (
        <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
          {row.formattedId}
        </span>
      ),
    },
    {
      key: "name",
      header: (
        <button
          type="button"
          onClick={() => toggleSort("name")}
          className="inline-flex items-center gap-1 hover:text-slate-900 cursor-pointer"
        >
          <span>Registrant</span>
          <ArrowUpDown className="h-3 w-3 text-slate-400" />
        </button>
      ),
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <Avatar name={row.name} src={row.avatarUrl} size="sm" />
          <div className="min-w-0">
            {can("registrations", "view") ? (
              <button
                type="button"
                onClick={() => handleOpenRegistrant(row.id)}
                className="font-bold text-slate-900 hover:text-[#9B7415] hover:underline cursor-pointer text-left truncate text-xs"
              >
                {row.name}
              </button>
            ) : (
              <span className="font-bold text-slate-900 truncate text-xs">{row.name}</span>
            )}
            <p className="text-[11px] text-slate-500 font-medium truncate">
              {row.email}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "teamName",
      header: "Team",
      render: (row) =>
        row.teamId ? (
          <Link
            to={`/registrations/teams/${row.teamId}`}
            className="font-medium text-slate-800 hover:text-[#9B7415] hover:underline text-xs"
          >
            {row.teamName}
          </Link>
        ) : (
          <span className="text-slate-400 text-xs">—</span>
        ),
    },
    {
      key: "roleWithDesignation",
      header: "Role",
      render: (row) => (
        <span className="text-xs text-slate-700 font-medium">{row.roleWithDesignation}</span>
      ),
    },
    {
      key: "phone",
      header: "Phone",
      render: (row) => (
        <span className="text-xs text-slate-700 whitespace-nowrap">{row.phone}</span>
      ),
    },
    {
      key: "approvalStatus",
      header: (
        <button
          type="button"
          onClick={() => toggleSort("approvalStatus")}
          className="inline-flex items-center gap-1 hover:text-slate-900 cursor-pointer"
        >
          <span>Approval</span>
          <ArrowUpDown className="h-3 w-3 text-slate-400" />
        </button>
      ),
      render: (row) => <StatusPill status={row.approvalStatus} size="sm" />,
    },
    {
      key: "teamStatus",
      header: "Team Status",
      render: (row) =>
        row.teamStatus === "N/A" ? (
          <span className="text-slate-400 text-xs font-mono">N/A</span>
        ) : (
          <StatusPill status={row.teamStatus} size="sm" />
        ),
    },
    {
      key: "mealAccessReason",
      header: "Meal Access",
      render: (row) => <MealAccessPill reason={row.mealAccessReason} />,
    },
  ];

  const rows = rowsData?.data ?? [];
  const pagination = rowsData?.pagination;
  const eligibleCount = summary?.currentlyEligible ?? 0;

  // Plain-language scope description
  const scopeSummary = React.useMemo(() => {
    const parts: string[] = [];
    if (type && type !== "ALL") parts.push(`Type: ${type}`);
    if (league && league !== "ALL") parts.push(`League: ${league}`);
    if (teamId && teamId !== "ALL") parts.push(`Team: ${teamId}`);
    if (eligibility && eligibility !== "ALL") parts.push(`Access: ${eligibility}`);
    if (from && to) parts.push(`Date: ${from} to ${to}`);
    return parts.length > 0 ? parts.join(" • ") : "All Registrations across Active Leagues & Logistics Pools";
  }, [type, league, teamId, eligibility, from, to]);

  return (
    <ReportPageShell
      title="Meal Eligibility Report"
      description="Identify registrants who are currently authorized to claim hospitality vouchers and dining service gates across active venue hubs."
      generatedAt={summary?.generatedAt}
      onRefresh={handleRefresh}
      isRefreshing={isRowsLoading || isSummaryLoading}
      exportAction={
        <ExportMenu
          onExport={(fmt) => handleExport(fmt, filters)}
          isExporting={isExporting}
          totalRecords={pagination?.total ?? rows.length}
        />
      }
    >
      {/* Toast Announcement */}
      {toast && (
        <div
          role={toast.type === "error" ? "alert" : "status"}
          className={`mb-4 p-3 rounded-xl border text-xs flex items-center justify-between animate-in fade-in ${
            toast.type === "error"
              ? "bg-rose-50 text-rose-800 border-rose-200"
              : "bg-emerald-50 text-emerald-800 border-emerald-200"
          }`}
        >
          <span>{toast.message}</span>
        </div>
      )}

      {/* 4 Stat Cards */}
      <ReportStatGrid
        isFiltered={isFiltered}
        activeFilterCount={activeFilterCount}
        columns={4}
      >
        <StatCard
          title="Total Pool"
          value={isSummaryLoading ? "..." : (summary?.totalPool ?? 766)}
          subtitle="Registered tournament roster"
          icon={<UtensilsCrossed className="h-5 w-5 text-slate-400" />}
        />

        {/* Currently Eligible Card */}
        <div className="rounded-xl border border-[#ECD59A] bg-[#FAF4E6]/50 p-5 shadow-xs transition-shadow hover:shadow-subtle">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-[#7D5C13]">
              Currently Eligible
            </p>
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <h3 className="text-2xl font-bold tracking-tight text-[#7D5C13] font-mono">
              {isSummaryLoading ? "..." : (summary?.currentlyEligible ?? 514)}
            </h3>
            <span className="rounded-full bg-[#ECD59A] px-2 py-0.5 text-[11px] font-bold text-[#644813]">
              {summary?.eligiblePct ?? 67.1}% of pool
            </span>
          </div>
          <div className="mt-3">
            <ProgressBar value={summary?.eligiblePct ?? 67.1} color="gold" size="sm" />
          </div>
          <p className="mt-2 text-xs text-[#9B7415] font-medium">
            Active QR code & catering access granted
          </p>
        </div>

        {/* Ineligible: Team Inactive */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition-shadow hover:shadow-subtle">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Ineligible: Team Inactive
            </p>
            <AlertTriangle className="h-5 w-5 text-amber-500" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <h3 className="text-2xl font-bold tracking-tight text-slate-900 font-mono">
              {isSummaryLoading ? "..." : (summary?.ineligibleTeamInactive ?? 71)}
            </h3>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
              Inactive franchise
            </span>
          </div>
          <div className="mt-3 h-2 rounded-full bg-slate-200" />
          <p className="mt-2 text-xs text-slate-500">
            Approved members withheld due to team inactive status
          </p>
        </div>

        {/* Ineligible: Unapproved */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition-shadow hover:shadow-subtle">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Ineligible: Unapproved
            </p>
            <XCircle className="h-5 w-5 text-rose-500" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <h3 className="text-2xl font-bold tracking-tight text-slate-900 font-mono">
              {isSummaryLoading ? "..." : (summary?.ineligibleUnapproved ?? 175)}
            </h3>
            <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700">
              Pending / Rejected
            </span>
          </div>
          <div className="mt-3 h-2 rounded-full bg-rose-300" />
          <p className="mt-2 text-xs text-slate-500">
            Unverified credentials or rejected applications
          </p>
        </div>
      </ReportStatGrid>

      {/* Quiet Reconciliation Notice */}
      {summary && summary.manuallyDisabled > 0 && (
        <div className="flex items-center gap-2 text-xs text-slate-500 px-1 -mt-3 mb-5">
          <Info className="h-3.5 w-3.5 text-slate-400" />
          <span>
            Also excluded from catering gates:{" "}
            <strong className="font-semibold text-slate-700">
              {summary.manuallyDisabled} verified attendees
            </strong>{" "}
            with meal pass manually disabled.
          </span>
        </div>
      )}

      {/* Filter Bar */}
      <ReportFilterBar
        search={rawSearch}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name, ID, or team…"
        hasDateRange={true}
        fromDate={from}
        toDate={to}
        onDateRangeChange={setDateRange}
        onReset={resetFilters}
        isFiltered={isFiltered}
        activeFilterCount={activeFilterCount}
      >
        <Select
          options={[
            { label: "All Types", value: "ALL" },
            { label: "Team Member", value: "TEAM" },
            { label: "Staff", value: "STAFF" },
            { label: "Organizer", value: "ORGANIZER" },
          ]}
          value={type || "ALL"}
          onChange={(e) => setType(e.target.value)}
        />

        {type === "TEAM" || type === "ALL" ? (
          <Select
            options={LEAGUE_OPTIONS}
            value={league || "ALL"}
            onChange={(e) => setLeague(e.target.value)}
          />
        ) : null}

        <Select
          options={[
            { label: "All Eligibility", value: "ALL" },
            { label: "Eligible (Active Access)", value: "eligible" },
            { label: "Not eligible – team inactive", value: "team_inactive" },
            { label: "Not eligible – unapproved", value: "unapproved" },
            { label: "Not eligible – access disabled", value: "access_disabled" },
          ]}
          value={eligibility || "ALL"}
          onChange={(e) => setEligibility(e.target.value)}
        />
      </ReportFilterBar>

      {/* Active Scope Line */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1 mb-3">
        <div>
          <span className="font-semibold text-slate-700">Active scope: </span>
          <span>{scopeSummary}</span>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block">
        <DataTable
          columns={columns}
          data={rows}
          isLoading={isRowsLoading}
          emptyTitle="No Attendees Found"
          emptyDescription="No attendees match the selected eligibility criteria or team filters."
          onEmptyAction={resetFilters}
          emptyActionLabel="Reset Filters"
          getId={(r) => r.id}
        />
      </div>

      {/* Mobile Card List View (<768px) */}
      <ReportCardList
        data={rows}
        isLoading={isRowsLoading}
        onClearFilters={resetFilters}
        emptyTitle="No Attendees Found"
        emptyDescription="No attendees match the selected filters."
        renderCard={(row) => (
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <Avatar name={row.name} src={row.avatarUrl} size="sm" />
                <div>
                  {can("registrations", "view") ? (
                    <button
                      type="button"
                      onClick={() => handleOpenRegistrant(row.id)}
                      className="font-bold text-slate-900 hover:text-[#9B7415] text-left text-xs"
                    >
                      {row.name}
                    </button>
                  ) : (
                    <span className="font-bold text-slate-900 text-xs">{row.name}</span>
                  )}
                  <p className="font-mono text-[10px] text-slate-400">{row.formattedId}</p>
                </div>
              </div>
              <MealAccessPill reason={row.mealAccessReason} />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Team</span>
                <span className="font-medium text-slate-800">{row.teamName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Role</span>
                <span className="text-slate-700 truncate block">{row.roleWithDesignation}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Approval</span>
                <StatusPill status={row.approvalStatus} size="sm" />
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Team Status</span>
                {row.teamStatus === "N/A" ? (
                  <span className="text-slate-400 font-mono">N/A</span>
                ) : (
                  <StatusPill status={row.teamStatus} size="sm" />
                )}
              </div>
            </div>
          </div>
        )}
      />

      {/* Pagination & Batch Print Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 pt-2">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsBatchPrintOpen(true)}
            disabled={eligibleCount === 0}
            className={`inline-flex items-center gap-1.5 text-xs font-semibold cursor-pointer ${
              eligibleCount === 0
                ? "text-slate-400 cursor-not-allowed"
                : "text-[#9B7415] hover:text-[#7D5C13] hover:underline"
            }`}
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Batch print catering tokens ({eligibleCount} eligible)</span>
          </button>
        </div>

        {pagination && (
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            totalItems={pagination.total}
            pageSize={pagination.pageSize}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        )}
      </div>

      {/* Batch Print Modal */}
      <BatchPrintModal
        isOpen={isBatchPrintOpen}
        onClose={() => setIsBatchPrintOpen(false)}
        eligibleCount={eligibleCount}
        filters={filters}
      />

      {/* Registrant Review Drawer Host */}
      <RegistrantDetailsHost />
    </ReportPageShell>
  );
};

export default MealEligibilityReportPage;

