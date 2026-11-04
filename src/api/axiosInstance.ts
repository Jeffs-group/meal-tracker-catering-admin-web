import axios, {
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";
import { env } from "@/config/env";
import { getAccessToken, useAuthStore } from "@/stores/authStore";
import { ApiError } from "@/lib/apiError";
import type { ApiErrorResponse } from "@/types/api";

export const axiosInstance: AxiosInstance = axios.create({
  baseURL: env.VITE_API_BASE_URL,
  timeout: env.VITE_API_TIMEOUT_MS,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "ngrok-skip-browser-warning": "true",
  },
});

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Don't retry if it's already a retry or if it's auth login/refresh/logout endpoint
    const url = originalRequest?.url || "";
    const isAuthEndpoint =
      url.includes("/api/v1/auth/login") ||
      url.includes("/api/v1/auth/refresh") ||
      url.includes("/api/v1/auth/logout");

    if (error.response?.status === 401 && !originalRequest?._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const currentTokens = useAuthStore.getState().tokens;
        const refreshResponse = await axios.post<{
          accessToken?: string;
          refreshToken?: string;
          tokens?: { accessToken?: string; refreshToken?: string };
          data?: { accessToken?: string; refreshToken?: string; tokens?: { accessToken?: string; refreshToken?: string } };
        }>(
          `${env.VITE_API_BASE_URL}/api/v1/auth/refresh`,
          currentTokens?.refreshToken ? { refreshToken: currentTokens.refreshToken } : {},
          {
            withCredentials: true,
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              "ngrok-skip-browser-warning": "true",
              ...(currentTokens?.refreshToken ? { "x-refresh-token": currentTokens.refreshToken } : {}),
            },
          },
        );

        const d = refreshResponse.data;
        const newAccessToken =
          d?.accessToken ||
          d?.tokens?.accessToken ||
          d?.data?.accessToken ||
          d?.data?.tokens?.accessToken;

        const newRefreshToken =
          d?.refreshToken ||
          d?.tokens?.refreshToken ||
          d?.data?.refreshToken ||
          d?.data?.tokens?.refreshToken ||
          currentTokens?.refreshToken;

        if (newAccessToken) {
          useAuthStore.getState().setTokens({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
          });

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }

          processQueue(null, newAccessToken);
          return axiosInstance(originalRequest);
        } else {
          throw new Error("No access token returned from refresh endpoint");
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        useAuthStore.getState().logout();
        return Promise.reject(ApiError.fromAxiosError(error));
      } finally {
        isRefreshing = false;
      }
    }

    if (error.response?.status === 401 && isAuthEndpoint && !url.includes("/api/v1/auth/login")) {
      useAuthStore.getState().logout();
    }

    const apiError = ApiError.fromAxiosError(error);
    return Promise.reject(apiError);
  },
);

export default axiosInstance;
