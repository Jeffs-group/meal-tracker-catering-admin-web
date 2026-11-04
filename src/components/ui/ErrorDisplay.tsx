import React from "react";
import { AlertCircle, AlertTriangle, RefreshCw } from "lucide-react";
import { cn } from "@/utils/cn";
import { Button } from "@/components/ui/Button";

export interface ErrorDisplayProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  variant?: "inline" | "card" | "banner";
  severity?: "error" | "warning";
  className?: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  title,
  message = "An unexpected error occurred. Please try again.",
  onRetry,
  variant = "card",
  severity = "error",
  className,
}) => {
  const Icon = severity === "error" ? AlertCircle : AlertTriangle;
  const isError = severity === "error";

  if (variant === "inline") {
    return (
      <div
        role="alert"
        className={cn(
          "flex items-center gap-2 text-sm",
          isError ? "text-red-600" : "text-amber-600",
          className,
        )}
      >
        <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span>{message}</span>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="ml-2 font-medium underline hover:no-underline"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  if (variant === "banner") {
    return (
      <div
        role="alert"
        className={cn(
          "flex items-start justify-between rounded-lg border p-4",
          isError
            ? "border-red-200 bg-red-50 text-red-900"
            : "border-amber-200 bg-amber-50 text-amber-900",
          className,
        )}
      >
        <div className="flex items-start gap-3">
          <Icon
            className={cn(
              "mt-0.5 h-5 w-5 shrink-0",
              isError ? "text-red-600" : "text-amber-600",
            )}
            aria-hidden="true"
          />
          <div>
            {title && <h4 className="font-semibold">{title}</h4>}
            <p className="text-sm">{message}</p>
          </div>
        </div>
        {onRetry && (
          <Button
            size="sm"
            variant="outline"
            onClick={onRetry}
            leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
          >
            Retry
          </Button>
        )}
      </div>
    );
  }

  return (
    <div
      role="alert"
      className={cn(
        "shadow-xs flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-8 text-center",
        className,
      )}
    >
      <div
        className={cn(
          "mb-4 flex h-12 w-12 items-center justify-center rounded-full",
          isError ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600",
        )}
      >
        <Icon className="h-6 w-6" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900">
        {title || (isError ? "Something went wrong" : "Attention required")}
      </h3>
      <p className="mt-1 max-w-md text-sm text-slate-600">{message}</p>
      {onRetry && (
        <div className="mt-6">
          <Button
            variant="primary"
            size="sm"
            onClick={onRetry}
            leftIcon={<RefreshCw className="h-4 w-4" />}
          >
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
};
