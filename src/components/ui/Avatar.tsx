import React from "react";
import { cn } from "@/utils/cn";

export interface AvatarProps {
  name: string;
  src?: string;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  src,
  size = "sm",
  className,
}) => {
  const sizeClasses = {
    xs: "h-6 w-6 text-[10px]",
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
  };

  const getInitials = (n: string) => {
    const parts = n.trim().split(/\s+/);
    if (parts.length === 1) return parts[0]?.slice(0, 2).toUpperCase() || "";
    return (
      (parts[0]?.[0] || "") + (parts[parts.length - 1]?.[0] || "")
    ).toUpperCase();
  };

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn(
          "rounded-full object-cover shrink-0 border border-slate-200",
          sizeClasses[size],
          className,
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center font-bold text-slate-700 bg-slate-100 rounded-full shrink-0 select-none border border-slate-200",
        sizeClasses[size],
        className,
      )}
      aria-label={name}
    >
      {getInitials(name)}
    </div>
  );
};

export default Avatar;
