import type { League } from "@/constants/leagues";
import type { RegistrationStatus, TeamStatus } from "./common.types";

export type ReportKey =
  | "registration"
  | "team"
  | "staff-organizer"
  | "meal-eligibility";

export type ExportFormat = "csv" | "xlsx";

export type MealEligibilityReason =
  | "eligible"
  | "team_inactive"
  | "unapproved"
  | "access_disabled"
  | "not_activated_today";

export interface ReportFilters {
  search?: string;
  from?: string; // ISO date YYYY-MM-DD
  to?: string; // ISO date YYYY-MM-DD
  league?: League | string;
  teamId?: string;
  type?: "ALL" | "TEAM" | "STAFF" | "ORGANIZER";
  memberRole?: string;
  status?: RegistrationStatus | TeamStatus | "ALL" | string;
  eligibility?: "ALL" | MealEligibilityReason;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

export interface ReportsHubSummary {
  totalRegistrations: number;
  changePct: number;
  teams: {
    total: number;
    kspl: number;
    iscl: number;
    active: number;
    inactive: number;
  };
  staffOrganizers: {
    total: number;
    approvedPct: number;
  };
  mealEligible: {
    count: number;
    gateSyncedAt: string; // ISO string
    isDelayed: boolean;
  };
  generatedAt: string;
}

// 1. Registration Report Types
export interface RegistrationReportRow {
  id: string;
  registrantId: string;
  formattedId: string;
  name: string;
  avatarUrl?: string;
  designation?: string;
  isVip: boolean;
  type: "TEAM" | "STAFF" | "ORGANIZER";
  teamId?: string;
  teamName: string;
  league?: League;
  role: string;
  phone: string;
  email: string;
  submittedAt: string;
  status: RegistrationStatus;
}

export interface RegistrationReportSummary {
  totalSubmissions: number;
  periodChangePct: number;
  approvedCount: number;
  approvedPct: number;
  pendingCount: number;
  rejectedCount: number;
  unresolvedPct: number;
  generatedAt: string;
}

// 2. Team-wise Report Types
export interface TeamReportRow {
  id: string;
  teamId: string;
  teamCode: string;
  name: string;
  league: League;
  totalRegistrations: number;
  approvedCount: number;
  pendingCount: number;
  rejectedCount: number;
  teamStatus: TeamStatus;
  rosterCompliance: number; // percentage approved / total
  isBelowThreshold: boolean;
}

export interface TeamReportSummary {
  totalTeams: number;
  activeTeams: number;
  inactiveTeams: number;
  kspl: {
    teamCount: number;
    totalRegistrations: number;
    approvedCount: number;
    pendingCount: number;
    rejectedCount: number;
    approvalRate: number;
  };
  iscl: {
    teamCount: number;
    totalRegistrations: number;
    approvedCount: number;
    pendingCount: number;
    rejectedCount: number;
    approvalRate: number;
  };
  activeRosters: {
    operationalCount: number;
    totalCount: number;
    operationalPct: number;
    belowThresholdCount: number;
  };
  overallCompliance: number;
  generatedAt: string;
}

// 3. Staff & Organizer Report Types
export interface StaffOrganizerReportRow {
  id: string;
  registrantId: string;
  formattedId: string;
  name: string;
  avatarUrl?: string;
  type: "STAFF" | "ORGANIZER";
  departmentOrOrg: string;
  role: string;
  phone: string;
  email: string;
  submittedAt: string;
  status: RegistrationStatus;
  mealEligible: boolean;
}

export interface StaffOrganizerReportSummary {
  totalAccreditation: number;
  staffCount: number;
  organizerCount: number;
  passesIssued: number;
  generatedAt: string;
}

// 4. Meal Eligibility Report Types
export interface MealEligibilityReportRow {
  id: string;
  registrantId: string;
  formattedId: string;
  name: string;
  avatarUrl?: string;
  isVip: boolean;
  type: "TEAM" | "STAFF" | "ORGANIZER";
  teamId?: string;
  teamName: string;
  role: string;
  roleWithDesignation: string;
  phone: string;
  email: string;
  approvalStatus: RegistrationStatus;
  teamStatus: TeamStatus | "N/A";
  league?: League;
  submittedAt: string;
  mealAccessReason: MealEligibilityReason;
  isEligible: boolean;
  reasonLabel: string;
}

export interface MealEligibilityReportSummary {
  totalPool: number;
  currentlyEligible: number;
  eligiblePct: number;
  ineligibleTeamInactive: number;
  ineligibleUnapproved: number;
  manuallyDisabled: number;
  generatedAt: string;
}

// Audit Export Log
export interface AuditExportEntry {
  id: string;
  actor: string;
  report: ReportKey;
  format: ExportFormat;
  filters: ReportFilters;
  rowCount: number;
  timestamp: string;
}

