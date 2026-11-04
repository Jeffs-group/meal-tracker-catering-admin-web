import React from "react";
import { cn } from "@/utils/cn";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";

export interface ReportCardListProps<T> {
  data: T[];
  isLoading?: boolean;
  renderCard: (item: T, index: number) => React.ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  onClearFilters?: () => void;
  className?: string;
}

export function ReportCardList<T>({
  data,
  isLoading = false,
  renderCard,
  emptyTitle = "No records found",
  emptyDescription = "No records match the applied filters.",
  onClearFilters,
  className,
}: ReportCardListProps<T>) {
  if (isLoading) {
    return (
      <div className={cn("space-y-3 md:hidden", className)}>
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-slate-200 bg-white p-4 space-y-3"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-full" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="md:hidden">
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
          actionLabel={onClearFilters ? "Clear Filters" : undefined}
          onAction={onClearFilters}
        />
      </div>
    );
  }

  return (
    <div className={cn("space-y-3 md:hidden", className)}>
      {data.map((item, index) => (
        <div key={index}>{renderCard(item, index)}</div>
      ))}
    </div>
  );
}

