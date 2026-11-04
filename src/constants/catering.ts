import type {
  MealPeriodConfig,
  Counter,
  RoleDefinition,
} from "@/types/catering.types";

export function getTodayDateString(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const year = parts.find((p) => p.type === "year")?.value;
  const month = parts.find((p) => p.type === "month")?.value;
  const day = parts.find((p) => p.type === "day")?.value;
  return `${year}-${month}-${day}`;
}

export function getTodayHeaderFormatted(): string {
  return new Date().toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export const OPERATING_DATE_DEFAULT = getTodayDateString();
export const VITE_MOCK_NOW = `${getTodayDateString()}T13:22:00+05:30`;
export const SEASON_LABEL = "Season 2026";
export const LEAGUE_SCOPE = "KSPL / ISCL";

export const TOURNAMENT_TEAMS = [
  { id: "chennai-kings", name: "Chennai Kings", letterCode: "A", rosterCap: 25 },
  { id: "mumbai-titans", name: "Mumbai Titans", letterCode: "B", rosterCap: 25 },
  { id: "delhi-dragons", name: "Delhi Dragons", letterCode: "C", rosterCap: 25 },
  { id: "kolkata-warriors", name: "Kolkata Warriors", letterCode: "D", rosterCap: 25 },
  { id: "bangalore-blasters", name: "Bangalore Blasters", letterCode: "E", rosterCap: 25 },
] as const;

export const HIGH_INFLOW_MARGIN_PP = 5;

export const AUTH_CONFIG = {
  INVITE_TTL_HOURS: 72,
  SESSION_IDLE_TIMEOUT_HOURS: 4,
  ALLOWED_EMAIL_DOMAINS: ["jeffscatering.com", "jeffsgroup.com"],
} as const;

export const DEFAULT_MEALS_CONFIG: MealPeriodConfig[] = [
  {
    key: "meal1",
    sortOrder: 1,
    sessionLabel: "SESSION 1",
    name: "Meal 1",
    label: "Meal 1",
    description: "First Service Session",
    subtitle: "First Service Session",
    enabled: true,
    isEnabled: true,
    status: "Active for Service",
    availability: "Open All Day",
    vegPlanned: 0,
    nonVegPlanned: 0,
    totalPlanned: 0,
  },
  {
    key: "meal2",
    sortOrder: 2,
    sessionLabel: "SESSION 2",
    name: "Meal 2",
    label: "Meal 2",
    description: "Second Service Session",
    subtitle: "Second Service Session",
    enabled: true,
    isEnabled: true,
    status: "Active for Service",
    availability: "Open All Day",
    vegPlanned: 0,
    nonVegPlanned: 0,
    totalPlanned: 0,
  },
  {
    key: "meal3",
    sortOrder: 3,
    sessionLabel: "SESSION 3",
    name: "Meal 3",
    label: "Meal 3",
    description: "Third Service Session",
    subtitle: "Third Service Session",
    enabled: true,
    isEnabled: true,
    status: "Active for Service",
    availability: "Open All Day",
    vegPlanned: 0,
    nonVegPlanned: 0,
    totalPlanned: 0,
  },
  {
    key: "meal4",
    sortOrder: 4,
    sessionLabel: "SESSION 4",
    name: "Meal 4",
    label: "Meal 4",
    description: "Fourth Service Session",
    subtitle: "Fourth Service Session",
    enabled: true,
    isEnabled: true,
    status: "Active for Service",
    availability: "Open All Day",
    vegPlanned: 0,
    nonVegPlanned: 0,
    totalPlanned: 0,
  },
];

export const DEFAULT_MEAL_PERIODS: MealPeriodConfig[] = [
  {
    key: "breakfast",
    label: "Breakfast",
    subtitle: "Morning Service",
    enabled: true,
    start: "07:00",
    end: "10:00",
    plannedVeg: 75,
    plannedNonVeg: 50,
  },
  {
    key: "lunch",
    label: "Lunch",
    subtitle: "Midday Dining Session",
    enabled: true,
    start: "12:00",
    end: "15:00",
    plannedVeg: 210,
    plannedNonVeg: 140,
  },
  {
    key: "dinner",
    label: "Dinner",
    subtitle: "Evening Banquet Session",
    enabled: true,
    start: "19:00",
    end: "22:00",
    plannedVeg: 75,
    plannedNonVeg: 50,
  },
];

export const COUNTERS: Counter[] = [
  {
    id: "counter-01",
    name: "Main Catering Counter 01",
    terminal: "Terminal #4",
    gate: "Gate B",
  },
  {
    id: "counter-02",
    name: "North Wing Line 02",
    terminal: "Terminal #2",
    gate: "Gate A",
  },
  {
    id: "counter-03",
    name: "VIP Lounge Dispenser 03",
    terminal: "Terminal #1",
    gate: "VIP Lounge",
  },
  {
    id: "counter-04",
    name: "Staff Dining Bay 04",
    terminal: "Terminal #5",
    gate: "Gate D",
  },
];

export const CATERING_ROLES: Record<string, RoleDefinition> = {
  SUPER_ADMIN: {
    id: "SUPER_ADMIN",
    label: "Super Admin",
    description: "Full governance, configuration, user management & distribution authorization",
    portal: "catering",
    tier: "superadmin",
    isLocked: true,
    permissions: [
      "dashboard:view",
      "meals:view",
      "meals:verify",
      "meals:provide",
      "meals:manage",
      "users:view",
      "users:create",
      "users:edit",
      "users:manage",
      "reports:view",
      "*",
    ],
  },
  MEAL_OPERATOR: {
    id: "MEAL_OPERATOR",
    label: "Meal Operator",
    description: "Scan accreditation QR codes, verify passcodes, and dispense meals at active counters",
    portal: "catering",
    tier: "operator",
    permissions: [
      "dashboard:view",
      "meals:view",
      "meals:verify",
      "meals:provide",
    ],
  },
  REPORTS_VIEWER: {
    id: "REPORTS_VIEWER",
    label: "Reports Viewer",
    description: "Audit distribution velocity, check reconcile ledgers, and export compliance reports",
    portal: "catering",
    tier: "viewer",
    permissions: ["dashboard:view", "reports:view"],
  },
};

export const CATERING_MODULES = [
  {
    key: "dashboard",
    label: "Dashboard",
    description: "Operational overview, active teams & live velocity metrics",
    actions: ["view"],
  },
  {
    key: "meals",
    label: "Manage Meals",
    description: "Roster verification, portion dispensation, and service window scheduling",
    actions: ["view", "verify", "provide", "manage"],
  },
  {
    key: "users",
    label: "User Management",
    description: "Invite personnel, assign matchday roles, and govern portal access",
    actions: ["view", "create", "edit", "manage"],
  },
  {
    key: "reports",
    label: "Reports & Audit",
    description: "Live reconciliation, comprehensive activity logs, and compliance exports",
    actions: ["view"],
  },
] as const;

export const CATERING_RULES = [
  {
    title: "Append-Only Immutable Ledger",
    description:
      "All dispensed meals are written once to the central ledger with receipt code, operator ID, counter station, and timestamp. Records cannot be edited or deleted.",
  },
  {
    title: "Duplicate Distribution Lockout",
    description:
      "A participant or staff member can only receive one meal per meal window (Breakfast, Lunch, Dinner). Concurrent or subsequent attempts return a 409 DUPLICATE conflict with prior claim details.",
  },
  {
    title: "Matchday Roster Activation",
    description:
      "Team members are only eligible if their team has been matchday-activated by Event Admin for the operating date and their individual registration is Approved.",
  },
  {
    title: "Operational Staff Direct Access",
    description:
      "Operational staff members are independently eligible once approved with meal pass access enabled, requiring no team roster association.",
  },
  {
    title: "Time-Window Enforcement",
    description:
      "Meals may only be dispensed during live service windows. Windows lock automatically when service ends or when disabled in Meal Configuration.",
  },
  {
    title: "Session & Invitation Governance",
    description:
      "Personnel invitations expire strictly in 72 hours. Inactive sessions time out after 4 hours of inactivity.",
  },
];

