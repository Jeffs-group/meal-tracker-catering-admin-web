export type UserRole =
  | "SUPER_ADMIN"
  | "ORG_ADMIN"
  | "ORG_MANAGER"
  | "ORG_STAFF"
  | "MEAL_OPERATOR"
  | "REPORTS_VIEWER";

export interface AuthUser {
  id: string;
  userCode?: string;
  email: string;
  firstName: string;
  lastName: string;
  organizationId?: string;
  role: UserRole;
  roleLabel?: string;
  portal?: "event" | "catering";
  currentCounterId?: string;
  permissions: string[];
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export interface AuthSession {
  user: AuthUser | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
}
