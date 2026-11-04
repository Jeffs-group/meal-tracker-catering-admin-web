import { axiosInstance } from "./axiosInstance";
import { ENDPOINTS } from "./endpoints";
import { mockGetDashboardSummary } from "./mock/mockHandlers";
import type { DashboardData } from "@/types/dashboard.types";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

export const dashboardApi = {
  getSummary: async (): Promise<DashboardData> => {
    if (USE_MOCK) {
      return mockGetDashboardSummary();
    }
    const response = await axiosInstance.get<{ data: DashboardData }>(
      ENDPOINTS.DASHBOARD.SUMMARY,
    );
    return response.data.data;
  },
};
