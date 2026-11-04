import React from "react";
import { Check, X, AlertCircle } from "lucide-react";
import { cn } from "@/utils/cn";
import { MEAL_REASON_META } from "@/utils/mealEligibility";
import type { MealEligibilityReason } from "@/types/reports.types";

export interface MealAccessPillProps {
  reason: MealEligibilityReason;
  className?: string;
}

export const MealAccessPill: React.FC<MealAccessPillProps> = ({
  reason,
  className,
}) => {
  const meta = MEAL_REASON_META[reason] || {
    label: "Not eligible",
    subtext: "Inactive",
    badgeVariant: "neutral",
  };

  const isEligible = reason === "eligible";

  return (
    <div className={cn("inline-flex flex-col items-start gap-0.5", className)}>
      <span
        className={cn(
          "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border",
          isEligible
            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
            : reason === "unapproved"
              ? "bg-rose-50 text-rose-700 border-rose-200"
              : "bg-slate-100 text-slate-700 border-slate-200",
        )}
      >
        {isEligible ? (
          <Check className="h-3 w-3 stroke-[2.5]" aria-hidden="true" />
        ) : reason === "unapproved" ? (
          <X className="h-3 w-3 stroke-[2.5]" aria-hidden="true" />
        ) : (
          <AlertCircle className="h-3 w-3" aria-hidden="true" />
        )}
        <span>{meta.label}</span>
      </span>
      <span className="text-[10px] text-slate-500 font-medium pl-1">
        {meta.subtext}
      </span>
    </div>
  );
};

