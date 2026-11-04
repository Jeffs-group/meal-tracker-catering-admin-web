export const ROUTES = {
  ROOT: "/",
  DASHBOARD: "/dashboard",
  MEALS: "/meals",
  MEALS_TEAM: "/meals/teams/:teamId",
  MEALS_STAFF: "/meals/staff",
  MEALS_REGISTRANT: "/meals/registrants/:registrantId",
  MEALS_CONFIG: "/meals/config",
  USERS: "/users",
  USERS_NEW: "/users/new",
  USERS_EDIT: "/users/:userId/edit",
  REPORTS: "/reports",
  REPORTS_ACTIVITY: "/reports/distribution-activity",
  REPORTS_MEAL_PERIOD: "/reports/meal-period",
  REPORTS_TEAM_WISE: "/reports/team-wise",
  REPORTS_STAFF: "/reports/staff",
  LOGIN: "/login",
  UNAUTHORIZED: "/403",
  NOT_FOUND: "*",

  // Legacy keys for dormant Event Admin files
  MANAGE_TEAMS: "/manage-teams",
  REGISTRATIONS: "/registrations",
  TEAM_MEMBERS: "/registrations/teams/:teamId",
  REPORTS_REGISTRATIONS: "/reports/registrations",
  REPORTS_TEAMS: "/reports/teams",
  REPORTS_STAFF_ORGANIZERS: "/reports/staff-organizers",
  REPORTS_MEAL_ELIGIBILITY: "/reports/meal-eligibility",

  // Aliases for explicit CATERING prefix references (points to root super admin routes)
  CATERING: {
    ROOT: "/",
    DASHBOARD: "/dashboard",
    MEALS: "/meals",
    MEALS_TEAM: "/meals/teams/:teamId",
    MEALS_STAFF: "/meals/staff",
    MEALS_REGISTRANT: "/meals/registrants/:registrantId",
    MEALS_CONFIG: "/meals/config",
    USERS: "/users",
    USERS_NEW: "/users/new",
    USERS_EDIT: "/users/:userId/edit",
    REPORTS: "/reports",
    REPORTS_ACTIVITY: "/reports/distribution-activity",
    REPORTS_MEAL_PERIOD: "/reports/meal-period",
    REPORTS_TEAM_WISE: "/reports/team-wise",
    REPORTS_STAFF: "/reports/staff",
  },
} as const;

export const buildTeamMembersRoute = (teamId: string) =>
  `/registrations/teams/${teamId}`;

export const buildCateringTeamRoute = (teamId: string) =>
  `/meals/teams/${teamId}`;

export const buildCateringRegistrantRoute = (registrantId: string, period?: string) =>
  `/meals/registrants/${registrantId}${period ? `?period=${period}` : ""}`;

export const buildCateringUserEditRoute = (userId: string) =>
  `/users/${userId}/edit`;

export const buildCateringUserDetailsRoute = (userId: string) =>
  `/users?user=${userId}`;
