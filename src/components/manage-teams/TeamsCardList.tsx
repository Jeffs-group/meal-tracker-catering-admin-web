import React from "react";
import { Edit2 } from "lucide-react";
import { StatusPill } from "@/components/ui/StatusPill";
import { TeamRowMenu } from "./TeamRowMenu";
import type { Team } from "@/types/team.types";
import { cn } from "@/utils/cn";

export interface TeamsCardListProps {
  teams: Team[];
  onViewTeam: (teamId: string) => void;
  onEditTeam: (team: Team) => void;
  onDeactivateTeam: (team: Team) => void;
  onReactivateTeam: (team: Team) => void;
  isSuperAdmin?: boolean;
}

export const TeamsCardList: React.FC<TeamsCardListProps> = ({
  teams,
  onViewTeam,
  onEditTeam,
  onDeactivateTeam,
  onReactivateTeam,
  isSuperAdmin = true,
}) => {
  return (
    <div className="space-y-3 md:hidden">
      {teams.map((team) => {
        const isInactive = team.status === "INACTIVE";
        const approvedPct =
          team.registrationsTotal > 0
            ? Math.round((team.approvedCount / team.registrationsTotal) * 100)
            : 0;

        return (
          <div
            key={team.id}
            className={cn(
              "rounded-2xl border border-slate-200 bg-white p-4 shadow-xs transition-all",
              isInactive && "bg-slate-50/70 border-slate-200/80",
            )}
          >
            {/* Top row: Team Entity + Badges */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={cn(
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-bold text-sm shadow-2xs border",
                    isInactive
                      ? "bg-slate-200 text-slate-500 border-slate-300"
                      : "bg-slate-900 text-white border-slate-800",
                  )}
                >
                  {team.initials || team.name.slice(0, 2).toUpperCase()}
                </div>

                <div className="min-w-0">
                  <h4
                    className={cn(
                      "text-sm font-bold truncate leading-tight",
                      isInactive ? "text-slate-500" : "text-slate-900",
                    )}
                  >
                    {team.name}
                  </h4>
                  <p className="font-mono text-[11px] text-slate-400 font-semibold mt-0.5">
                    ID: {team.teamCode}
                  </p>
                </div>
              </div>

              {/* Status and League pills */}
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="inline-flex rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 font-mono">
                  {team.league}
                </span>
                <StatusPill status={team.status} size="sm" />
              </div>
            </div>

            {/* Middle row: Registrants & Verification Progress */}
            <div className="mt-3.5 pt-3 border-t border-slate-100/90 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Registrants</span>
                <span className="font-bold text-slate-900 font-mono text-sm">
                  {team.registrationsTotal}
                </span>
              </div>

              {/* Progress bar */}
              <div>
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="text-slate-500">Verification State</span>
                  <span className="font-semibold text-slate-700 font-mono">
                    {team.approvedCount} approved ({approvedPct}%)
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-300",
                      isInactive ? "bg-amber-500" : "bg-emerald-500",
                    )}
                    style={{ width: `${approvedPct}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Bottom Actions Row */}
            <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => onViewTeam(team.id)}
                className="text-xs font-semibold text-[#9B7415] hover:text-[#7D5C13] cursor-pointer"
              >
                View Roster →
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onEditTeam(team)}
                  disabled={!isSuperAdmin}
                  title={
                    !isSuperAdmin
                      ? "Superadmin privilege required"
                      : "Edit team"
                  }
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-800 disabled:opacity-40 transition-colors"
                >
                  <Edit2 className="h-4 w-4" />
                </button>

                <TeamRowMenu
                  team={team}
                  onViewTeam={onViewTeam}
                  onEditTeam={onEditTeam}
                  onDeactivateTeam={onDeactivateTeam}
                  onReactivateTeam={onReactivateTeam}
                  isSuperAdmin={isSuperAdmin}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TeamsCardList;

