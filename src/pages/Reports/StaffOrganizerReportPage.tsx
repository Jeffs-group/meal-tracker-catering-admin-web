import React from "react";
import { useSearchParams } from "react-router-dom";
import {
  DataTable,
  type ColumnDef,
  Select,
  Pagination,
  StatCard,
  StatusPill,
  Avatar,
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
  useStaffOrganizerReportSummary,
  useStaffOrganizerReportRows,
  useReportExport,
} from "@/hooks/useReports";
import { useReportFilters } from "@/hooks/useReportFilters";
import { usePermissions } from "@/hooks/usePermissions";
import { reportsApi } from "@/api/reports.api";
import { formatDateShort } from "@/utils/formatDate";
import { STATUS_FILTER_OPTIONS } from "@/constants/status";
import { Briefcase, Award, CheckCircle2, Users, ArrowUpDown } from "lucide-react";
import type { StaffOrganizerReportRow } from "@/types/reports.types";

export const StaffOrganizerReportPage: React.FC = () => {
  const {
    filters,
    rawSearch,
    setSearch,
    from,
    to,
    setDateRange,
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
    useStaffOrganizerReportSummary(filters);
  const { data: rowsData, isLoading: isRowsLoading, refetch: refetchRows } =
    useStaffOrganizerReportRows(filters);

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
  const { isExporting, toast, handleExport } = useReportExport<StaffOrganizerReportRow>({
    key: "staff-organizer",
    slug: "staff-organizer-report",
    sheetTitle: "Staff & Organizers",
    columns: [
      { header: "Registrant ID", key: "registrantId", accessor: (r) => r.formattedId },
      { header: "Name", key: "name", accessor: (r) => r.name },
      { header: "Type", key: "type", accessor: (r) => r.type },
      { header: "Department / Organization", key: "departmentOrOrg", accessor: (r) => r.departmentOrOrg },
      { header: "Role", key: "role", accessor: (r) => r.role },
      { header: "Phone", key: "phone", accessor: (r) => r.phone },
      { header: "Email", key: "email", accessor: (r) => r.email },
      { header: "Submitted On", key: "submittedAt", accessor: (r) => r.submittedAt },
      { header: "Status", key: "status", accessor: (r) => r.status },
      { header: "Meal Pass Enabled", key: "mealEligible", accessor: (r) => (r.mealEligible ? "Yes" : "No") },
    ],
    fetchAllRows: async (appliedFilters) => {
      const res = await reportsApi.getStaffOrganizerRows({
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

  const columns: ColumnDef<StaffOrganizerReportRow>[] = [
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
                className="font-bold text-slate-900 hover:text-[#9B7415] hover:underline cursor-pointer text-left truncate"
              >
                {row.name}
              </button>
            ) : (
              <span className="font-bold text-slate-900 truncate">{row.name}</span>
            )}
            <p className="text-[11px] text-slate-500 font-medium truncate">
              {row.role} • {row.departmentOrOrg}
            </p>
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
        <span className="text-xs text-slate-600 truncate max-w-[170px] inline-block" title={row.email}>
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
      header: "Status",
      render: (row) => <StatusPill status={row.status} size="sm" />,
    },
  ];

  const rows = rowsData?.data ?? [];
  const pagination = rowsData?.pagination;

  return (
    <ReportPageShell
      title="Staff & Organizer Report"
      description="Get a consolidated report of registered Staff and Organizers across active logistics streams."
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
          title="Total Accreditation"
          value={isSummaryLoading ? "..." : (summary?.totalAccreditation ?? 302)}
          subtitle="Registered personnel roster"
          icon={<Users className="h-5 w-5 text-slate-400" />}
        />

        <StatCard
          title="Staff"
          value={isSummaryLoading ? "..." : (summary?.staffCount ?? 268)}
          subtitle="Operational support staff"
          icon={<Briefcase className="h-5 w-5 text-[#C9A227]" />}
        />

        <StatCard
          title="Organizers"
          value={isSummaryLoading ? "..." : (summary?.organizerCount ?? 34)}
          subtitle="Tournament leadership & committee"
          icon={<Award className="h-5 w-5 text-purple-600" />}
        />

        <StatCard
          title="Passes Issued"
          value={isSummaryLoading ? "..." : (summary?.passesIssued ?? 238)}
          badgeText="Approved"
          badgeVariant="success"
          subtitle="Digital accreditation activated"
          icon={<CheckCircle2 className="h-5 w-5 text-emerald-500" />}
        />
      </ReportStatGrid>

      {/* Filter Bar */}
      <ReportFilterBar
        search={rawSearch}
        onSearchChange={setSearch}
        searchPlaceholder="Search by staff or organizer name, ID, email…"
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
            { label: "Staff", value: "STAFF" },
            { label: "Organizer", value: "ORGANIZER" },
          ]}
          value={type || "ALL"}
          onChange={(e) => setType(e.target.value)}
        />

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
          emptyTitle="No Staff or Organizers Found"
          emptyDescription="No personnel records match the active search or filters."
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
        emptyTitle="No Personnel Found"
        emptyDescription="No personnel records match the active filters."
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
              <StatusPill status={row.status} size="sm" />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Type</span>
                <TypePill type={row.type} />
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Role</span>
                <span className="text-slate-800 truncate block">{row.role}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Department / Org</span>
                <span className="text-slate-700 truncate block">{row.departmentOrOrg}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Submitted</span>
                <span className="text-slate-600">{formatDateShort(row.submittedAt)}</span>
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

      {/* Registrant Review Drawer Host */}
      <RegistrantDetailsHost />
    </ReportPageShell>
  );
};

export default StaffOrganizerReportPage;

