import React from "react";
import { cn } from "@/utils/cn";
import { useSyncStatus } from "@/hooks/useCatering";

export interface SyncStatusChipProps {
  lastUpdatedAt?: number;
  className?: string;
}

export const SyncStatusChip: React.FC<SyncStatusChipProps> = ({
  lastUpdatedAt,
  className,
}) => {
  const sync = useSyncStatus(lastUpdatedAt);

  const colorStyles = {
    green: {
      badge: "border-emerald-200 bg-emerald-50 text-emerald-800",
      dot: "bg-emerald-500",
      ping: "bg-emerald-400",
    },
    amber: {
      badge: "border-amber-200 bg-amber-50 text-amber-800",
      dot: "bg-amber-500",
      ping: "bg-amber-400",
    },
    red: {
      badge: "border-rose-200 bg-rose-50 text-rose-800",
      dot: "bg-rose-500",
      ping: "bg-rose-400",
    },
  }[sync.color];

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-semibold shadow-2xs select-none",
        colorStyles.badge,
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <span className="relative flex h-2 w-2">
        {sync.status === "live" && (
          <span
            className={cn(
              "absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping",
              colorStyles.ping,
            )}
          />
        )}
        <span
          className={cn("relative inline-flex h-2 w-2 rounded-full", colorStyles.dot)}
        />
      </span>
      <span className="hidden sm:inline">{sync.label}</span>
      <span className="sm:hidden">{sync.status === "live" ? "Live" : sync.label}</span>
    </div>
  );
};

export default SyncStatusChip;

