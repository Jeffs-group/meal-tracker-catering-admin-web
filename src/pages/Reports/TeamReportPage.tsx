import React from "react";
import { Link } from "react-router-dom";
import {
  type ColumnDef,
  Select,
  Pagination,
  StatCard,
  StatusPill,
  ProgressBar,
} from "@/components/ui";
import {
  ReportPageShell,
  ReportStatGrid,
  ReportFilterBar,
  ExportMenu,
  TeamTile,
  LeaguePill,
  ComplianceCell,
  SummaryRow,
  ReportCardList,
} from "@/components/reports";
import {
  useTeamReportSummary,
  useTeamReportRows,
  useReportExport,
} from "@/hooks/useReports";
import { useReportFilters } from "@/hooks/useReportFilters";
import { reportsApi } from "@/api/reports.api";
import { LEAGUE_OPTIONS, TEAM_STATUS_FILTER_OPTIONS } from "@/constants/status";
import { COMPLIANCE_THRESHOLD } from "@/constants/reports";
import { Shield, ArrowUpDown, Award } from "lucide-react";
import type { TeamReportRow } from "@/types/reports.types";

export const TeamReportPage: React.FC = () => {
  const {
    filters,
    rawSearch,
    setSearch,
    league,
    setLeague,
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
  } = useReportFilters({ hasDateRange: false });

  const { data: summary, isLoading: isSummaryLoading, refetch: refetchSummary } =
    useTeamReportSummary(filters);
  const { data: rowsData, isLoading: isRowsLoading, refetch: refetchRows } =
    useTeamReportRows(filters);

  const handleRefresh = () => {
    refetchSummary();
    refetchRows();
  };

  // Export Hook
  const { isExporting, toast, handleExport } = useReportExport<TeamReportRow>({
    key: "team",
    slug: "team-wise-registration",
    sheetTitle: "Team Roster Compliance",
    columns: [
      { header: "Team ID", key: "teamCode", accessor: (r) => r.teamCode },
      { header: "Team Name", key: "name", accessor: (r) => r.name },
      { header: "League", key: "league", accessor: (r) => r.league },
      { header: "Total Registrations", key: "totalRegistrations", accessor: (r) => r.totalRegistrations },
      { header: "Approved", key: "approvedCount", accessor: (r) => r.approvedCount },
      { header: "Pending", key: "pendingCount", accessor: (r) => r.pendingCount },
      { header: "Rejected", key: "rejectedCount", accessor: (r) => r.rejectedCount },
      { header: "Team Status", key: "teamStatus", accessor: (r) => r.teamStatus },
      { header: "Roster Compliance (%)", key: "rosterCompliance", accessor: (r) => `${r.rosterCompliance}%` },
    ],
    fetchAllRows: async (appliedFilters) => {
      const res = await reportsApi.getTeamRows({
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

  const columns: ColumnDef<TeamReportRow>[] = [
    {
      key: "name",
      header: (
        <button
          type="button"
          onClick={() => toggleSort("name")}
          className="inline-flex items-center gap-1 hover:text-slate-900 cursor-pointer"
        >
          <span>Team</span>
          <ArrowUpDown className="h-3 w-3 text-slate-400" />
        </button>
      ),
      render: (row) => (
        <div className="flex items-center gap-3">
          <TeamTile name={row.name} code={row.name.slice(0, 2).toUpperCase()} size="md" />
          <div>
            <Link
              to={`/registrations/teams/${row.teamId}`}
              className="font-bold text-slate-900 hover:text-[#9B7415] hover:underline"
            >
              {row.name}
            </Link>
            <p className="font-mono text-[10px] text-slate-400 font-semibold mt-0.5">
              ID: {row.teamCode}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "league",
      header: "League",
      render: (row) => <LeaguePill league={row.league} />,
    },
    {
      key: "totalRegistrations",
      header: (
        <button
          type="button"
          onClick={() => toggleSort("totalRegistrations")}
          className="inline-flex items-center gap-1 hover:text-slate-900 cursor-pointer"
        >
          <span>Total Reg.</span>
          <ArrowUpDown className="h-3 w-3 text-slate-400" />
        </button>
      ),
      render: (row) => (
        <span className="font-mono font-bold text-slate-900 text-xs">
          {row.totalRegistrations}
        </span>
      ),
    },
    {
      key: "approvedCount",
      header: (
        <button
          type="button"
          onClick={() => toggleSort("approvedCount")}
          className="inline-flex items-center gap-1 hover:text-slate-900 cursor-pointer"
        >
          <span>Approved</span>
          <ArrowUpDown className="h-3 w-3 text-slate-400" />
        </button>
      ),
      render: (row) => (
        <div className="space-y-1 min-w-[100px]">
          <span className="font-mono font-semibold text-emerald-700 text-xs">
            {row.approvedCount}
          </span>
          <ProgressBar
            value={row.totalRegistrations > 0 ? (row.approvedCount / row.totalRegistrations) * 100 : 0}
            color="emerald"
            size="xs"
          />
        </div>
      ),
    },
    {
      key: "pendingCount",
      header: (
        <button
          type="button"
          onClick={() => toggleSort("pendingCount")}
          className="inline-flex items-center gap-1 hover:text-slate-900 cursor-pointer"
        >
          <span>Pending</span>
          <ArrowUpDown className="h-3 w-3 text-slate-400" />
        </button>
      ),
      render: (row) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono font-semibold ${
            row.pendingCount > 0 ? "bg-amber-50 text-amber-700 border border-amber-200" : "text-slate-400"
          }`}
        >
          {row.pendingCount}
        </span>
      ),
    },
    {
      key: "rejectedCount",
      header: (
        <button
          type="button"
          onClick={() => toggleSort("rejectedCount")}
          className="inline-flex items-center gap-1 hover:text-slate-900 cursor-pointer"
        >
          <span>Rejected</span>
          <ArrowUpDown className="h-3 w-3 text-slate-400" />
        </button>
      ),
      render: (row) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono font-semibold ${
            row.rejectedCount > 0 ? "bg-rose-50 text-rose-700 border border-rose-200" : "text-slate-400"
          }`}
        >
          {row.rejectedCount}
        </span>
      ),
    },
    {
      key: "teamStatus",
      header: "Team Status",
      render: (row) => <StatusPill status={row.teamStatus} size="sm" />,
    },
    {
      key: "rosterCompliance",
      header: (
        <button
          type="button"
          onClick={() => toggleSort("rosterCompliance")}
          className="inline-flex items-center gap-1 hover:text-slate-900 cursor-pointer"
        >
          <span>Roster Compliance</span>
          <ArrowUpDown className="h-3 w-3 text-slate-400" />
        </button>
      ),
      render: (row) => (
        <ComplianceCell
          compliancePct={row.rosterCompliance}
          isBelowThreshold={row.isBelowThreshold}
        />
      ),
    },
  ];

  const rows = rowsData?.data ?? [];
  const pagination = rowsData?.pagination;

  return (
    <ReportPageShell
      title="Team-wise Registration Report"
      description="Understand the registration, roster verification, and approval status of each team across active leagues."
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
          title="Total Teams"
          value={isSummaryLoading ? "..." : (summary?.totalTeams ?? 24)}
          badgeText={`${summary?.activeTeams ?? 18} active · ${summary?.inactiveTeams ?? 6} inactive`}
          badgeVariant="neutral"
          subtitle="Across tournament divisions"
          icon={<Shield className="h-5 w-5 text-slate-400" />}
        />

        {/* KSPL League Card */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition-shadow hover:shadow-subtle">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              KSPL League
            </p>
            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-200">
              {summary?.kspl.teamCount ?? 14} Teams
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <h3 className="text-2xl font-bold tracking-tight text-slate-900 font-mono">
              {isSummaryLoading ? "..." : (summary?.kspl.totalRegistrations ?? 263)}
            </h3>
            <span className="text-xs font-semibold text-emerald-700">
              {summary?.kspl.approvedCount ?? 206} approved ({summary?.kspl.approvalRate ?? 78.3}%)
            </span>
          </div>
          <div className="mt-3">
            <ProgressBar value={summary?.kspl.approvalRate ?? 78.3} color="gold" size="sm" />
          </div>
          <p className="mt-2 text-xs text-slate-500 font-mono">
            {summary?.kspl.pendingCount ?? 39} pending · {summary?.kspl.rejectedCount ?? 18} rejected
          </p>
        </div>

        {/* ISCL League Card */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition-shadow hover:shadow-subtle">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              ISCL League
            </p>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 border border-slate-200">
              {summary?.iscl.teamCount ?? 10} Teams
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <h3 className="text-2xl font-bold tracking-tight text-slate-900 font-mono">
              {isSummaryLoading ? "..." : (summary?.iscl.totalRegistrations ?? 201)}
            </h3>
            <span className="text-xs font-semibold text-emerald-700">
              {summary?.iscl.approvedCount ?? 147} approved ({summary?.iscl.approvalRate ?? 73.1}%)
            </span>
          </div>
          <div className="mt-3">
            <ProgressBar value={summary?.iscl.approvalRate ?? 73.1} color="slate" size="sm" />
          </div>
          <p className="mt-2 text-xs text-slate-500 font-mono">
            {summary?.iscl.pendingCount ?? 30} pending · {summary?.iscl.rejectedCount ?? 24} rejected
          </p>
        </div>

        {/* Active Rosters & Compliance Threshold Card */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition-shadow hover:shadow-subtle">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Active Rosters
            </p>
            <Award className="h-5 w-5 text-emerald-500" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <h3 className="text-2xl font-bold tracking-tight text-slate-900 font-mono">
              {isSummaryLoading
                ? "..."
                : `${summary?.activeRosters.operationalCount ?? 18} / ${summary?.activeRosters.totalCount ?? 24}`}
            </h3>
            <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold px-2 py-0.5">
              {summary?.activeRosters.operationalPct ?? 75}% operational
            </span>
          </div>
          <div className="mt-3">
            <ProgressBar value={summary?.activeRosters.operationalPct ?? 75} color="emerald" size="sm" />
          </div>
          <p
            className="mt-2 text-xs text-amber-700 font-medium cursor-help"
            title={`Assumption: Roster compliance threshold is ${COMPLIANCE_THRESHOLD}% approved registrations minimum.`}
          >
            {summary?.activeRosters.belowThresholdCount ?? 3} rosters below {COMPLIANCE_THRESHOLD}% compliance
          </p>
        </div>
      </ReportStatGrid>

      {/* Filter Bar */}
      <ReportFilterBar
        search={rawSearch}
        onSearchChange={setSearch}
        searchPlaceholder="Search by team name or code…"
        onReset={resetFilters}
        isFiltered={isFiltered}
        activeFilterCount={activeFilterCount}
      >
        <Select
          options={LEAGUE_OPTIONS}
          value={league || "ALL"}
          onChange={(e) => setLeague(e.target.value)}
        />
        <Select
          options={TEAM_STATUS_FILTER_OPTIONS}
          value={status || "ALL"}
          onChange={(e) => setStatus(e.target.value)}
        />
      </ReportFilterBar>

      {/* Mobile Summary Card */}
      {summary && <SummaryRow summary={summary} isMobileCard={true} />}

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
        <table className="w-full min-w-full border-collapse text-left text-xs whitespace-nowrap">
          <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500 whitespace-nowrap">
            <tr>
              {columns.map((col) => (
                <th key={col.key} scope="col" className="px-4 py-3">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3">
                    {col.render ? col.render(row, 0) : null}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          {summary && <SummaryRow summary={summary} isMobileCard={false} />}
        </table>
      </div>

      {/* Mobile Card List View (<768px) */}
      <ReportCardList
        data={rows}
        isLoading={isRowsLoading}
        onClearFilters={resetFilters}
        emptyTitle="No Teams Found"
        emptyDescription="No team records match the applied filters."
        renderCard={(row) => (
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <TeamTile name={row.name} code={row.name.slice(0, 2).toUpperCase()} size="sm" />
                <div>
                  <Link
                    to={`/registrations/teams/${row.teamId}`}
                    className="font-bold text-slate-900 text-xs hover:underline"
                  >
                    {row.name}
                  </Link>
                  <p className="font-mono text-[10px] text-slate-400">ID: {row.teamCode}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <LeaguePill league={row.league} />
                <StatusPill status={row.teamStatus} size="sm" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Reg</span>
                <span className="font-bold font-mono text-slate-900">{row.totalRegistrations}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Approved</span>
                <span className="font-bold font-mono text-emerald-700">{row.approvedCount}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Pending / Rejected</span>
                <span className="font-mono text-slate-700">{row.pendingCount} / {row.rejectedCount}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Compliance</span>
                <ComplianceCell compliancePct={row.rosterCompliance} isBelowThreshold={row.isBelowThreshold} />
              </div>
            </div>
          </div>
        )}
      />

      {/* Pagination */}
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
    </ReportPageShell>
  );
};

export default TeamReportPage;

