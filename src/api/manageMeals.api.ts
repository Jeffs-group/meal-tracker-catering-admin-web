import { axiosInstance } from "./axiosInstance";
import { SUPER_ENDPOINTS } from "./endpoints";
import type {
  ManageMealsSaveConfigDto,
  VerifyRegistrantDto,
  VerifyRegistrantResponseDto,
  ProvideMealDto,
  ProvideMealResponseDto,
} from "@/types/superAdminApi.types";

export interface TeamRegistrantsFilterParams {
  date?: string;
  mealPeriodId?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface StaffRegistrantsFilterParams {
  date?: string;
  mealPeriodId?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

/**
 * Manage Meals Operations API Service
 */
export async function getManageMealsDashboard(
  date?: string,
): Promise<unknown> {
  const response = await axiosInstance.get(
    SUPER_ENDPOINTS.MANAGE_MEALS.DASHBOARD,
    { params: date ? { date } : undefined },
  );
  return response.data;
}

export async function searchManageMeals(
  q: string,
  date?: string,
): Promise<unknown[]> {
  const response = await axiosInstance.get<unknown[]>(
    SUPER_ENDPOINTS.MANAGE_MEALS.SEARCH,
    { params: { q, ...(date ? { date } : {}) } },
  );
  return response.data;
}

export async function getManageMealsTeamRegistrants(
  teamId: string,
  params?: TeamRegistrantsFilterParams,
): Promise<unknown> {
  const response = await axiosInstance.get(
    SUPER_ENDPOINTS.MANAGE_MEALS.TEAM_REGISTRANTS(teamId),
    { params },
  );
  return response.data;
}

export async function getManageMealsStaffRegistrants(
  params?: StaffRegistrantsFilterParams,
): Promise<unknown> {
  const response = await axiosInstance.get(
    SUPER_ENDPOINTS.MANAGE_MEALS.STAFF_REGISTRANTS,
    { params },
  );
  return response.data;
}

export async function getRegistrantDistribution(
  registrantCode: string,
  date: string,
): Promise<unknown> {
  const response = await axiosInstance.get(
    SUPER_ENDPOINTS.MANAGE_MEALS.REGISTRANT_DISTRIBUTION(registrantCode),
    { params: { date } },
  );
  return response.data;
}

export async function saveManageMealsConfiguration(
  data: ManageMealsSaveConfigDto,
): Promise<{ success: boolean; message?: string }> {
  const response = await axiosInstance.put<{ success: boolean; message?: string }>(
    SUPER_ENDPOINTS.MANAGE_MEALS.CONFIGURATION,
    data,
  );
  return response.data;
}

// Distribution Execution Endpoints
export async function listMealDayRegistrants(
  date: string,
  params?: { category?: string; periodId?: string },
): Promise<unknown> {
  const response = await axiosInstance.get(
    SUPER_ENDPOINTS.SUPER_DISTRIBUTION.REGISTRANTS(date),
    { params },
  );
  return response.data;
}

export async function verifyRegistrantForMeal(
  date: string,
  data: VerifyRegistrantDto,
): Promise<VerifyRegistrantResponseDto> {
  const response = await axiosInstance.post<VerifyRegistrantResponseDto>(
    SUPER_ENDPOINTS.SUPER_DISTRIBUTION.VERIFY(date),
    data,
  );
  return response.data;
}

export async function provideMealToRegistrant(
  date: string,
  data: ProvideMealDto,
): Promise<ProvideMealResponseDto> {
  const response = await axiosInstance.post<ProvideMealResponseDto>(
    SUPER_ENDPOINTS.SUPER_DISTRIBUTION.PROVIDE(date),
    data,
  );
  return response.data;
}
