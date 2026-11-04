import { axiosInstance } from "./axiosInstance";
import { ENDPOINTS } from "./endpoints";
import {
  mockGetReportsHubSummary,
  mockGetRegistrationReportSummary,
  mockGetRegistrationReportRows,
  mockGetTeamReportSummary,
  mockGetTeamReportRows,
  mockGetStaffOrganizerReportSummary,
  mockGetStaffOrganizerReportRows,
  mockGetMealEligibilityReportSummary,
  mockGetMealEligibilityReportRows,
  mockExportReport,
  mockBatchPrintCateringTokens,
} from "./mock/mockHandlers";
import type {
  ReportKey,
  ReportFilters,
  ExportFormat,
  ReportsHubSummary,
  RegistrationReportRow,
  RegistrationReportSummary,
  TeamReportRow,
  TeamReportSummary,
  StaffOrganizerReportRow,
  StaffOrganizerReportSummary,
  MealEligibilityReportRow,
  MealEligibilityReportSummary,
} from "@/types/reports.types";
import type { PaginatedResult } from "@/types/common.types";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

export const reportsApi = {
  // Hub Summary
  getHubSummary: async (): Promise<ReportsHubSummary> => {
    if (USE_MOCK) {
      return mockGetReportsHubSummary();
    }
    const res = await axiosInstance.get<{ data: ReportsHubSummary }>(
      ENDPOINTS.REPORTS.HUB_SUMMARY,
    );
    return res.data.data;
  },

  // 1. Registration Report
  getRegistrationSummary: async (
    filters?: ReportFilters,
  ): Promise<RegistrationReportSummary> => {
    if (USE_MOCK) {
      return mockGetRegistrationReportSummary(filters);
    }
    const res = await axiosInstance.get<{ data: RegistrationReportSummary }>(
      ENDPOINTS.REPORTS.REGISTRATION_SUMMARY,
      { params: filters },
    );
    return res.data.data;
  },

  getRegistrationRows: async (
    filters?: ReportFilters,
  ): Promise<PaginatedResult<RegistrationReportRow>> => {
    if (USE_MOCK) {
      return mockGetRegistrationReportRows(filters);
    }
    const res = await axiosInstance.get<{
      data: PaginatedResult<RegistrationReportRow>;
    }>(ENDPOINTS.REPORTS.REGISTRATION_ROWS, { params: filters });
    return res.data.data;
  },

  // 2. Team-wise Report
  getTeamSummary: async (
    filters?: ReportFilters,
  ): Promise<TeamReportSummary> => {
    if (USE_MOCK) {
      return mockGetTeamReportSummary(filters);
    }
    const res = await axiosInstance.get<{ data: TeamReportSummary }>(
      ENDPOINTS.REPORTS.TEAM_SUMMARY,
      { params: filters },
    );
    return res.data.data;
  },

  getTeamRows: async (
    filters?: ReportFilters,
  ): Promise<PaginatedResult<TeamReportRow>> => {
    if (USE_MOCK) {
      return mockGetTeamReportRows(filters);
    }
    const res = await axiosInstance.get<{
      data: PaginatedResult<TeamReportRow>;
    }>(ENDPOINTS.REPORTS.TEAM_ROWS, { params: filters });
    return res.data.data;
  },

  // 3. Staff & Organizer Report
  getStaffOrganizerSummary: async (
    filters?: ReportFilters,
  ): Promise<StaffOrganizerReportSummary> => {
    if (USE_MOCK) {
      return mockGetStaffOrganizerReportSummary(filters);
    }
    const res = await axiosInstance.get<{ data: StaffOrganizerReportSummary }>(
      ENDPOINTS.REPORTS.STAFF_ORGANIZER_SUMMARY,
      { params: filters },
    );
    return res.data.data;
  },

  getStaffOrganizerRows: async (
    filters?: ReportFilters,
  ): Promise<PaginatedResult<StaffOrganizerReportRow>> => {
    if (USE_MOCK) {
      return mockGetStaffOrganizerReportRows(filters);
    }
    const res = await axiosInstance.get<{
      data: PaginatedResult<StaffOrganizerReportRow>;
    }>(ENDPOINTS.REPORTS.STAFF_ORGANIZER_ROWS, { params: filters });
    return res.data.data;
  },

  // 4. Meal Eligibility Report
  getMealEligibilitySummary: async (
    filters?: ReportFilters,
  ): Promise<MealEligibilityReportSummary> => {
    if (USE_MOCK) {
      return mockGetMealEligibilityReportSummary(filters);
    }
    const res = await axiosInstance.get<{ data: MealEligibilityReportSummary }>(
      ENDPOINTS.REPORTS.MEAL_ELIGIBILITY_SUMMARY,
      { params: filters },
    );
    return res.data.data;
  },

  getMealEligibilityRows: async (
    filters?: ReportFilters,
  ): Promise<PaginatedResult<MealEligibilityReportRow>> => {
    if (USE_MOCK) {
      return mockGetMealEligibilityReportRows(filters);
    }
    const res = await axiosInstance.get<{
      data: PaginatedResult<MealEligibilityReportRow>;
    }>(ENDPOINTS.REPORTS.MEAL_ELIGIBILITY_ROWS, { params: filters });
    return res.data.data;
  },

  // Export
  exportReport: async (
    key: ReportKey,
    format: ExportFormat,
    filters?: ReportFilters,
  ): Promise<Blob> => {
    if (USE_MOCK) {
      return mockExportReport(key, format, filters);
    }
    const res = await axiosInstance.get(ENDPOINTS.REPORTS.EXPORT(key, format), {
      params: filters,
      responseType: "blob",
    });
    return res.data;
  },

  // Batch Print Catering Tokens
  batchPrintCateringTokens: async (
    filters?: ReportFilters,
  ): Promise<{ printedCount: number; message: string; pdfUrl: string }> => {
    if (USE_MOCK) {
      return mockBatchPrintCateringTokens(filters);
    }
    const res = await axiosInstance.post<{
      data: { printedCount: number; message: string; pdfUrl: string };
    }>(ENDPOINTS.REPORTS.BATCH_PRINT, { filters });
    return res.data.data;
  },
};

