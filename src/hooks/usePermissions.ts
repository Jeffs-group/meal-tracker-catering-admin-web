import { useAuthStore } from "@/stores/authStore";

/**
 * Pure evaluation function checking if a set of permissions allows (module:action).
 * Implements rule:
 * - Module 'meals': manage implies all (view, verify, provide, manage).
 *   provide requires verify requires view.
 * - Module 'users': manage implies all (view, create, edit, manage).
 *   create/edit requires view.
 */
export function evaluatePermission(
  permissions: string[] = [],
  module: string,
  action: string,
): boolean {
  if (permissions.includes("*") || permissions.includes(`${module}:*`)) {
    return true;
  }

  const directKey = `${module}:${action}`;
  if (permissions.includes(directKey)) {
    return true;
  }

  if (module === "meals") {
    if (permissions.includes("meals:manage")) {
      return true;
    }
    if (action === "view") {
      return (
        permissions.includes("meals:view") ||
        permissions.includes("meals:verify") ||
        permissions.includes("meals:provide")
      );
    }
    if (action === "verify") {
      return (
        permissions.includes("meals:verify") ||
        permissions.includes("meals:provide")
      );
    }
    if (action === "provide") {
      return permissions.includes("meals:provide");
    }
    if (action === "manage") {
      return permissions.includes("meals:manage");
    }
  }

  if (module === "users") {
    if (permissions.includes("users:manage")) {
      return true;
    }
    if (action === "view") {
      return (
        permissions.includes("users:view") ||
        permissions.includes("users:create") ||
        permissions.includes("users:edit")
      );
    }
    return permissions.includes(`users:${action}`);
  }

  return false;
}

export function usePermissions() {
  const { user, isAuthenticated } = useAuthStore();

  const can = (module: string, action: string): boolean => {
    // If not authenticated or in mock initial load, grant access or evaluate
    if (!user) {
      return true;
    }

    if (user.role === "SUPER_ADMIN" || (user.permissions && user.permissions.includes("*"))) {
      return true;
    }

    if (user.role === "ORG_ADMIN") {
      return true;
    }

    return evaluatePermission(user.permissions || [], module, action);
  };

  return {
    can,
    user,
    isAuthenticated,
  };
}

export default usePermissions;
