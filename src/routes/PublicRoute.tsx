import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { ROUTES } from "@/constants/routes";

interface PublicRouteProps {
  children?: React.ReactNode;
  restricted?: boolean;
}

/**
 * Public route foundation.
 * Restricts access for already-authenticated users when restricted=true.
 */
export const PublicRoute: React.FC<PublicRouteProps> = ({
  children,
  restricted = false,
}) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const location = useLocation();

  if (isAuthenticated && restricted) {
    const from =
      (location.state as { from?: { pathname: string } })?.from?.pathname ||
      ROUTES.ROOT;
    return <Navigate to={from} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};
