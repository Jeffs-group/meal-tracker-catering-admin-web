import React, { useState } from "react";
import { StatusPill } from "@/components/ui/StatusPill";
import { Button } from "@/components/ui/Button";
import { DeactivateTeamDialog } from "@/components/manage-teams/DeactivateTeamDialog";
import { useTeamMutations } from "@/hooks/useTeamMutations";
import { Shield, Power } from "lucide-react";
import type { TeamDetail, Team } from "@/types/team.types";

export interface TeamHeaderProps {
  team: TeamDetail;
  onToggleStatus?: () => void;
  isToggling?: boolean;
}

export const TeamHeader: React.FC<TeamHeaderProps> = ({ team }) => {
  const [showDialog, setShowDialog] = useState(false);
  const { deactivateTeam, reactivateTeam } = useTeamMutations();

  const isActive = team.status === "ACTIVE";

  // Map TeamDetail to Team entity for DeactivateTeamDialog
  const teamEntity: Team = {
    id: team.id,
    teamCode: team.teamCode || team.code,
    name: team.name,
    league: team.league,
    status: team.status,
    licensed: !!team.licensed,
    registrationsTotal: team.stats.total,
    approvedCount: team.stats.approved,
    pendingCount: team.stats.pending,
    rejectedCount: team.stats.rejected,
    createdAt: "",
    updatedAt: team.updatedAt || "",
    updatedBy: team.updatedBy || "",
    initials: team.code,
  };

  const handleConfirmDeactivate = async (reason: string, notes?: string) => {
    await deactivateTeam.mutateAsync({
      teamId: team.id,
      payload: { reason, notes },
    });
    setShowDialog(false);
  };

  const handleConfirmReactivate = async (notes?: string) => {
    await reactivateTeam.mutateAsync({
      teamId: team.id,
      payload: { notes },
    });
    setShowDialog(false);
  };

  const isSubmitting = deactivateTeam.isPending || reactivateTeam.isPending;

  return (
    <>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          {/* Left: Logo Tile & Details */}
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#DEC067] to-[#C9A227] text-white shadow-md font-bold text-xl border-2 border-white">
              <Shield className="h-8 w-8 text-slate-900" />
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                  {team.name}
                </h1>
                <span className="rounded-md border border-slate-300 bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-800 font-mono">
                  {team.league}
                </span>
                <StatusPill status={team.status} size="md" />
              </div>

              <div className="mt-1 flex items-center gap-3 text-xs text-slate-500 font-mono">
                <span>Franchise ID: {team.franchiseId}</span>
                <span>•</span>
                <span>Team Code: #{team.teamCode || team.code}</span>
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            <Button
              variant={isActive ? "destructive" : "primary"}
              size="sm"
              onClick={() => setShowDialog(true)}
              isLoading={isSubmitting}
              leftIcon={<Power className="h-4 w-4" />}
            >
              {isActive ? "Deactivate Team" : "Activate Team"}
            </Button>
          </div>
        </div>
      </div>

      {/* Unified Deactivate & Reactivate Dialog */}
      <DeactivateTeamDialog
        isOpen={showDialog}
        mode={isActive ? "deactivate" : "reactivate"}
        team={teamEntity}
        onClose={() => setShowDialog(false)}
        onConfirmDeactivate={handleConfirmDeactivate}
        onConfirmReactivate={handleConfirmReactivate}
        isSubmitting={isSubmitting}
      />
    </>
  );
};

export default TeamHeader;
