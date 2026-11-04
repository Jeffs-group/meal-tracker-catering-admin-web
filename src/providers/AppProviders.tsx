import React, { type ReactNode } from "react";
import { QueryProvider } from "@/providers/QueryProvider";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * Centralized Application Providers.
 * Aggregates all global context providers, error boundaries, and cache clients.
 */
export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <ErrorBoundary>
      <QueryProvider>{children}</QueryProvider>
    </ErrorBoundary>
  );
};

export default AppProviders;
