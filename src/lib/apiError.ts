import type { AxiosError } from "axios";
import type { ApiErrorResponse } from "@/types/api";

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly errors?: Record<string, string[]>;
  public readonly isNetworkError: boolean;
  public readonly isAuthError: boolean;

  constructor(
    message: string,
    statusCode = 500,
    errors?: Record<string, string[]>,
    isNetworkError = false,
  ) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.errors = errors;
    this.isNetworkError = isNetworkError;
    this.isAuthError = statusCode === 401 || statusCode === 403;
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  public static fromAxiosError(error: AxiosError<ApiErrorResponse>): ApiError {
    if (!error.response) {
      return new ApiError(
        error.message ||
          "Network error occurred. Please check your connection.",
        0,
        undefined,
        true,
      );
    }

    const { status, data } = error.response;
    const message =
      data?.message ||
      error.message ||
      `Request failed with status code ${status}`;

    return new ApiError(message, status, data?.errors, false);
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return "An unexpected error occurred. Please try again.";
}
