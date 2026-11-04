import React from "react";
import { cn } from "@/utils/cn";

export interface TeamTileProps {
  name: string;
  code?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const TeamTile: React.FC<TeamTileProps> = ({
  name,
  code,
  size = "md",
  className,
}) => {
  const initials = code || name.slice(0, 2).toUpperCase();

  const sizeClasses = {
    sm: "h-7 w-7 text-[11px]",
    md: "h-8 w-8 text-xs",
    lg: "h-10 w-10 text-sm",
  };

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-lg bg-[#111111] font-mono font-bold text-[#DEC067] border border-[#282828] shadow-2xs select-none",
        sizeClasses[size],
        className,
      )}
      title={name}
      aria-label={name}
    >
      {initials}
    </div>
  );
};

