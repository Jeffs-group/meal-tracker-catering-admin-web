import { QueryClient } from "@tanstack/react-query";
import { isApiError } from "@/lib/apiError";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes cache persistence
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        // Do not retry on client-side errors (401, 403, 404, validation errors)
        if (
          isApiError(error) &&
          (error.statusCode === 401 ||
            error.statusCode === 403 ||
            error.statusCode === 404 ||
            (error.statusCode >= 400 && error.statusCode < 500))
        ) {
          return false;
        }
        return failureCount < 2;
      },
    },
    mutations: {
      retry: false,
    },
  },
});
