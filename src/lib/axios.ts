import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import { env } from "@/config/env";
import { getAccessToken, useAuthStore } from "@/stores/authStore";
import { ApiError } from "@/lib/apiError";
import type { ApiErrorResponse, ApiResponse } from "@/types/api";

/**
 * Centralized Axios HTTP Client
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: env.VITE_API_BASE_URL,
  timeout: env.VITE_API_TIMEOUT_MS,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "ngrok-skip-browser-warning": "true",
  },
});

/**
 * Request Interceptor - Attach Authorization Header
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

/**
 * Response Interceptor - Centralized Error Handling & Auth Eviction
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError<ApiErrorResponse>) => {
    if (error.response?.status === 401) {
      // Clear authentication state on 401 Unauthorized
      useAuthStore.getState().logout();
    }

    const apiError = ApiError.fromAxiosError(error);
    return Promise.reject(apiError);
  },
);

/**
 * Type-safe API request helpers
 */
export const http = {
  get: <T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> =>
    apiClient.get(url, config).then((res) => res.data),

  post: <T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> =>
    apiClient.post(url, data, config).then((res) => res.data),

  put: <T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> =>
    apiClient.put(url, data, config).then((res) => res.data),

  patch: <T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> =>
    apiClient.patch(url, data, config).then((res) => res.data),

  delete: <T>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> =>
    apiClient.delete(url, config).then((res) => res.data),
};

export default apiClient;
