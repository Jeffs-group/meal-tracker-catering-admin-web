import React from "react";
import { Menu, Calendar } from "lucide-react";
import { getTodayFormatted } from "@/utils/formatDate";
import { Avatar } from "@/components/ui/Avatar";

export interface TopbarProps {
  onToggleSidebar: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onToggleSidebar }) => {
  const todayStr = getTodayFormatted();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 sm:px-6 backdrop-blur-xs">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 lg:hidden cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Season Live Badge */}
        <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/80 px-3 py-1 text-xs font-semibold text-emerald-800 shadow-2xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>Season 2026 Live</span>
        </div>

        {/* Date Chip */}
        <div className="hidden md:flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600">
          <Calendar className="h-3.5 w-3.5 text-slate-400" />
          <span>{todayStr}</span>
        </div>
      </div>

      {/* Right User & Org info */}
      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-xs font-bold text-slate-900 leading-tight">
            Jeffs Group Catering
          </p>
          <p className="text-[11px] text-slate-500">
            ISCL Official Admin Portal
          </p>
        </div>
        <Avatar
          name="Jeff Admin"
          size="sm"
          className="bg-[#FAF4E6] text-[#9B7415] border-[#ECD59A]"
        />
      </div>
    </header>
  );
};

export default Topbar;
