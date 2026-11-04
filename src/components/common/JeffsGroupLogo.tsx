import React from "react";
import { cn } from "@/utils/cn";

export interface JeffsGroupLogoProps {
  className?: string;
  iconClassName?: string;
  showText?: boolean;
  theme?: "light" | "dark";
}

/**
 * Official Jeffs Group of Companies brand logo.
 */
export const JeffsGroupLogo: React.FC<JeffsGroupLogoProps> = ({
  className,
  iconClassName = "h-12 w-auto",
}) => {
  return (
    <div className={cn("inline-flex items-center", className)}>
      <img
        src="/jeffs-group-logo.png"
        alt="Jeffs Group of Companies"
        className={cn("object-contain rounded-lg", iconClassName)}
      />
    </div>
  );
};
