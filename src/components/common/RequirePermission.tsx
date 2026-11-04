import React from "react";
import { Navigate } from "react-router-dom";
import { usePermissions } from "@/hooks/usePermissions";
import { ROUTES } from "@/constants/routes";

export interface RequirePermissionProps {
  module: string;
  action: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const RequirePermission: React.FC<RequirePermissionProps> = ({
  module,
  action,
  children,
  fallback = <Navigate to={ROUTES.UNAUTHORIZED} replace />,
}) => {
  const { can } = usePermissions();

  if (!can(module, action)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default RequirePermission;

