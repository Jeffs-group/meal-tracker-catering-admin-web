import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Trophy,
  Shield,
  Plus,
  Download,
  Search,
  RefreshCw,
  Edit2,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react";
import {
  DataTable,
  type ColumnDef,
  StatCard,
  Select,
  Button,
  StatusPill,
  Pagination,
  ErrorDisplay,
} from "@/components/ui";
import {
  TeamFormDialog,
  DeactivateTeamDialog,
  TeamRowMenu,
  TeamsSortPopover,
  TeamsCardList,
} from "@/components/manage-teams";
import { useManageTeams, useTeamMutations } from "@/hooks/useTeamMutations";
import { useTableFilters } from "@/hooks/useTableFilters";
import { useAuthStore } from "@/stores/authStore";
import { LEAGUE_CONFIG, CURRENT_SEASON } from "@/constants/leagues";
import { buildTeamMembersRoute } from "@/constants/routes";
import { exportToCsv } from "@/utils/exportCsv";
import type { Team, League } from "@/types/team.types";
import type { TeamStatus } from "@/types/common.types";
import type { TeamFormValues } from "@/validations/team.validation";
import { cn } from "@/utils/cn";

export const ManageTeamsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // Role rule: Superadmin check (ORG_ADMIN or SUPER_ADMIN or null mock session has privileges)
  const isSuperAdmin =
    !user || user.role === "SUPER_ADMIN" || user.role === "ORG_ADMIN";

  // Table filters synced to URL query params
  const filters = useTableFilters({
    page: 1,
    pageSize: 6,
    search: "",
    league: "ALL",
    status: "ALL",
  });

  const [sortOption, setSortOption] = useState<string>("name_asc");

  // Dialog states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [deactivatingTeam, setDeactivatingTeam] = useState<Team | null>(null);
  const [reactivatingTeam, setReactivatingTeam] = useState<Team | null>(null);

  // Toast notification state
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Queries & Mutations
  const queryParams = useMemo(
    () => ({
      page: filters.page,
      pageSize: filters.pageSize,
      search: filters.search,
      league: (filters.league as League | "ALL") || "ALL",
      status: (filters.status as TeamStatus | "ALL") || "ALL",
      sort: sortOption,
    }),
    [
      filters.page,
      filters.pageSize,
      filters.search,
      filters.league,
      filters.status,
      sortOption,
    ],
  );

  const { data, isLoading, isError, error, refetch, isFetching } =
    useManageTeams(queryParams);

  const { createTeam, updateTeam, deactivateTeam, reactivateTeam } =
    useTeamMutations();

  const teams = data?.items ?? [];
  const totalTeams = data?.total ?? 0;
  const stats = data?.stats ?? {
    total: 0,
    kspl: 0,
    iscl: 0,
    active: 0,
    inactive: 0,
  };

  // Export filtered roster to CSV
  const handleExportRoster = () => {
    if (teams.length === 0) {
      showToast("No teams to export in the current filtered view.", "error");
      return;
    }

    exportToCsv("Tournament_Teams_Roster", teams, [
      { header: "Team Name", accessor: (t) => t.name },
      { header: "Team ID", accessor: (t) => t.teamCode },
      { header: "League", accessor: (t) => t.league },
      { header: "Status", accessor: (t) => t.status },
      { header: "Total Registrants", accessor: (t) => t.registrationsTotal },
      { header: "Approved", accessor: (t) => t.approvedCount },
      { header: "Pending", accessor: (t) => t.pendingCount },
      { header: "Rejected", accessor: (t) => t.rejectedCount },
      { header: "Licensed", accessor: (t) => (t.licensed ? "Yes" : "No") },
      { header: "Last Updated", accessor: (t) => t.updatedAt },
    ]);

    showToast("Team roster exported successfully.");
  };

  // Handlers for dialog actions
  const handleCreateSubmit = async (values: TeamFormValues) => {
    await createTeam.mutateAsync(values);
    setIsCreateOpen(false);
    showToast(`${values.name} created in ${values.league}`);
  };

  const handleEditSubmit = async (values: TeamFormValues) => {
    if (!editingTeam) return;
    await updateTeam.mutateAsync({
      teamId: editingTeam.id,
      payload: values,
    });
    setEditingTeam(null);
    showToast(`${values.name} updated successfully`);
  };

  const handleDeactivateConfirm = async (reason: string, notes?: string) => {
    if (!deactivatingTeam) return;
    await deactivateTeam.mutateAsync({
      teamId: deactivatingTeam.id,
      payload: { reason, notes },
    });
    setDeactivatingTeam(null);
    showToast(`${deactivatingTeam.name} has been deactivated.`);
  };

  const handleReactivateConfirm = async (notes?: string) => {
    if (!reactivatingTeam) return;
    await reactivateTeam.mutateAsync({
      teamId: reactivatingTeam.id,
      payload: { notes },
    });
    setReactivatingTeam(null);
    showToast(`${reactivatingTeam.name} has been reactivated.`);
  };

  // Table columns definition
  const columns: ColumnDef<Team>[] = [
    {
      key: "teamEntity",
      header: "TEAM ENTITY",
      className: "w-72",
      render: (row) => {
        const isInactive = row.status === "INACTIVE";
        return (
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold text-xs shadow-2xs border transition-colors",
                isInactive
                  ? "bg-slate-200 text-slate-500 border-slate-300"
                  : "bg-slate-900 text-white border-slate-800",
              )}
            >
              {row.initials || row.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p
                className={cn(
                  "font-bold leading-tight truncate text-xs sm:text-sm",
                  isInactive ? "text-slate-400" : "text-slate-900",
                )}
                title={row.name}
              >
                {row.name}
              </p>
              <p className="font-mono text-[11px] text-slate-400 font-semibold mt-0.5">
                ID: {row.teamCode}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      key: "league",
      header: "LEAGUE",
      align: "center",
      render: (row) => (
        <span className="inline-flex rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 font-mono">
          {row.league}
        </span>
      ),
    },
    {
      key: "registrants",
      header: "REGISTRANTS",
      align: "center",
      render: (row) => (
        <span
          className={cn(
            "font-mono font-bold text-xs sm:text-sm",
            row.status === "INACTIVE" ? "text-slate-400" : "text-slate-900",
          )}
        >
          {row.registrationsTotal}
        </span>
      ),
    },
    {
      key: "verificationState",
      header: "VERIFICATION STATE",
      className: "w-60",
      render: (row) => {
        const isInactive = row.status === "INACTIVE";
        const approvedPct =
          row.registrationsTotal > 0
            ? Math.round((row.approvedCount / row.registrationsTotal) * 100)
            : 0;

        return (
          <div className="space-y-1 max-w-[190px]">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-mono text-slate-600 font-semibold">
                {row.approvedCount} approved
              </span>
              <span className="font-mono text-[10px] text-slate-400">
                {approvedPct}%
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-300",
                  isInactive ? "bg-amber-500" : "bg-emerald-500",
                )}
                style={{ width: `${approvedPct}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      key: "status",
      header: "STATUS",
      align: "center",
      render: (row) => <StatusPill status={row.status} size="sm" />,
    },
    {
      key: "actions",
      header: "ACTIONS",
      align: "right",
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => setEditingTeam(row)}
            disabled={!isSuperAdmin}
            title={
              !isSuperAdmin ? "Superadmin privilege required" : "Edit Team"
            }
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-800 disabled:opacity-40 transition-colors cursor-pointer"
          >
            <Edit2 className="h-3.5 w-3.5" />
          </button>

          <TeamRowMenu
            team={row}
            onViewTeam={(teamId) => navigate(buildTeamMembersRoute(teamId))}
            onEditTeam={(t) => setEditingTeam(t)}
            onDeactivateTeam={(t) => setDeactivatingTeam(t)}
            onReactivateTeam={(t) => setReactivatingTeam(t)}
            isSuperAdmin={isSuperAdmin}
          />
        </div>
      ),
    },
  ];

  if (isError) {
    return (
      <div className="py-12">
        <ErrorDisplay
          title="Failed to Load Manage Teams"
          message={
            error instanceof Error
              ? error.message
              : "Unable to retrieve teams list from server."
          }
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  // Row count label
  const startItemIndex = (filters.page - 1) * filters.pageSize + 1;
  const endItemIndex = Math.min(filters.page * filters.pageSize, totalTeams);

  return (
    <div className="space-y-6">
      {/* Toast Notification Banner */}
      {toast && (
        <div
          role="status"
          className={cn(
            "fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl px-4 py-3 shadow-xl transition-all border animate-in slide-in-from-bottom-5",
            toast.type === "success"
              ? "border-emerald-200 bg-slate-900 text-white shadow-emerald-950/20"
              : "border-rose-200 bg-rose-900 text-white shadow-rose-950/20",
          )}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
          )}
          <span className="text-xs font-semibold">{toast.message}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="text-slate-400 hover:text-white ml-2 text-xs"
            aria-label="Close notification"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
              Manage Teams
            </h1>
            <span className="inline-flex items-center rounded-md border border-slate-300 bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-700 font-mono">
              {CURRENT_SEASON.label}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 leading-relaxed">
            Create and manage teams participating in KSPL and ISCL leagues.
          </p>
        </div>

        {/* Header CTA Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportRoster}
            disabled={teams.length === 0}
            leftIcon={<Download className="h-4 w-4" />}
            className="rounded-xl border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            Export Roster
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            disabled={!isSuperAdmin}
            title={
              !isSuperAdmin
                ? "Superadmin privilege required to create teams"
                : undefined
            }
            leftIcon={<Plus className="h-4 w-4" />}
            className="rounded-xl shadow-xs"
          >
            Create Team
          </Button>
        </div>
      </div>

      {/* 3 Stat Cards: TOTAL TEAMS, KSPL TEAMS, ISCL TEAMS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="TOTAL TEAMS"
          value={isLoading ? "..." : stats.total}
          subtitle="Across tournament divisions"
          badgeText={`${stats.active} active`}
          badgeVariant="success"
          icon={<Users className="h-5 w-5 text-slate-400" />}
        />

        <StatCard
          title="KSPL TEAMS"
          value={isLoading ? "..." : stats.kspl}
          subtitle={LEAGUE_CONFIG.KSPL.tagline}
          badgeText={`${LEAGUE_CONFIG.KSPL.code}`}
          badgeVariant="neutral"
          icon={<Trophy className="h-5 w-5 text-[#C9A227]" />}
        />

        <StatCard
          title="ISCL TEAMS"
          value={isLoading ? "..." : stats.iscl}
          subtitle={LEAGUE_CONFIG.ISCL.tagline}
          badgeText={`${LEAGUE_CONFIG.ISCL.code}`}
          badgeVariant="neutral"
          icon={<Shield className="h-5 w-5 text-slate-400" />}
        />
      </div>

      {/* Filter Toolbar Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          {/* Left: Search + League & Status Selects */}
          <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => filters.setSearch(e.target.value)}
                placeholder="Search by team name…"
                className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 shadow-2xs outline-none transition-all focus:border-[#C9A227] focus:ring-2 focus:ring-[#FAF4E6]"
              />
            </div>

            {/* League Select */}
            <div className="w-full sm:w-40">
              <Select
                fullWidth
                value={filters.league}
                options={[
                  { value: "ALL", label: "All Leagues" },
                  { value: "KSPL", label: "KSPL" },
                  { value: "ISCL", label: "ISCL" },
                ]}
                onChange={(e) => filters.setLeague(e.target.value)}
              />
            </div>

            {/* Status Select */}
            <div className="w-full sm:w-36">
              <Select
                fullWidth
                value={filters.status}
                options={[
                  { value: "ALL", label: "All Status" },
                  { value: "ACTIVE", label: "Active" },
                  { value: "INACTIVE", label: "Inactive" },
                ]}
                onChange={(e) => filters.setStatus(e.target.value)}
              />
            </div>
          </div>

          {/* Right: Showing N teams + Refresh + Sliders Popover */}
          <div className="flex items-center justify-between lg:justify-end gap-3 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
            <span className="text-xs font-semibold text-slate-500">
              Showing {teams.length} teams
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => refetch()}
                disabled={isFetching}
                title="Refresh teams list"
                aria-label="Refresh teams list"
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#C9A227]"
              >
                <RefreshCw
                  className={cn("h-4 w-4", isFetching && "animate-spin")}
                />
              </button>

              <TeamsSortPopover
                currentSort={sortOption}
                onSelectSort={(newSort) => setSortOption(newSort)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Responsive View: Desktop DataTable (hidden on <768px) vs Mobile Card List */}
      <div className="hidden md:block">
        <DataTable
          columns={columns}
          data={teams}
          isLoading={isLoading}
          emptyTitle="No Teams Found"
          emptyDescription={
            filters.search || filters.league !== "ALL" || filters.status !== "ALL"
              ? "No teams match your current search and filter settings."
              : "No tournament teams have been created yet."
          }
          emptyActionLabel={
            filters.search || filters.league !== "ALL" || filters.status !== "ALL"
              ? "Clear All Filters"
              : isSuperAdmin
                ? "+ Create First Team"
                : undefined
          }
          onEmptyAction={() => {
            if (
              filters.search ||
              filters.league !== "ALL" ||
              filters.status !== "ALL"
            ) {
              filters.resetFilters();
            } else if (isSuperAdmin) {
              setIsCreateOpen(true);
            }
          }}
        />
      </div>

      {/* Mobile Card List (visible on <768px) */}
      <TeamsCardList
        teams={teams}
        onViewTeam={(teamId) => navigate(buildTeamMembersRoute(teamId))}
        onEditTeam={(t) => setEditingTeam(t)}
        onDeactivateTeam={(t) => setDeactivatingTeam(t)}
        onReactivateTeam={(t) => setReactivatingTeam(t)}
        isSuperAdmin={isSuperAdmin}
      />

      {/* Pagination Footer */}
      {totalTeams > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl border border-slate-200 bg-white px-5 py-3 shadow-2xs">
          <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
            <span>
              Showing{" "}
              <strong className="text-slate-800 font-bold">
                {startItemIndex} to {endItemIndex}
              </strong>{" "}
              of <strong className="text-slate-800 font-bold">{totalTeams}</strong>{" "}
              teams
            </span>

            <span className="text-slate-300">•</span>

            <div className="flex items-center gap-1.5">
              <span>Rows per page:</span>
              <select
                value={filters.pageSize}
                onChange={(e) => filters.setPageSize(Number(e.target.value))}
                className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-700 outline-none focus:border-[#C9A227]"
              >
                <option value={6}>6</option>
                <option value={12}>12</option>
                <option value={24}>24</option>
              </select>
            </div>
          </div>

          <Pagination
            currentPage={filters.page}
            totalPages={Math.ceil(totalTeams / filters.pageSize) || 1}
            totalItems={totalTeams}
            pageSize={filters.pageSize}
            onPageChange={(p) => filters.setPage(p)}
            onPageSizeChange={(s) => filters.setPageSize(s)}
          />
        </div>
      )}

      {/* Create Team Dialog */}
      <TeamFormDialog
        isOpen={isCreateOpen}
        mode="create"
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateSubmit}
        isSubmitting={createTeam.isPending}
      />

      {/* Edit Team Dialog */}
      <TeamFormDialog
        isOpen={!!editingTeam}
        mode="edit"
        initialTeam={editingTeam}
        onClose={() => setEditingTeam(null)}
        onSubmit={handleEditSubmit}
        isSubmitting={updateTeam.isPending}
      />

      {/* Deactivate Team Dialog */}
      <DeactivateTeamDialog
        isOpen={!!deactivatingTeam}
        mode="deactivate"
        team={deactivatingTeam}
        onClose={() => setDeactivatingTeam(null)}
        onConfirmDeactivate={handleDeactivateConfirm}
        onConfirmReactivate={async () => {}}
        isSubmitting={deactivateTeam.isPending}
      />

      {/* Reactivate Team Dialog */}
      <DeactivateTeamDialog
        isOpen={!!reactivatingTeam}
        mode="reactivate"
        team={reactivatingTeam}
        onClose={() => setReactivatingTeam(null)}
        onConfirmDeactivate={async () => {}}
        onConfirmReactivate={handleReactivateConfirm}
        isSubmitting={reactivateTeam.isPending}
      />
    </div>
  );
};

export default ManageTeamsPage;
