export type MealPeriodKey =
  | "meal1"
  | "meal2"
  | "meal3"
  | "meal4"
  | "breakfast"
  | "lunch"
  | "dinner"
  | (string & {});

export type PeriodState = "disabled" | "closed" | "live" | "upcoming";

export interface Counter {
  id: string;
  name: string;
  terminal: string;
  gate: string;
}

export interface MealPeriodConfig {
  key: MealPeriodKey;
  id?: string;
  sortOrder?: number;
  sessionLabel?: string;
  name?: string;
  label: string;
  subtitle?: string;
  description?: string;
  enabled: boolean;
  isEnabled?: boolean;
  status?: string;
  availability?: string;
  start?: string; // Optional
  end?: string; // Optional
  startTime?: string | null;
  endTime?: string | null;
  plannedVeg?: number;
  plannedNonVeg?: number;
  vegPlanned?: number;
  nonVegPlanned?: number;
  totalPlanned?: number;
}

export interface MatchdayActivation {
  date: string; // YYYY-MM-DD
  subjectType: "team" | "staff";
  subjectId: string;
  activatedBy: string;
}

export type VerificationMethod = "qr" | "passcode" | "manual";

export interface DistributionRecord {
  id: string;
  receiptCode: string; // MR-YYYYMMDD-####
  registrantId: string;
  recipientType: "team_member" | "staff";
  teamId?: string;
  date: string; // YYYY-MM-DD
  periodKey: MealPeriodKey;
  providedAt: string; // ISO 8601
  counterId: string;
  operatorId: string;
  verificationMethod: VerificationMethod;
  mealType: "veg" | "non_veg";
  idempotencyKey: string;
}

export interface DistributionDetail extends DistributionRecord {
  recipientName: string;
  recipientDesignation: string;
  teamName?: string;
  counterName: string;
  counterTerminal: string;
  counterGate: string;
  operatorName: string;
  operatorRole: string;
  auditTrail: {
    event: string;
    timestamp: string;
    actor: string;
    details: string;
  }[];
}

export type MealStatusType = "provided" | "pending" | "not_collected" | "disabled";

export interface MealStatusCell {
  state: MealStatusType;
  providedAt?: string;
}

export type CateringRoleKey = "SUPER_ADMIN" | "MEAL_OPERATOR" | "REPORTS_VIEWER";

export interface RoleDefinition {
  id: CateringRoleKey;
  label: string;
  description: string;
  portal: "event" | "catering";
  tier: "superadmin" | "operator" | "viewer";
  isLocked?: boolean;
  permissions: string[];
}

export interface UserInvitation {
  status: "accepted" | "pending" | "expired";
  sentAt: string;
  expiresAt: string;
  acceptedAt?: string;
}

export interface UserLastLogin {
  at: string;
  browser: string;
  city: string;
}

export interface CateringUser {
  id: string;
  userCode: string; // USR-2026-###
  fullName: string;
  email: string;
  pendingEmail?: string;
  phone?: string;
  photoUrl?: string;
  roleId: CateringRoleKey;
  status: "active" | "invitation_pending" | "invitation_expired" | "inactive";
  invitation: UserInvitation;
  lastLogin?: UserLastLogin;
  currentCounterId?: string;
  lastSeen?: string; // ISO string for presence dot
  createdAt: string;
}

export interface CateringDashboardSummary {
  date: string;
  activeTeamsCount: number;
  eligibleRegistrantsCount: number;
  mealsProvidedTodayCount: number;
  periods: {
    key: MealPeriodKey;
    label: string;
    subtitle?: string;
    start?: string;
    end?: string;
    state: PeriodState;
    mealsProvided: number;
    enabled: boolean;
  }[];
  teamDistributionRows: {
    id: string;
    name: string;
    letterCode?: string; // A, B, C, D, E
    isStaffRow?: boolean;
    eligibleCount: number;
    mealsProvidedCount: number;
    distributionRatePercent: number; // can exceed 100% since up to 3 meals
  }[];
  recentActivity: {
    id: string;
    receiptCode: string;
    registrantId: string;
    registrantCode: string;
    registrantName: string;
    recipientType: "team_member" | "staff";
    teamName: string;
    periodKey: MealPeriodKey;
    periodLabel: string;
    date: string;
    providedAt: string;
  }[];
}

export interface MealsOverview {
  date: string;
  activeTeamsCount: number;
  eligibleRegistrantsCount: number;
  mealsProvidedTodayCount: number;
  teams: {
    id: string;
    name: string;
    letterCode: string;
    status: "ACTIVE" | "INACTIVE";
    eligibleCount: number;
    mealsProvidedCount: number;
    progressPercent: number;
  }[];
  staffSummary: {
    eligibleCount: number;
    mealsProvidedCount: number;
    progressPercent: number;
  };
}

export interface TeamMemberMealRosterItem {
  id: string;
  registrantId: string;
  registrantCode: string;
  fullName: string;
  designation: string;
  memberType: string;
  isVip: boolean;
  contactNumber: string;
  photoUrl?: string;
  mealPreference: "veg" | "non_veg";
  isEligibleToday: boolean;
  ineligibilityReason?: string;
  meals: {
    breakfast: MealStatusCell;
    lunch: MealStatusCell;
    dinner: MealStatusCell;
    [key: string]: MealStatusCell | undefined;
  };
  totalMealsProvided: number;
}

export interface StaffMealRosterItem {
  id: string;
  registrantId: string;
  registrantCode: string;
  fullName: string;
  designation: string;
  department: string;
  contactNumber: string;
  photoUrl?: string;
  mealPreference: "veg" | "non_veg";
  isEligibleToday: boolean;
  ineligibilityReason?: string;
  meals: {
    breakfast: MealStatusCell;
    lunch: MealStatusCell;
    dinner: MealStatusCell;
    [key: string]: MealStatusCell | undefined;
  };
  totalMealsProvided: number;
}

export interface MealReportFilters {
  date?: string;
  from?: string;
  to?: string;
  teamId?: string;
  periodKey?: MealPeriodKey | "all";
  recipientType?: "all" | "team_member" | "staff";
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

export interface HourlyBucket {
  hour: number; // 8 .. 22
  hourLabel: string; // "08:00", "09:00", etc.
  count: number;
  breakfastCount: number;
  lunchCount: number;
  dinnerCount: number;
  isPeak?: boolean;
}

export interface AllDistributionReportSummary {
  totalDistributions: number;
  teamDistributions: number;
  teamDistributionsPercent: number;
  teamCount: number;
  staffDistributions: number;
  staffDistributionsPercent: number;
  formula: {
    teamCount: number;
    staffCount: number;
    total: number;
    isBalanced: boolean;
  };
  reconciliationStatus: "balanced" | "discrepancy";
  discrepancyCount: number;
}

export interface MealPeriodReportSummary {
  periodKey: MealPeriodKey;
  periodLabel: string;
  periodRange: string;
  periodState: PeriodState;
  totalPeriodMeals: number;
  teamPeriodMeals: number;
  teamEligibleCount: number;
  staffPeriodMeals: number;
  staffEligibleCount: number;
  completionRatePercent: number;
  formula: {
    teamMeals: number;
    staffMeals: number;
    totalMeals: number;
    isBalanced: boolean;
  };
}

export interface TeamWiseReportSummary {
  teamId: string;
  teamName: string;
  letterCode: string;
  eligibleCount: number;
  mealsProvidedCount: number;
  distributionRatePercent: number;
  activatedDate: string;
  activatedBy: string;
  periods: {
    key: MealPeriodKey;
    label: string;
    range: string;
    state: PeriodState;
    count: number;
  }[];
}

export interface StaffReportSummary {
  approvedStaffCount: number;
  staffMealsProvidedCount: number;
  distributionRatePercent: number;
  breakfastCount: number;
  lunchCount: number;
  dinnerCount: number;
  formula: {
    breakfast: number;
    lunch: number;
    dinner: number;
    total: number;
    isBalanced: boolean;
  };
}

export type ApiErrorCode =
  | "DUPLICATE_DISTRIBUTION"
  | "WINDOW_CLOSED"
  | "NOT_ELIGIBLE"
  | "FORBIDDEN"
  | "NETWORK"
  | "DOMAIN_NOT_AUTHORIZED"
  | "EMAIL_TAKEN";

// -------------------------------------------------------------
// LIVE RECONCILIATION REPORT (DTO MATCHING BACKEND /api/v1/super/reports/live-distribution)
// -------------------------------------------------------------
export interface LiveReconciliationTotalMealsKpi {
  value: number;
  badge: string;
  isReconciled: boolean;
  subtitle: string;
}

export interface LiveReconciliationTeamMealsKpi {
  provided: number;
  eligible: number;
  activeTeamsCount: number;
  displayValue: string;
  subtitle: string;
}

export interface LiveReconciliationStaffMealsKpi {
  provided: number;
  eligible: number;
  displayValue: string;
  subtitle: string;
}

export interface LiveReconciliationKpis {
  totalMealsProvided: LiveReconciliationTotalMealsKpi;
  teamMealsProvided: LiveReconciliationTeamMealsKpi;
  staffMealsProvided: LiveReconciliationStaffMealsKpi;
}

export interface LiveMealPeriodItem {
  id: string;
  name: string;
  timingLabel: string;
  mealsDispensed: number;
  percentage: number;
  progressPercentage: number;
  status: string;
  statusLabel: string;
  dispensedLabel: string;
  isActive: boolean;
}

export interface LiveMealPeriodDistribution {
  totalPeriods: number;
  periodsBadge: string;
  totalDailySum: number;
  totalDailySumLabel: string;
  periods: LiveMealPeriodItem[];
}

export interface LiveStaffRecipientItem {
  id: string;
  fullName: string;
  registrantCode: string;
  role: string;
  subtext: string;
  mealsCount: number;
  mealsCountLabel: string;
  periodTags: string[];
}

export interface LiveApprovedStaffDistribution {
  badge: string;
  subtitle: string;
  summary: {
    approvedRosterCount: number;
    approvedRosterLabel: string;
    mealsDispensedCount: number;
    mealsDispensedLabel: string;
  };
  recipients: LiveStaffRecipientItem[];
}

export interface LiveTeamWiseItem {
  teamId: string;
  teamName: string;
  eligibleCount: number;
  eligibleLabel: string;
  mealsProvided: number;
  mealsProvidedLabel: string;
  progressPercentage: number;
  progressLabel: string;
}

export interface LiveTeamWiseDistributionFooter {
  totalActiveAllocation: number;
  totalAllocationLabel: string;
  totalMealsProvided: number;
  totalProvidedLabel: string;
  averageProgress: number;
  averageProgressLabel: string;
  sumMeals: number;
  sumMealsLabel: string;
}

export interface LiveTeamWiseDistribution {
  activeTeamsCount: number;
  activeTeamsBadge: string;
  sumTeamMeals: number;
  sumTeamMealsLabel: string;
  teams: LiveTeamWiseItem[];
  footer: LiveTeamWiseDistributionFooter;
}

export interface LiveRecentActivityItem {
  id: string;
  registrantName: string;
  registeredId: string;
  type: string;
  team: string;
  isStaff: boolean;
  mealPeriod: string;
  date: string;
  time: string;
  servedAt: string;
}

export interface AuditProtocol {
  title: string;
  isReconciled: boolean;
  totalMeals: number;
  teamMeals: number;
  staffMeals: number;
  checksumFormula: string;
  statement: string;
}

export interface LiveDistributionReport {
  date: string;
  teamFilter: {
    teamId: string | null;
    teamName: string;
    activeTeamsCount: number;
  };
  kpis: LiveReconciliationKpis;
  mealPeriodDistribution: LiveMealPeriodDistribution;
  approvedStaffDistribution: LiveApprovedStaffDistribution;
  teamWiseDistribution: LiveTeamWiseDistribution;
  recentActivity: LiveRecentActivityItem[];
  auditProtocol: AuditProtocol;
}

