import { axiosInstance } from "./axiosInstance";
import { SUPER_ENDPOINTS } from "./endpoints";
import type {
  LoginDto,
  LoginResponseDto,
  LogoutResponseDto,
  MeResponseDto,
} from "@/types/superAdminApi.types";

/**
 * Auth API Client
 */
export async function login(data: LoginDto): Promise<LoginResponseDto> {
  const response = await axiosInstance.post<LoginResponseDto>(
    SUPER_ENDPOINTS.AUTH.LOGIN,
    data,
  );
  return response.data;
}

export async function refreshAuthToken(): Promise<LoginResponseDto> {
  const response = await axiosInstance.post<LoginResponseDto>(
    SUPER_ENDPOINTS.AUTH.REFRESH,
  );
  return response.data;
}

export async function logout(): Promise<LogoutResponseDto> {
  const response = await axiosInstance.post<LogoutResponseDto>(
    SUPER_ENDPOINTS.AUTH.LOGOUT,
  );
  return response.data;
}

export async function getCurrentUser(): Promise<MeResponseDto> {
  const response = await axiosInstance.get<MeResponseDto>(
    SUPER_ENDPOINTS.AUTH.ME,
  );
  return response.data;
}

