import { axiosInstance } from "./axiosInstance";
import { SUPER_ENDPOINTS } from "./endpoints";
import type {
  MealDaySummaryDto,
  CreateMealDayDto,
  MealDayCreatedDto,
  MealDayDetailDto,
  MealPeriodDto,
  CreateMealPeriodDto,
  UpdateMealPeriodDto,
} from "@/types/superAdminApi.types";

/**
 * Super Meals (Distribution Dates & Periods) API Service
 */
export async function listMealDays(): Promise<MealDaySummaryDto[]> {
  const response = await axiosInstance.get<MealDaySummaryDto[]>(
    SUPER_ENDPOINTS.SUPER_MEALS.LIST_DAYS,
  );
  return response.data;
}

export async function createMealDay(
  data: CreateMealDayDto,
): Promise<MealDayCreatedDto> {
  const response = await axiosInstance.post<MealDayCreatedDto>(
    SUPER_ENDPOINTS.SUPER_MEALS.CREATE_DAY,
    data,
  );
  return response.data;
}

export async function getMealDayDetail(
  date: string,
): Promise<MealDayDetailDto> {
  const response = await axiosInstance.get<MealDayDetailDto>(
    SUPER_ENDPOINTS.SUPER_MEALS.DAY_DETAIL(date),
  );
  return response.data;
}

export async function addMealPeriod(
  date: string,
  data: CreateMealPeriodDto,
): Promise<MealPeriodDto> {
  const response = await axiosInstance.post<MealPeriodDto>(
    SUPER_ENDPOINTS.SUPER_MEALS.ADD_PERIOD(date),
    data,
  );
  return response.data;
}

export async function updateMealPeriod(
  date: string,
  periodId: string,
  data: UpdateMealPeriodDto,
): Promise<MealPeriodDto> {
  const response = await axiosInstance.patch<MealPeriodDto>(
    SUPER_ENDPOINTS.SUPER_MEALS.UPDATE_PERIOD(date, periodId),
    data,
  );
  return response.data;
}

