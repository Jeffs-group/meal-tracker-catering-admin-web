import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { TeamHeader } from "@/components/teams/TeamHeader";
import { MemberTypeTabs } from "@/components/teams/MemberTypeTabs";
import { TeamMembersTable } from "@/components/teams/TeamMembersTable";
import { StatCard } from "@/components/ui/StatCard";
import { SearchInput } from "@/components/ui/SearchInput";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import { BatchActionsMenu } from "@/components/registrations/BatchActionsMenu";
import { RegistrantReviewModal } from "@/components/registrations/RegistrantReviewModal";
import { ErrorDisplay } from "@/components/ui/ErrorDisplay";
import {
  useTeamDetail,
  useTeamMembers,
  useToggleTeamStatus,
} from "@/hooks/useTeamMembers";
import { useTableFilters } from "@/hooks/useTableFilters";
import { STATUS_FILTER_OPTIONS } from "@/constants/status";
import { exportToCsv } from "@/utils/exportCsv";
import {
  Users,
  CheckCircle2,
  Clock,
  XCircle,
  Download,
  ArrowLeft,
  RotateCcw,
} from "lucide-react";

export const TeamMembersPage: React.FC = () => {
  const { teamId = "chennai-kings" } = useParams<{ teamId: string }>();
  const navigate = useNavigate();

  const filters = useTableFilters({ pageSize: 10, memberType: "ALL" });
  const {
    data: team,
    isLoading: teamLoading,
    isError: teamError,
    refetch: refetchTeam,
  } = useTeamDetail(teamId);
  const { data: membersResult, isLoading: membersLoading } = useTeamMembers(
    teamId,
    filters.queryParams,
  );
  const toggleTeamMutation = useToggleTeamStatus();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [reviewId, setReviewId] = useState<string | null>(null);

  const membersList = membersResult?.data ?? [];

  const handleSelectRow = (id: string, selected: boolean) => {
    setSelectedIds((prev) =>
      selected ? [...prev, id] : prev.filter((item) => item !== id),
    );
  };

  const handleSelectAll = (selected: boolean) => {
    setSelectedIds(selected ? membersList.map((m) => m.id) : []);
  };

  const handleExportRoster = () => {
    const rowsToExport = membersList.filter((m) => selectedIds.includes(m.id));
    exportToCsv(
      `${team?.name || "Team"}_Roster`,
      rowsToExport.length > 0 ? rowsToExport : membersList,
      [
        { header: "Registration ID", accessor: (r) => r.registrationId },
        { header: "Full Name", accessor: (r) => r.name },
        { header: "Member Type", accessor: (r) => r.memberType },
        { header: "Contact", accessor: (r) => r.contact },
        { header: "Email", accessor: (r) => r.email },
        { header: "Status", accessor: (r) => r.status },
        {
          header: "Meal Eligible",
          accessor: (r) => (r.mealEligible ? "Active" : "Inactive"),
        },
        { header: "Submitted At", accessor: (r) => r.submittedAt },
      ],
    );
  };

  if (teamError) {
    return (
      <div className="py-12">
        <ErrorDisplay
          title="Team Not Found"
          message="The requested franchise team roster could not be loaded."
          onRetry={() => refetchTeam()}
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={team?.name || "Team Member Management"}
        description="Roster accreditation, accreditation badges, and dining hall QR codes for team delegation."
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Registrations", href: "/registrations?tab=teams" },
          { label: team?.name || "Team Members" },
        ]}
        actions={
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate("/registrations?tab=teams")}
            leftIcon={<ArrowLeft className="h-4 w-4" />}
          >
            Back to Teams
          </Button>
        }
      />

      {/* Team Header Card */}
      {team && (
        <TeamHeader
          team={team}
          onToggleStatus={() => toggleTeamMutation.mutate(team.id)}
          isToggling={toggleTeamMutation.isPending}
        />
      )}

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Registrations"
          value={team?.stats.total ?? 0}
          progress={{
            value: team ? (team.stats.total / team.stats.maxCap) * 100 : 0,
            color: "gold",
          }}
          subtitle={`Max Roster Cap: ${team?.stats.maxCap ?? 30} slots`}
          icon={<Users className="h-5 w-5 text-slate-400" />}
        />

        <StatCard
          title="Approved (Meal-Eligible)"
          value={team?.stats.approved ?? 0}
          progress={{
            value: team?.stats.approvedPercentage ?? 0,
            color: "emerald",
          }}
          subtitle={`${team?.stats.approvedPercentage ?? 0}% of delegation`}
          icon={<CheckCircle2 className="h-5 w-5 text-emerald-500" />}
        />

        <StatCard
          title="Pending Approvals"
          value={team?.stats.pending ?? 0}
          badgeText="Requires Action"
          badgeVariant="warning"
          subtitle="Awaiting administrative check"
          icon={<Clock className="h-5 w-5 text-amber-500" />}
        />

        <StatCard
          title="Rejected / Ineligible"
          value={team?.stats.rejected ?? 0}
          progress={{
            value: team?.stats.rejectedPercentage ?? 0,
            color: "rose",
          }}
          subtitle={`${team?.stats.rejectedPercentage ?? 0}% disqualified`}
          icon={<XCircle className="h-5 w-5 text-rose-500" />}
        />
      </div>

      {/* Member Type Tabs Filter */}
      {team && (
        <div className="mb-4">
          <MemberTypeTabs
            activeType={filters.memberType}
            onChange={filters.setMemberType}
            counts={team.memberCountsByType}
          />
        </div>
      )}

      {/* Filter and Action Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-xs mb-4">
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <SearchInput
            value={filters.rawSearch}
            onChange={filters.setSearch}
            placeholder="Search name, ID, contact..."
          />
          <Select
            options={STATUS_FILTER_OPTIONS}
            value={filters.status}
            onChange={(e) => filters.setStatus(e.target.value)}
          />
          <Select
            options={[
              { value: "submittedAt", label: "Latest Submission" },
              { value: "name", label: "Name Alphabetical" },
            ]}
            value={filters.sortBy}
            onChange={(e) => filters.setSortBy(e.target.value)}
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
            onClick={handleExportRoster}
            leftIcon={<Download className="h-3.5 w-3.5" />}
          >
            Export Roster (CSV)
          </Button>
        </div>
      </div>

      {/* Team Members Table */}
      <TeamMembersTable
        data={membersList}
        isLoading={membersLoading || teamLoading}
        selectedIds={selectedIds}
        onSelectRow={handleSelectRow}
        onSelectAll={handleSelectAll}
        onViewDetails={(id) => setReviewId(id)}
      />

      {/* Pagination */}
      {membersResult && (
        <Pagination
          currentPage={membersResult.pagination.page}
          totalPages={membersResult.pagination.totalPages}
          totalItems={membersResult.pagination.total}
          pageSize={membersResult.pagination.pageSize}
          onPageChange={filters.setPage}
          onPageSizeChange={filters.setPageSize}
        />
      )}

      {/* Floating Batch Actions Bar */}
      <BatchActionsMenu
        selectedCount={selectedIds.length}
        onExportSelected={handleExportRoster}
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

export default TeamMembersPage;
