import React from "react";
import { DataTable, type ColumnDef } from "@/components/ui/DataTable";
import { StatusPill } from "@/components/ui/StatusPill";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { formatDateTimeIST } from "@/utils/formatDate";
import { Eye } from "lucide-react";
import type { TeamMemberRow } from "@/types/team.types";

export interface TeamMembersTableProps {
  data: TeamMemberRow[];
  isLoading: boolean;
  selectedIds: string[];
  onSelectRow: (id: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  onViewDetails: (id: string) => void;
}

export const TeamMembersTable: React.FC<TeamMembersTableProps> = ({
  data,
  isLoading,
  selectedIds,
  onSelectRow,
  onSelectAll,
  onViewDetails,
}) => {
  const columns: ColumnDef<TeamMemberRow>[] = [
    {
      key: "registrant",
      header: "Registrant",
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.name} src={row.avatarUrl} size="sm" />
          <div>
            <p className="font-semibold text-slate-900">{row.name}</p>
            <p className="font-mono text-[11px] text-slate-400">
              {row.registrationId}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "memberType",
      header: "Member Type",
      render: (row) => (
        <span className="inline-flex rounded-md bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700">
          {row.memberType}
        </span>
      ),
    },
    {
      key: "contact",
      header: "Contact Details",
      render: (row) => (
        <div>
          <p className="font-mono text-slate-800 text-xs">{row.contact}</p>
          <p className="font-mono text-[11px] text-slate-400 truncate max-w-[180px]">
            {row.email}
          </p>
        </div>
      ),
    },
    {
      key: "submittedAt",
      header: "Submitted On (IST)",
      render: (row) => (
        <span className="font-mono text-[11px] text-slate-600">
          {formatDateTimeIST(row.submittedAt)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusPill status={row.status} size="sm" />,
    },
    {
      key: "mealAccess",
      header: "Meal Access",
      render: (row) => (
        <span
          className={`inline-flex items-center gap-1 text-[11px] font-medium ${
            row.mealEligible ? "text-emerald-700" : "text-slate-400"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${row.mealEligible ? "bg-emerald-500" : "bg-slate-300"}`}
          />
          {row.mealEligible ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Details",
      align: "right",
      render: (row) => (
        <Button
          size="xs"
          variant="outline"
          onClick={() => onViewDetails(row.id)}
          leftIcon={<Eye className="h-3.5 w-3.5" />}
        >
          Details
        </Button>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      selectedIds={selectedIds}
      onSelectRow={onSelectRow}
      onSelectAll={onSelectAll}
      getId={(row) => row.id}
      emptyTitle="No team members found"
      emptyDescription="No registered members match the active filter criteria."
    />
  );
};

export default TeamMembersTable;
