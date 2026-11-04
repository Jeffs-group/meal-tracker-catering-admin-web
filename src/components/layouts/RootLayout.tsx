import React, { Suspense } from "react";
import { Outlet } from "react-router-dom";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";

/**
 * Root application layout shell foundation.
 * Wraps nested routes in an ErrorBoundary and Suspense boundary.
 */
export const RootLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <ErrorBoundary>
        <Suspense fallback={<LoadingIndicator fullScreen label="Loading..." />}>
          <Outlet />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
};
