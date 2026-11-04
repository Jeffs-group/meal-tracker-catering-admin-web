import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Shield } from "lucide-react";
import { StatusPill } from "@/components/ui/StatusPill";
import { Button } from "@/components/ui/Button";
import { buildTeamMembersRoute } from "@/constants/routes";
import type { TeamOverviewItem } from "@/types/dashboard.types";

export interface TeamOverviewTableProps {
  teams: TeamOverviewItem[];
}

export const TeamOverviewTable: React.FC<TeamOverviewTableProps> = ({
  teams,
}) => {
  const navigate = useNavigate();

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            Franchise & Team Overview
          </h3>
          <p className="text-xs text-slate-500">
            Live roster metrics across tournament leagues
          </p>
        </div>
        <Link
          to="/registrations?tab=teams"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#9B7415] hover:text-[#7D5C13] transition-colors"
        >
          <span>Manage Teams</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-left text-xs whitespace-nowrap">
          <thead className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-semibold uppercase tracking-wider text-slate-400 whitespace-nowrap">
            <tr>
              <th scope="col" className="px-5 py-3 whitespace-nowrap">
                Team Name
              </th>
              <th scope="col" className="px-4 py-3 whitespace-nowrap">
                League
              </th>
              <th scope="col" className="px-4 py-3 text-center whitespace-nowrap">
                Total Reg.
              </th>
              <th scope="col" className="px-4 py-3 text-center whitespace-nowrap">
                Approved
              </th>
              <th scope="col" className="px-4 py-3 text-center whitespace-nowrap">
                Pending
              </th>
              <th scope="col" className="px-4 py-3 whitespace-nowrap">
                Status
              </th>
              <th scope="col" className="px-5 py-3 text-right whitespace-nowrap">
                Roster
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700 whitespace-nowrap">
            {teams.map((team) => (
              <tr
                key={team.id}
                className="hover:bg-slate-50/60 transition-colors whitespace-nowrap"
              >
                <td className="px-5 py-3.5 font-medium text-slate-900 whitespace-nowrap">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-[#9B7415] font-bold text-xs border border-slate-200">
                      <Shield className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <p className="font-semibold">{team.name}</p>
                      <span className="font-mono text-[10px] text-slate-400 font-semibold">
                        {team.code}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3.5 whitespace-nowrap">
                  <span className="inline-flex rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-bold text-slate-700 font-mono">
                    {team.league}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-center font-bold text-slate-900 font-mono whitespace-nowrap">
                  {team.totalRegistrations}
                </td>
                <td className="px-4 py-3.5 text-center font-bold text-emerald-600 font-mono whitespace-nowrap">
                  {team.approvedCount}
                </td>
                <td className="px-4 py-3.5 text-center font-bold text-amber-600 font-mono whitespace-nowrap">
                  {team.pendingCount}
                </td>
                <td className="px-4 py-3.5 whitespace-nowrap">
                  <StatusPill status={team.status} size="sm" />
                </td>
                <td className="px-5 py-3.5 text-right whitespace-nowrap">
                  <Button
                    size="xs"
                    variant="outline"
                    onClick={() => navigate(buildTeamMembersRoute(team.teamId))}
                  >
                    View Team
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TeamOverviewTable;
