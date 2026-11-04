import React from "react";
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
  TypePill,
  ReportCardList,
  RegistrantDetailsHost,
} from "@/components/reports";
import {
  useRegistrationReportSummary,
  useRegistrationReportRows,
  useReportExport,
} from "@/hooks/useReports";
import { useReportFilters } from "@/hooks/useReportFilters";
import { usePermissions } from "@/hooks/usePermissions";
import { reportsApi } from "@/api/reports.api";
import { formatDateShort } from "@/utils/formatDate";
import { LEAGUE_OPTIONS, STATUS_FILTER_OPTIONS } from "@/constants/status";
import { Users, CheckCircle2, Clock, Crown, ArrowUpDown } from "lucide-react";
import type { RegistrationReportRow } from "@/types/reports.types";

export const RegistrationReportPage: React.FC = () => {
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
    setTeamId,
    type,
    setType,
    status,
    setStatus,
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

  const { data: summary, isLoading: isSummaryLoading, refetch: refetchSummary } =
    useRegistrationReportSummary(filters);
  const { data: rowsData, isLoading: isRowsLoading, refetch: refetchRows } =
    useRegistrationReportRows(filters);

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
  const { isExporting, toast, handleExport } = useReportExport<RegistrationReportRow>({
    key: "registration",
    slug: "registration-report",
    sheetTitle: "Registration Directory",
    columns: [
      { header: "Registrant ID", key: "registrantId", accessor: (r) => r.formattedId },
      { header: "Name", key: "name", accessor: (r) => r.name },
      { header: "Designation", key: "designation", accessor: (r) => r.designation || "" },
      { header: "VIP", key: "isVip", accessor: (r) => (r.isVip ? "Yes" : "No") },
      { header: "Type", key: "type", accessor: (r) => r.type },
      { header: "Team", key: "teamName", accessor: (r) => r.teamName },
      { header: "Role", key: "role", accessor: (r) => r.role },
      { header: "Phone", key: "phone", accessor: (r) => r.phone },
      { header: "Email", key: "email", accessor: (r) => r.email },
      { header: "Submitted On", key: "submittedAt", accessor: (r) => r.submittedAt },
      { header: "Status", key: "status", accessor: (r) => r.status },
    ],
    fetchAllRows: async (appliedFilters) => {
      const res = await reportsApi.getRegistrationRows({
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

  const columns: ColumnDef<RegistrationReportRow>[] = [
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
            <div className="flex items-center gap-1.5 flex-wrap">
              {can("registrations", "view") ? (
                <button
                  type="button"
                  onClick={() => handleOpenRegistrant(row.id)}
                  className="font-bold text-slate-900 hover:text-[#9B7415] hover:underline cursor-pointer text-left truncate"
                >
                  {row.name}
                </button>
              ) : (
                <span className="font-bold text-slate-900 truncate">{row.name}</span>
              )}

              {row.isVip && (
                <span className="inline-flex items-center gap-0.5 rounded bg-amber-100 text-amber-900 text-[10px] font-bold px-1.5 py-0.2 shadow-2xs">
                  <Crown className="h-2.5 w-2.5 text-amber-600" /> VIP
                </span>
              )}
            </div>
            {row.designation && (
              <p className="text-[11px] text-slate-500 font-medium truncate">
                {row.designation}
              </p>
            )}
          </div>
        </div>
      ),
    },
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
      key: "type",
      header: "Type",
      render: (row) => <TypePill type={row.type} />,
    },
    {
      key: "teamName",
      header: (
        <button
          type="button"
          onClick={() => toggleSort("teamName")}
          className="inline-flex items-center gap-1 hover:text-slate-900 cursor-pointer"
        >
          <span>Team</span>
          <ArrowUpDown className="h-3 w-3 text-slate-400" />
        </button>
      ),
      render: (row) =>
        row.teamId ? (
          <Link
            to={`/registrations/teams/${row.teamId}`}
            className="font-medium text-slate-800 hover:text-[#9B7415] hover:underline"
          >
            {row.teamName}
          </Link>
        ) : (
          <span className="text-slate-400">—</span>
        ),
    },
    {
      key: "role",
      header: "Role",
      render: (row) => <span className="text-slate-700 text-xs">{row.role}</span>,
    },
    {
      key: "phone",
      header: "Phone",
      render: (row) => (
        <span className="text-xs text-slate-700 whitespace-nowrap">{row.phone}</span>
      ),
    },
    {
      key: "email",
      header: "Email",
      render: (row) => (
        <span className="text-xs text-slate-600 truncate max-w-[160px] inline-block" title={row.email}>
          {row.email}
        </span>
      ),
    },
    {
      key: "submittedAt",
      header: (
        <button
          type="button"
          onClick={() => toggleSort("submittedAt")}
          className="inline-flex items-center gap-1 hover:text-slate-900 cursor-pointer"
        >
          <span>Submitted On</span>
          <ArrowUpDown className="h-3 w-3 text-slate-400" />
        </button>
      ),
      render: (row) => (
        <span className="text-xs text-slate-500 whitespace-nowrap">
          {formatDateShort(row.submittedAt)}
        </span>
      ),
    },
    {
      key: "status",
      header: (
        <button
          type="button"
          onClick={() => toggleSort("status")}
          className="inline-flex items-center gap-1 hover:text-slate-900 cursor-pointer"
        >
          <span>Status</span>
          <ArrowUpDown className="h-3 w-3 text-slate-400" />
        </button>
      ),
      render: (row) => <StatusPill status={row.status} size="sm" />,
    },
  ];

  const rows = rowsData?.data ?? [];
  const pagination = rowsData?.pagination;

  return (
    <ReportPageShell
      title="Registration Report"
      description="Get a consolidated, auditable directory of all candidate registrations received across events and sporting leagues."
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
          <button
            type="button"
            onClick={() => {}}
            className="text-xs underline ml-2 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* 3 Stat Cards */}
      <ReportStatGrid
        isFiltered={isFiltered}
        activeFilterCount={activeFilterCount}
        columns={3}
      >
        <StatCard
          title="Total Submissions"
          value={isSummaryLoading ? "..." : (summary?.totalSubmissions ?? 0)}
          trend={{ value: `+${summary?.periodChangePct ?? 12.5}%`, isPositive: true }}
          subtitle="In selected range"
          icon={<Users className="h-5 w-5 text-slate-400" />}
        />

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition-shadow hover:shadow-subtle">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Approved Registrants
            </p>
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <h3 className="text-2xl font-bold tracking-tight text-slate-900">
              {isSummaryLoading ? "..." : (summary?.approvedCount ?? 0)}
            </h3>
            <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
              {summary?.approvedPct ?? 0}%
            </span>
          </div>
          <div className="mt-3">
            <ProgressBar value={summary?.approvedPct ?? 0} color="emerald" size="sm" />
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Validated credentials & active meal profiles
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition-shadow hover:shadow-subtle">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Queue Breakdown
            </p>
            <Clock className="h-5 w-5 text-amber-500" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="flex items-baseline gap-3">
              <div>
                <span className="text-xs font-semibold text-amber-700">Pending: </span>
                <span className="text-xl font-bold font-mono text-slate-900">
                  {isSummaryLoading ? "..." : (summary?.pendingCount ?? 0)}
                </span>
              </div>
              <div>
                <span className="text-xs font-semibold text-rose-700">Rejected: </span>
                <span className="text-xl font-bold font-mono text-slate-900">
                  {isSummaryLoading ? "..." : (summary?.rejectedCount ?? 0)}
                </span>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-slate-400">
              {summary?.unresolvedPct ?? 0}% unresolved
            </span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-1.5">
            <div className="h-2 rounded-full bg-amber-400" />
            <div className="h-2 rounded-full bg-rose-400" />
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Awaiting administrative review or rejected
          </p>
        </div>
      </ReportStatGrid>

      {/* Filter Bar */}
      <ReportFilterBar
        search={rawSearch}
        onSearchChange={setSearch}
        searchPlaceholder="Search by registrant name, ID, or email…"
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
          <>
            <Select
              options={LEAGUE_OPTIONS}
              value={league || "ALL"}
              onChange={(e) => setLeague(e.target.value)}
            />
            <Select
              options={[
                { label: "All Teams", value: "ALL" },
                { label: "Chennai Kings", value: "chennai-kings" },
                { label: "Madurai Warriors", value: "madurai-warriors" },
                { label: "Salem Strikers", value: "salem-strikers" },
                { label: "Bengaluru Royals", value: "bengaluru-royals" },
                { label: "Coimbatore Lions", value: "coimbatore-lions" },
              ]}
              value={teamId || "ALL"}
              onChange={(e) => setTeamId(e.target.value)}
            />
          </>
        ) : null}

        <Select
          options={STATUS_FILTER_OPTIONS}
          value={status || "ALL"}
          onChange={(e) => setStatus(e.target.value)}
        />
      </ReportFilterBar>

      {/* Desktop Table View */}
      <div className="hidden md:block">
        <DataTable
          columns={columns}
          data={rows}
          isLoading={isRowsLoading}
          emptyTitle="No Registrations Found"
          emptyDescription="No candidate records match the active filters or date range."
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
        emptyTitle="No Registrations Found"
        emptyDescription="No candidate records match the active filters."
        renderCard={(row) => (
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <Avatar name={row.name} src={row.avatarUrl} size="sm" />
                <div>
                  <div className="flex items-center gap-1.5">
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
                    {row.isVip && (
                      <span className="inline-flex items-center gap-0.5 rounded bg-amber-100 text-amber-900 text-[10px] font-bold px-1 py-0.2">
                        VIP
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-[11px] text-slate-500">
                    {row.formattedId}
                  </span>
                </div>
              </div>
              <StatusPill status={row.status} size="sm" />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Type</span>
                <TypePill type={row.type} />
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Team</span>
                <span className="font-medium text-slate-800">{row.teamName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Role</span>
                <span className="text-slate-700">{row.role}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Submitted</span>
                <span className="text-slate-600">{formatDateShort(row.submittedAt)}</span>
              </div>
            </div>
          </div>
        )}
      />

      {/* Pagination & Footer */}
      {pagination && (
        <div className="mt-4">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            totalItems={pagination.total}
            pageSize={pagination.pageSize}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </div>
      )}

      {/* Registrant Review Drawer Host */}
      <RegistrantDetailsHost />
    </ReportPageShell>
  );
};

export default RegistrationReportPage;

