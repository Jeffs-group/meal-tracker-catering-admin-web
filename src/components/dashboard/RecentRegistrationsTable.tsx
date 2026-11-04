import React from "react";
import { Link } from "react-router-dom";
import { Eye, ArrowRight } from "lucide-react";
import { StatusPill } from "@/components/ui/StatusPill";
import { Avatar } from "@/components/ui/Avatar";
import { formatDateShort } from "@/utils/formatDate";
import { ROUTES } from "@/constants/routes";
import type { RecentRegistrationItem } from "@/types/dashboard.types";

export interface RecentRegistrationsTableProps {
  items: RecentRegistrationItem[];
  onReviewRegistrant: (id: string) => void;
}

export const RecentRegistrationsTable: React.FC<
  RecentRegistrationsTableProps
> = ({ items, onReviewRegistrant }) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            Recent Registrations
          </h3>
          <p className="text-xs text-slate-500">
            Latest submissions requiring monitoring or verification
          </p>
        </div>
        <Link
          to={ROUTES.REGISTRATIONS}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#9B7415] hover:text-[#7D5C13] transition-colors"
        >
          <span>View All</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-left text-xs whitespace-nowrap">
          <thead className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-semibold uppercase tracking-wider text-slate-400 whitespace-nowrap">
            <tr>
              <th scope="col" className="px-5 py-3 whitespace-nowrap">
                Registrant
              </th>
              <th scope="col" className="px-4 py-3 whitespace-nowrap">
                Type
              </th>
              <th scope="col" className="px-4 py-3 whitespace-nowrap">
                Team / Org
              </th>
              <th scope="col" className="px-4 py-3 whitespace-nowrap">
                Role
              </th>
              <th scope="col" className="px-4 py-3 whitespace-nowrap">
                Submitted
              </th>
              <th scope="col" className="px-4 py-3 whitespace-nowrap">
                Status
              </th>
              <th scope="col" className="px-4 py-3 text-right whitespace-nowrap">
                Review
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700 whitespace-nowrap">
            {items.map((item) => (
              <tr
                key={item.id}
                className="hover:bg-slate-50/60 transition-colors whitespace-nowrap"
              >
                <td className="px-5 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <Avatar
                      name={item.registrantName}
                      src={item.avatarUrl}
                      size="sm"
                    />
                    <div>
                      <p className="font-semibold text-slate-900">
                        {item.registrantName}
                      </p>
                      <p className="font-mono text-[11px] text-slate-400">
                        {item.registrationId}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="inline-flex rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                    {item.registrantType}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium text-slate-800 whitespace-nowrap">
                  {item.teamName}
                </td>
                <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{item.memberType}</td>
                <td className="px-4 py-3 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                  {formatDateShort(item.submittedAt)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <StatusPill status={item.status} size="sm" />
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => onReviewRegistrant(item.id)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
                    aria-label={`Review ${item.registrantName}`}
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentRegistrationsTable;
