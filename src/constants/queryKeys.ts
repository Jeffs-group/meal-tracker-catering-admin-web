/**
 * Centralized Query Keys factory convention for TanStack Query.
 * All query keys should follow a consistent hierarchical tuple structure.
 */
export const QUERY_KEYS = {
  AUTH: {
    ALL: ["auth"] as const,
    USER: () => [...QUERY_KEYS.AUTH.ALL, "user"] as const,
    PERMISSIONS: () => [...QUERY_KEYS.AUTH.ALL, "permissions"] as const,
  },
  ORGANIZATION: {
    ALL: ["organization"] as const,
    PROFILE: () => [...QUERY_KEYS.ORGANIZATION.ALL, "profile"] as const,
    SETTINGS: () => [...QUERY_KEYS.ORGANIZATION.ALL, "settings"] as const,
    DETAILS: (id: string) =>
      [...QUERY_KEYS.ORGANIZATION.ALL, "details", id] as const,
    LIST: (filters?: Record<string, unknown>) =>
      [...QUERY_KEYS.ORGANIZATION.ALL, "list", filters] as const,
  },
} as const;
