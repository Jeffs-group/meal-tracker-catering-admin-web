import React from "react";
import { cn } from "@/utils/cn";

export interface TypePillProps {
  type: "TEAM" | "STAFF" | "ORGANIZER" | string;
  className?: string;
}

export const TypePill: React.FC<TypePillProps> = ({ type, className }) => {
  const upper = String(type).toUpperCase();

  const typeConfig: Record<
    string,
    { label: string; bg: string; text: string; border: string }
  > = {
    TEAM: {
      label: "Team",
      bg: "bg-blue-50",
      text: "text-blue-700",
      border: "border-blue-200",
    },
    STAFF: {
      label: "Staff",
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200",
    },
    ORGANIZER: {
      label: "Organizer",
      bg: "bg-purple-50",
      text: "text-purple-700",
      border: "border-purple-200",
    },
  };

  const config = typeConfig[upper] || {
    label: type,
    bg: "bg-slate-100",
    text: "text-slate-700",
    border: "border-slate-200",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border",
        config.bg,
        config.text,
        config.border,
        className,
      )}
    >
      {config.label}
    </span>
  );
};

