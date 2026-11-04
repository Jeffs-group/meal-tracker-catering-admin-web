import React, { useState } from "react";
import {
  DataTable,
  type ColumnDef,
  SearchInput,
  Select,
  Button,
  Pagination,
  StatCard,
  StatusPill,
  Avatar,
} from "@/components/ui";
import { MealEligibilityToggle } from "@/components/registrations/MealEligibilityToggle";
import { BatchActionsMenu } from "@/components/registrations/BatchActionsMenu";
import { RegistrantReviewModal } from "@/components/registrations/RegistrantReviewModal";
import { useStaffs } from "@/hooks/useRegistrations";
import { useToggleMealEligibility } from "@/hooks/useRegistrantActions";
import { useTableFilters } from "@/hooks/useTableFilters";
import { STATUS_FILTER_OPTIONS } from "@/constants/status";
import { formatDateShort } from "@/utils/formatDate";
import { exportToCsv } from "@/utils/exportCsv";
import {
  Users,
  CheckCircle2,
  Clock,
  XCircle,
  RotateCcw,
  Eye,
  Download,
} from "lucide-react";
import type { StaffRegistrationRow } from "@/types/registration.types";

export const StaffsTab: React.FC = () => {
  const filters = useTableFilters({ pageSize: 10 });
  const { data, isLoading } = useStaffs(filters.queryParams);
  const toggleMealMutation = useToggleMealEligibility();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [reviewId, setReviewId] = useState<string | null>(null);

  const stats = data?.stats;
  const staffList = data?.result.data ?? [];

  const handleSelectRow = (id: string, selected: boolean) => {
    setSelectedIds((prev) =>
      selected ? [...prev, id] : prev.filter((item) => item !== id),
    );
  };

  const handleSelectAll = (selected: boolean) => {
    setSelectedIds(selected ? staffList.map((s) => s.id) : []);
  };

  const handleExportSelected = () => {
    const rowsToExport = staffList.filter((s) => selectedIds.includes(s.id));
    exportToCsv(
      "Staff_Roster_Selected",
      rowsToExport.length > 0 ? rowsToExport : staffList,
      [
        { header: "Registration ID", accessor: (r) => r.registrationId },
        { header: "Full Name", accessor: (r) => r.name },
        { header: "Department", accessor: (r) => r.department },
        { header: "Contact", accessor: (r) => r.contact },
        { header: "Email", accessor: (r) => r.email },
        { header: "Status", accessor: (r) => r.status },
        {
          header: "Meal Eligible",
          accessor: (r) => (r.mealEligible ? "Active" : "Inactive"),
        },
      ],
    );
  };

  const columns: ColumnDef<StaffRegistrationRow>[] = [
    {
      key: "name",
      header: "Staff Member",
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.name} src={row.avatarUrl} size="sm" />
          <div>
            <p className="font-semibold text-slate-900">{row.name}</p>
            <p className="font-mono text-[11px] text-slate-400">
              {row.registrationId} • {row.department}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "contact",
      header: "Contact",
      render: (row) => (
        <div>
          <p className="font-mono text-xs text-slate-800">{row.contact}</p>
          <p className="font-mono text-[11px] text-slate-400 truncate max-w-[170px]">
            {row.email}
          </p>
        </div>
      ),
    },
    {
      key: "submittedAt",
      header: "Submitted",
      render: (row) => (
        <span className="font-mono text-[11px] text-slate-500">
          {formatDateShort(row.submittedAt)}
        </span>
      ),
    },
    {
      key: "mealEligible",
      header: "Meal Pass",
      render: (row) => (
        <MealEligibilityToggle
          checked={row.mealEligible}
          status={row.status}
          onToggle={() => toggleMealMutation.mutate(row.id)}
          isLoading={toggleMealMutation.isPending}
        />
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusPill status={row.status} size="sm" />,
    },
    {
      key: "actions",
      header: "Details",
      align: "right",
      render: (row) => (
        <Button
          size="xs"
          variant="outline"
          onClick={() => setReviewId(row.id)}
          leftIcon={<Eye className="h-3.5 w-3.5" />}
        >
          Details
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Staff"
          value={stats?.total ?? 0}
          subtitle="Operational personnel registered"
          icon={<Users className="h-5 w-5 text-slate-400" />}
        />

        <StatCard
          title="Approved (Meal-Eligible)"
          value={stats?.approvedMealEligible ?? 0}
          progress={{ value: stats?.approvedPercent ?? 0, color: "emerald" }}
          subtitle={`${stats?.approvedPercent ?? 0}% active access`}
          icon={<CheckCircle2 className="h-5 w-5 text-emerald-500" />}
        />

        <StatCard
          title="Pending Verification"
          value={stats?.pending ?? 0}
          progress={{ value: stats?.pendingPercent ?? 0, color: "amber" }}
          badgeText="Requires Action"
          badgeVariant="warning"
          subtitle={`${stats?.pendingPercent ?? 0}% awaiting check`}
          icon={<Clock className="h-5 w-5 text-amber-500" />}
        />

        <StatCard
          title="Rejected / Ineligible"
          value={stats?.rejected ?? 0}
          progress={{ value: stats?.rejectedPercent ?? 0, color: "rose" }}
          subtitle={`${stats?.rejectedPercent ?? 0}% disqualified`}
          icon={<XCircle className="h-5 w-5 text-rose-500" />}
        />
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <SearchInput
            value={filters.rawSearch}
            onChange={filters.setSearch}
            placeholder="Search staff, ID, or email..."
          />
          <Select
            options={STATUS_FILTER_OPTIONS}
            value={filters.status}
            onChange={(e) => filters.setStatus(e.target.value)}
          />
          <Button
            size="sm"
            variant="ghost"
            onClick={filters.resetFilters}
            leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
          >
            Reset
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleExportSelected}
            leftIcon={<Download className="h-3.5 w-3.5" />}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* Operational Roster Table */}
      <DataTable
        columns={columns}
        data={staffList}
        isLoading={isLoading}
        selectedIds={selectedIds}
        onSelectRow={handleSelectRow}
        onSelectAll={handleSelectAll}
        getId={(row) => row.id}
        emptyTitle="No Staff Members Found"
        emptyDescription="No operational staff match the applied search query or status filter."
      />

      {/* Pagination */}
      {data && (
        <Pagination
          currentPage={data.result.pagination.page}
          totalPages={data.result.pagination.totalPages}
          totalItems={data.result.pagination.total}
          pageSize={data.result.pagination.pageSize}
          onPageChange={filters.setPage}
          onPageSizeChange={filters.setPageSize}
        />
      )}

      {/* Floating Batch Actions Bar */}
      <BatchActionsMenu
        selectedCount={selectedIds.length}
        onExportSelected={handleExportSelected}
        onClearSelection={() => setSelectedIds([])}
      />

      {/* Registrant Review Modal */}
      <RegistrantReviewModal
        registrantId={reviewId}
        isOpen={!!reviewId}
        onClose={() => setReviewId(null)}
      />
    </div>
  );
};

export default StaffsTab;
