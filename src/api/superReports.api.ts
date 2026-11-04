import { axiosInstance } from "./axiosInstance";
import { SUPER_ENDPOINTS } from "./endpoints";
import type {
  SuperDashboardDto,
  DistributionReportRowDto,
  RegistrantHistoryRowDto,
  QuantityReportRowDto,
  TeamDistributionReportRowDto,
  StaffDistributionReportRowDto,
} from "@/types/superAdminApi.types";

export interface ReportFilterQueryParams {
  date?: string;
  format?: "json" | "csv";
}

/**
 * Super Admin Reports API Service
 */
export async function getSuperReportsDashboard(
  params?: ReportFilterQueryParams,
): Promise<SuperDashboardDto> {
  const response = await axiosInstance.get<SuperDashboardDto>(
    SUPER_ENDPOINTS.SUPER_REPORTS.DASHBOARD,
    { params },
  );
  return response.data;
}

export async function getDistributionReport(
  params?: ReportFilterQueryParams,
): Promise<DistributionReportRowDto[]> {
  const response = await axiosInstance.get<DistributionReportRowDto[]>(
    SUPER_ENDPOINTS.SUPER_REPORTS.DISTRIBUTION,
    { params },
  );
  return response.data;
}

export async function getRegistrantHistoryReport(
  params?: ReportFilterQueryParams,
): Promise<RegistrantHistoryRowDto[]> {
  const response = await axiosInstance.get<RegistrantHistoryRowDto[]>(
    SUPER_ENDPOINTS.SUPER_REPORTS.REGISTRANTS,
    { params },
  );
  return response.data;
}

export async function getQuantityReport(
  params?: ReportFilterQueryParams,
): Promise<QuantityReportRowDto[]> {
  const response = await axiosInstance.get<QuantityReportRowDto[]>(
    SUPER_ENDPOINTS.SUPER_REPORTS.QUANTITIES,
    { params },
  );
  return response.data;
}

export async function getTeamDistributionReport(
  params?: ReportFilterQueryParams,
): Promise<TeamDistributionReportRowDto[]> {
  const response = await axiosInstance.get<TeamDistributionReportRowDto[]>(
    SUPER_ENDPOINTS.SUPER_REPORTS.TEAMS,
    { params },
  );
  return response.data;
}

export async function getStaffDistributionReport(
  params?: ReportFilterQueryParams,
): Promise<StaffDistributionReportRowDto[]> {
  const response = await axiosInstance.get<StaffDistributionReportRowDto[]>(
    SUPER_ENDPOINTS.SUPER_REPORTS.STAFF,
    { params },
  );
  return response.data;
}

export async function exportReportCsv(
  reportType: "distribution" | "registrants" | "quantities" | "teams" | "staff",
  date?: string,
): Promise<Blob> {
  const endpointMap = {
    distribution: SUPER_ENDPOINTS.SUPER_REPORTS.DISTRIBUTION,
    registrants: SUPER_ENDPOINTS.SUPER_REPORTS.REGISTRANTS,
    quantities: SUPER_ENDPOINTS.SUPER_REPORTS.QUANTITIES,
    teams: SUPER_ENDPOINTS.SUPER_REPORTS.TEAMS,
    staff: SUPER_ENDPOINTS.SUPER_REPORTS.STAFF,
  };

  const response = await axiosInstance.get(endpointMap[reportType], {
    params: { format: "csv", ...(date ? { date } : {}) },
    responseType: "blob",
  });
  return response.data;
}

