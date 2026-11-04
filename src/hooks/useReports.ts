import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { useState } from "react";
import { reportsApi } from "@/api/reports.api";
import {
  exportReportToCsv,
  exportReportToExcel,
  type ExportColumn,
} from "@/utils/exportReport";
import { usePermissions } from "@/hooks/usePermissions";
import type {
  ReportKey,
  ReportFilters,
  ExportFormat,
} from "@/types/reports.types";

/**
 * 1. Reports Hub Summary Hook
 */
export function useReportsHub() {
  return useQuery({
    queryKey: ["reports", "hub"],
    queryFn: () => reportsApi.getHubSummary(),
    staleTime: 60 * 1000,
  });
}

/**
 * 2. Registration Report Hooks (Separate Summary and Rows)
 */
export function useRegistrationReportSummary(filters: ReportFilters) {
  // Strip pagination and sort so summary doesn't re-trigger on page changes
  const { page: _p, pageSize: _ps, sortBy: _sb, sortOrder: _so, ...summaryFilters } = filters;
  return useQuery({
    queryKey: ["reports", "registration", "summary", summaryFilters],
    queryFn: () => reportsApi.getRegistrationSummary(summaryFilters),
    staleTime: 30 * 1000,
  });
}

export function useRegistrationReportRows(filters: ReportFilters) {
  return useQuery({
    queryKey: ["reports", "registration", "rows", filters],
    queryFn: () => reportsApi.getRegistrationRows(filters),
    placeholderData: keepPreviousData,
  });
}

/**
 * 3. Team-wise Report Hooks (Separate Summary and Rows)
 */
export function useTeamReportSummary(filters: ReportFilters) {
  const { page: _p, pageSize: _ps, sortBy: _sb, sortOrder: _so, ...summaryFilters } = filters;
  return useQuery({
    queryKey: ["reports", "team", "summary", summaryFilters],
    queryFn: () => reportsApi.getTeamSummary(summaryFilters),
    staleTime: 30 * 1000,
  });
}

export function useTeamReportRows(filters: ReportFilters) {
  return useQuery({
    queryKey: ["reports", "team", "rows", filters],
    queryFn: () => reportsApi.getTeamRows(filters),
    placeholderData: keepPreviousData,
  });
}

/**
 * 4. Staff & Organizer Report Hooks (Separate Summary and Rows)
 */
export function useStaffOrganizerReportSummary(filters: ReportFilters) {
  const { page: _p, pageSize: _ps, sortBy: _sb, sortOrder: _so, ...summaryFilters } = filters;
  return useQuery({
    queryKey: ["reports", "staff-organizer", "summary", summaryFilters],
    queryFn: () => reportsApi.getStaffOrganizerSummary(summaryFilters),
    staleTime: 30 * 1000,
  });
}

export function useStaffOrganizerReportRows(filters: ReportFilters) {
  return useQuery({
    queryKey: ["reports", "staff-organizer", "rows", filters],
    queryFn: () => reportsApi.getStaffOrganizerRows(filters),
    placeholderData: keepPreviousData,
  });
}

/**
 * 5. Meal Eligibility Report Hooks (Separate Summary and Rows)
 */
export function useMealEligibilityReportSummary(filters: ReportFilters) {
  const { page: _p, pageSize: _ps, sortBy: _sb, sortOrder: _so, ...summaryFilters } = filters;
  return useQuery({
    queryKey: ["reports", "meal-eligibility", "summary", summaryFilters],
    queryFn: () => reportsApi.getMealEligibilitySummary(summaryFilters),
    staleTime: 30 * 1000,
  });
}

export function useMealEligibilityReportRows(filters: ReportFilters) {
  return useQuery({
    queryKey: ["reports", "meal-eligibility", "rows", filters],
    queryFn: () => reportsApi.getMealEligibilityRows(filters),
    placeholderData: keepPreviousData,
  });
}

/**
 * 6. Batch Print Catering Tokens Hook
 */
export function useBatchPrintCateringTokens() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (filters: ReportFilters) =>
      reportsApi.batchPrintCateringTokens(filters),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
}

/**
 * 7. Unified Export Pipeline Hook
 */
export interface UseReportExportOptions<T> {
  key: ReportKey;
  slug: string;
  sheetTitle: string;
  columns: ExportColumn<T>[];
  fetchAllRows: (filters: ReportFilters) => Promise<T[]>;
}

export function useReportExport<T>({
  key,
  slug,
  sheetTitle,
  columns,
  fetchAllRows,
}: UseReportExportOptions<T>) {
  const [isExporting, setIsExporting] = useState(false);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const { can } = usePermissions();

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleExport = async (format: ExportFormat, filters: ReportFilters) => {
    if (!can("reports", "view")) {
      showToast("error", "Unauthorized: You do not have permission to export reports.");
      return;
    }

    try {
      setIsExporting(true);
      // Fetch all matching rows (not just visible page)
      const allRows = await fetchAllRows(filters);

      if (!allRows || allRows.length === 0) {
        showToast("error", "No records found matching the applied filters to export.");
        setIsExporting(false);
        return;
      }

      if (format === "csv") {
        exportReportToCsv(slug, allRows, columns);
      } else {
        await exportReportToExcel(
          slug,
          sheetTitle,
          allRows,
          columns,
          filters as Record<string, string | number | undefined | null>,
        );
      }

      // Notify mock API / server audit log
      await reportsApi.exportReport(key, format, filters).catch(() => {});

      showToast(
        "success",
        `Export successful: Downloaded ${allRows.length} records in ${format.toUpperCase()} format.`,
      );
    } catch (err) {
      console.error("Export error:", err);
      showToast("error", "Failed to generate report export. Please retry.");
    } finally {
      setIsExporting(false);
    }
  };

  return {
    isExporting,
    toast,
    dismissToast: () => setToast(null),
    handleExport,
  };
}

