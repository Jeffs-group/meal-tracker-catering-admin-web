import React from "react";
import { Coffee, Utensils, Moon } from "lucide-react";
import { cn } from "@/utils/cn";
import { formatIST12h } from "@/utils/cateringClock";
import type { MealPeriodConfig, PeriodState } from "@/types/catering.types";

export interface PeriodCardProps {
  period: MealPeriodConfig;
  state: PeriodState;
  mealsProvided?: number;
  isSelected?: boolean;
  onClick?: () => void;
  className?: string;
}

export const PeriodCard: React.FC<PeriodCardProps> = ({
  period,
  state,
  mealsProvided = 0,
  isSelected,
  onClick,
  className,
}) => {
  const getPeriodIcon = () => {
    if (period.key === "breakfast" || period.key === "meal1") return <Coffee className="h-5 w-5" />;
    if (period.key === "lunch" || period.key === "meal2") return <Utensils className="h-5 w-5" />;
    if (period.key === "dinner" || period.key === "meal3") return <Moon className="h-5 w-5" />;
    return <Utensils className="h-5 w-5" />;
  };

  const accentStyles = {
    live: "border-t-4 border-t-[#C9A227]",
    closed: "border-t-4 border-t-slate-300",
    upcoming: "border-t-4 border-t-amber-400",
    disabled: "border-t-4 border-t-slate-200 opacity-60",
  }[state];

  const statusBadge = {
    live: {
      bg: "bg-emerald-50 text-emerald-800 border-emerald-200",
      dot: "bg-emerald-500",
      text: period.start && period.end ? "Active Service Window" : "Active for Service",
    },
    upcoming: {
      bg: "bg-amber-50 text-amber-800 border-amber-200",
      dot: "bg-amber-500",
      text: period.start ? `Upcoming • Opens at ${formatIST12h(period.start)}` : "Upcoming",
    },
    closed: {
      bg: "bg-slate-100 text-slate-700 border-slate-200",
      dot: "bg-slate-400",
      text: period.end ? `Window Closed at ${formatIST12h(period.end)}` : "Closed",
    },
    disabled: {
      bg: "bg-slate-100 text-slate-500 border-slate-200",
      dot: "bg-slate-300",
      text: "Not Served Today",
    },
  }[state];

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all",
        accentStyles,
        onClick && "cursor-pointer hover:shadow-subtle hover:border-slate-300",
        isSelected && "ring-2 ring-[#C9A227] shadow-sm",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl border shrink-0",
              state === "live"
                ? "border-[#ECD59A] bg-[#FAF4E6] text-[#9B7415]"
                : "border-slate-200 bg-slate-50 text-slate-600",
            )}
          >
            {getPeriodIcon()}
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-900 leading-tight">
              {period.label}
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">{period.subtitle}</p>
          </div>
        </div>

        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold shrink-0 select-none",
            statusBadge.bg,
          )}
        >
          <span className={cn("h-1.5 w-1.5 rounded-full", statusBadge.dot)} />
          <span>{statusBadge.text}</span>
        </span>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <div>
          <span className="text-slate-400 text-[11px] block">Service Schedule</span>
          <span className="font-semibold text-slate-800">
            {period.start && period.end ? `${formatIST12h(period.start)} – ${formatIST12h(period.end)}` : "Flexible Service"}
          </span>
        </div>

        <div className="text-right">
          <span className="text-slate-400 text-[11px] block">Meals Provided</span>
          <span className="font-bold text-slate-900 text-sm">
            {mealsProvided} meals
          </span>
        </div>
      </div>
    </div>
  );
};

export default PeriodCard;
