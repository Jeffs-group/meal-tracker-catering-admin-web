import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/utils/cn";

export interface LoadingIndicatorProps {
  size?: "sm" | "md" | "lg" | "xl";
  label?: string;
  fullScreen?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
  xl: "h-12 w-12",
};

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  size = "md",
  label = "Loading...",
  fullScreen = false,
  className,
}) => {
  const content = (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex flex-col items-center justify-center gap-3 text-slate-600",
        className,
      )}
    >
      <Loader2
        className={cn("animate-spin text-primary-600", sizeClasses[size])}
        aria-hidden="true"
      />
      {label && (
        <span className="text-sm font-medium text-slate-600">{label}</span>
      )}
      <span className="sr-only">{label}</span>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="backdrop-blur-xs fixed inset-0 z-50 flex items-center justify-center bg-white/80">
        {content}
      </div>
    );
  }

  return content;
};
