/**
 * Authentication and Portal Access Guard Utilities
 */

export interface PortalUserCheck {
  portal?: string;
  role?: string | { name?: string; code?: string; portal?: string };
  roleLabel?: string;
}

/**
 * Checks whether an authenticating or authenticated user belongs to the Event Admin portal.
 * In the Super Admin portal, Event Admin accounts are strictly barred from logging in or accessing routes.
 */
export function isEventAdminUser(user?: PortalUserCheck | null): boolean {
  if (!user) return false;

  const portal = String(user.portal || "").toUpperCase();
  const roleName =
    typeof user.role === "string"
      ? user.role.toUpperCase()
      : String(user.role?.name || user.role?.code || "").toUpperCase();
  const rolePortal =
    typeof user.role === "object"
      ? String(user.role?.portal || "").toUpperCase()
      : "";
  const roleLabel = String(user.roleLabel || "").toUpperCase();

  return (
    portal === "EVENT" ||
    rolePortal === "EVENT" ||
    roleName.includes("EVENT") ||
    roleLabel.includes("EVENT") ||
    (portal !== "" && portal !== "SUPER" && portal !== "CATERING")
  );
}

