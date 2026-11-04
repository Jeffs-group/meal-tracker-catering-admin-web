import React from "react";
import { cn } from "@/utils/cn";
import type { League } from "@/constants/leagues";

export interface LeaguePillProps {
  league?: League | string;
  size?: "sm" | "md";
  className?: string;
}

export const LeaguePill: React.FC<LeaguePillProps> = ({
  league,
  size = "sm",
  className,
}) => {
  if (!league) return <span className="text-slate-400">—</span>;

  const isKspl = String(league).toUpperCase() === "KSPL";

  return (
    <span
      className={cn(
        "inline-flex items-center font-mono font-semibold rounded-md border tracking-wide uppercase",
        size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-xs",
        isKspl
          ? "bg-[#FAF4E6] text-[#7D5C13] border-[#ECD59A]"
          : "bg-slate-100 text-slate-700 border-slate-200",
        className,
      )}
    >
      {league}
    </span>
  );
};

