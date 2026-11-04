import React from "react";
import { Trophy, Shield, Check } from "lucide-react";
import { cn } from "@/utils/cn";
import { LEAGUE_CONFIG, type League } from "@/constants/leagues";

export interface LeagueOptionCardProps {
  league: League;
  selected: boolean;
  onSelect: (league: League) => void;
  disabled?: boolean;
}

export const LeagueOptionCard: React.FC<LeagueOptionCardProps> = ({
  league,
  selected,
  onSelect,
  disabled = false,
}) => {
  const config = LEAGUE_CONFIG[league];
  const IconComponent = league === "KSPL" ? Trophy : Shield;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      onSelect(league);
    }
  };

  return (
    <div
      role="radio"
      aria-checked={selected}
      tabIndex={disabled ? -1 : 0}
      onClick={() => !disabled && onSelect(league)}
      onKeyDown={handleKeyDown}
      className={cn(
        "relative flex items-start gap-3.5 rounded-xl border p-3.5 transition-all cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-[#C9A227] focus-visible:ring-offset-1",
        selected
          ? "border-[#C9A227] bg-[#FAF4E6]/50 shadow-2xs"
          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60",
        disabled && "opacity-50 cursor-not-allowed",
      )}
    >
      {/* Icon Tile */}
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border text-sm font-bold transition-colors",
          selected
            ? "border-[#ECD59A] bg-[#DEC067]/20 text-[#9B7415]"
            : "border-slate-200 bg-slate-100 text-slate-600",
        )}
      >
        <IconComponent className="h-5 w-5" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pr-6">
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
            {config.shortName}
          </span>
          <span className="text-slate-400 text-xs hidden sm:inline">•</span>
          <span className="text-[11px] font-medium text-slate-500 hidden sm:inline truncate">
            {config.fullName}
          </span>
        </div>
        <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
          {config.description}
        </p>
      </div>

      {/* Radio indicator */}
      <div
        className={cn(
          "absolute right-3.5 top-3.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-all",
          selected
            ? "border-[#C9A227] bg-[#C9A227] text-white"
            : "border-slate-300 bg-white",
        )}
      >
        {selected && <Check className="h-2.5 w-2.5 stroke-[3]" />}
      </div>
    </div>
  );
};

export default LeagueOptionCard;

