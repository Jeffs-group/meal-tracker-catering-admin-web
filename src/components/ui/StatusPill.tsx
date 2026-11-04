import React from "react";
import { cn } from "@/utils/cn";
import {
  REGISTRATION_STATUS_CONFIG,
  TEAM_STATUS_CONFIG,
} from "@/constants/status";
import type { RegistrationStatus, TeamStatus } from "@/types/common.types";

export interface StatusPillProps {
  status: RegistrationStatus | TeamStatus | string;
  size?: "sm" | "md";
  className?: string;
  dotOnly?: boolean;
}

export const StatusPill: React.FC<StatusPillProps> = ({
  status,
  size = "sm",
  className,
  dotOnly = false,
}) => {
  const upper = String(status).toUpperCase();

  const config = REGISTRATION_STATUS_CONFIG[upper as RegistrationStatus] ||
    TEAM_STATUS_CONFIG[upper as TeamStatus] || {
      label: status,
      bg: "bg-slate-100",
      text: "text-slate-700",
      border: "border-slate-200",
      dot: "bg-slate-400",
    };

  if (dotOnly) {
    return (
      <span
        className={cn(
          "inline-block h-2 w-2 rounded-full",
          config.dot,
          className,
        )}
        title={config.label}
      />
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-medium rounded-full border",
        config.bg,
        config.text,
        config.border,
        size === "sm" ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-xs",
        className,
      )}
    >
      <span
        className={cn("h-1.5 w-1.5 rounded-full shrink-0", config.dot)}
        aria-hidden="true"
      />
      <span>{config.label}</span>
    </span>
  );
};

export default StatusPill;
