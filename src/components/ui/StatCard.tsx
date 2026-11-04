import React from "react";
import { cn } from "@/utils/cn";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { ProgressBar } from "./ProgressBar";

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: string | number;
    isPositive?: boolean;
    label?: string;
  };
  badgeText?: string;
  badgeVariant?: "success" | "warning" | "danger" | "neutral";
  progress?: {
    value: number; // percentage 0-100
    color?: "gold" | "emerald" | "amber" | "rose" | "slate";
  };
  icon?: React.ReactNode;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  badgeText,
  badgeVariant = "neutral",
  progress,
  icon,
  className,
}) => {
  const badgeClasses = {
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    danger: "bg-rose-50 text-rose-700 border-rose-200",
    neutral: "bg-slate-50 text-slate-600 border-slate-200",
  };

  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition-shadow hover:shadow-subtle",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
          {title}
        </p>
        {icon && <div className="text-slate-400">{icon}</div>}
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <h3 className="text-2xl font-bold tracking-tight text-slate-900">
          {value}
        </h3>

        {trend && (
          <span
            className={cn(
              "inline-flex items-center text-xs font-semibold",
              trend.isPositive ? "text-emerald-600" : "text-rose-600",
            )}
          >
            {trend.isPositive ? (
              <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" />
            ) : (
              <ArrowDownRight className="h-3.5 w-3.5 mr-0.5" />
            )}
            <span>{trend.value}</span>
          </span>
        )}

        {badgeText && (
          <span
            className={cn(
              "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium",
              badgeClasses[badgeVariant],
            )}
          >
            {badgeText}
          </span>
        )}
      </div>

      {progress && (
        <div className="mt-3">
          <ProgressBar
            value={progress.value}
            color={progress.color}
            size="sm"
          />
        </div>
      )}

      {subtitle && <p className="mt-2 text-xs text-slate-500">{subtitle}</p>}
    </div>
  );
};

export default StatCard;
