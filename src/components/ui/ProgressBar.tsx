import React from "react";
import { cn } from "@/utils/cn";

export interface ProgressBarProps {
  value: number; // 0 - 100
  max?: number;
  color?: "gold" | "emerald" | "amber" | "rose" | "slate" | "indigo";
  size?: "xs" | "sm" | "md";
  className?: string;
  showLabel?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  color = "gold",
  size = "sm",
  className,
  showLabel = false,
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const colorStyles = {
    gold: "bg-[#C9A227]",
    emerald: "bg-emerald-500",
    amber: "bg-amber-500",
    rose: "bg-rose-500",
    slate: "bg-slate-500",
    indigo: "bg-indigo-600",
  };

  const sizeStyles = {
    xs: "h-1.5",
    sm: "h-2",
    md: "h-3",
  };

  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="mb-1 flex justify-between text-xs text-slate-600">
          <span>Progress</span>
          <span className="font-semibold">{Math.round(percentage)}%</span>
        </div>
      )}
      <div
        className={cn(
          "w-full overflow-hidden rounded-full bg-slate-100",
          sizeStyles[size],
        )}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            colorStyles[color],
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
