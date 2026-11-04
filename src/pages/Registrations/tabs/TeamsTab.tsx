import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  DataTable,
  type ColumnDef,
  SearchInput,
  Select,
  Toggle,
  Button,
  Pagination,
} from "@/components/ui";
import { Shield, Info, RefreshCw } from "lucide-react";
import { useTeams } from "@/hooks/useRegistrations";
import { useTeamMutations } from "@/hooks/useTeamMutations";
import { useTableFilters } from "@/hooks/useTableFilters";
import { LEAGUE_OPTIONS, TEAM_STATUS_FILTER_OPTIONS } from "@/constants/status";
import { buildTeamMembersRoute } from "@/constants/routes";
import { DeactivateTeamDialog } from "@/components/manage-teams/DeactivateTeamDialog";
import type { TeamRegistrationRow } from "@/types/registration.types";
import type { Team, League } from "@/types/team.types";

export const TeamsTab: React.FC = () => {
  const navigate = useNavigate();
  const filters = useTableFilters({ pageSize: 10 });
  const { data, isLoading, refetch, isFetching } = useTeams(
    filters.queryParams,
  );
  const { deactivateTeam, reactivateTeam } = useTeamMutations();

  const [targetTeam, setTargetTeam] = useState<TeamRegistrationRow | null>(
    null,
  );
  const [dialogMode, setDialogMode] = useState<"deactivate" | "reactivate">(
    "deactivate",
  );

  const handleToggleClick = (row: TeamRegistrationRow) => {
    setTargetTeam(row);
    setDialogMode(row.status === "ACTIVE" ? "deactivate" : "reactivate");
  };

  const handleConfirmDeactivate = async (reason: string, notes?: string) => {
    if (!targetTeam) return;
    await deactivateTeam.mutateAsync({
      teamId: targetTeam.teamId,
      payload: { reason, notes },
    });
    setTargetTeam(null);
  };

  const handleConfirmReactivate = async (notes?: string) => {
    if (!targetTeam) return;
    await reactivateTeam.mutateAsync({
      teamId: targetTeam.teamId,
      payload: { notes },
    });
    setTargetTeam(null);
  };

  const isSubmitting = deactivateTeam.isPending || reactivateTeam.isPending;

  const teamEntity: Team | null = targetTeam
    ? {
        id: targetTeam.teamId,
        teamCode: targetTeam.code,
        name: targetTeam.name,
        league: targetTeam.league as League,
        status: targetTeam.status,
        licensed: true,
        registrationsTotal: targetTeam.totalRegistrations,
        approvedCount: targetTeam.approvedCount,
        pendingCount: targetTeam.pendingCount,
        rejectedCount: targetTeam.rejectedCount,
        createdAt: "",
        updatedAt: "",
        updatedBy: "",
        initials: targetTeam.code,
      }
    : null;

  const columns: ColumnDef<TeamRegistrationRow>[] = [
    {
      key: "name",
      header: "Franchise & Team",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-[#9B7415] font-bold text-xs border border-slate-200">
            <Shield className="h-4 w-4" />
          </div>
          <div>
            <p className="font-bold text-slate-900">{row.name}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="font-mono text-[10px] text-slate-400 font-semibold">
                {row.code}
              </span>
              <span className="text-slate-300">•</span>
              <span className="rounded bg-slate-100 px-1.5 py-0.2 font-mono text-[10px] text-slate-600 font-bold">
                {row.league}
              </span>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "totalRegistrations",
      header: "Total Reg.",
      align: "center",
      render: (row) => (
        <span className="font-mono font-bold text-slate-900">
          {row.totalRegistrations}
        </span>
      ),
    },
    {
      key: "approvedCount",
      header: "Approved",
      align: "center",
      render: (row) => (
        <span className="font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
          {row.approvedCount}
        </span>
      ),
    },
    {
      key: "pendingCount",
      header: "Pending",
      align: "center",
      render: (row) => (
        <span className="font-mono font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
          {row.pendingCount}
        </span>
      ),
    },
    {
      key: "rejectedCount",
      header: "Rejected",
      align: "center",
      render: (row) => (
        <span className="font-mono font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
          {row.rejectedCount}
        </span>
      ),
    },
    {
      key: "status",
      header: "Team Status",
      render: (row) => (
        <div className="flex items-center gap-2">
          <Toggle
            size="sm"
            checked={row.status === "ACTIVE"}
            disabled={isSubmitting}
            onChange={() => handleToggleClick(row)}
            tooltip={`Click to ${row.status === "ACTIVE" ? "deactivate" : "activate"} ${row.name}`}
          />
          <span
            className={`text-xs font-semibold ${
              row.status === "ACTIVE" ? "text-emerald-700" : "text-slate-400"
            }`}
          >
            {row.status === "ACTIVE" ? "Active" : "Inactive"}
          </span>
        </div>
      ),
    },
    {
      key: "actions",
      header: "Action",
      align: "right",
      render: (row) => (
        <Button
          size="xs"
          variant="outline"
          onClick={() => navigate(buildTeamMembersRoute(row.teamId))}
        >
          View Team
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Catering & Access Rule Info Banner */}
      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-900">
        <Info className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-bold">Catering & Access Rule:</span> Individual
          meal eligibility requires active team status. Deactivating a team
          temporarily suspends cafeteria QR redemption for all member
          credentials without altering their verified approval state.
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <div className="w-full sm:w-64">
            <SearchInput
              value={filters.search}
              onChange={filters.setSearch}
              placeholder="Search team name or code..."
            />
          </div>

          <div className="w-full sm:w-36">
            <Select
              fullWidth
              value={filters.league}
              options={LEAGUE_OPTIONS}
              onChange={(e) => filters.setLeague(e.target.value)}
            />
          </div>

          <div className="w-full sm:w-36">
            <Select
              fullWidth
              value={filters.status}
              options={TEAM_STATUS_FILTER_OPTIONS}
              onChange={(e) => filters.setStatus(e.target.value)}
            />
          </div>
        </div>

        <Button
          size="sm"
          variant="ghost"
          onClick={() => refetch()}
          disabled={isFetching}
          leftIcon={
            <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
          }
        >
          Refresh
        </Button>
      </div>

      {/* Teams Data Table */}
      <DataTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        getId={(row) => row.id}
        emptyTitle="No Teams Found"
        emptyDescription="No tournament franchises match your filter criteria."
      />

      {/* Pagination */}
      {data && (
        <Pagination
          currentPage={data.pagination.page}
          totalPages={data.pagination.totalPages}
          totalItems={data.pagination.total}
          pageSize={data.pagination.pageSize}
          onPageChange={filters.setPage}
          onPageSizeChange={filters.setPageSize}
        />
      )}

      {/* Unified Deactivate & Reactivate Dialog */}
      <DeactivateTeamDialog
        isOpen={!!targetTeam}
        mode={dialogMode}
        team={teamEntity}
        onClose={() => setTargetTeam(null)}
        onConfirmDeactivate={handleConfirmDeactivate}
        onConfirmReactivate={handleConfirmReactivate}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default TeamsTab;
