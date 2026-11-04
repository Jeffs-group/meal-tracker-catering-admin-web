import React from "react";
import { cn } from "@/utils/cn";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "rectangular" | "circular" | "text";
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = "rectangular",
  ...props
}) => {
  return (
    <div
      className={cn(
        "animate-pulse bg-slate-200/70",
        variant === "circular" && "rounded-full",
        variant === "text" && "h-4 rounded-md",
        variant === "rectangular" && "rounded-lg",
        className,
      )}
      {...props}
    />
  );
};

export default Skeleton;
