import type {
  RegistrationStatus,
  RegistrantType,
  MemberType,
  TeamStatus,
} from "./common.types";

export interface DashboardStatCards {
  totalRegistrations: {
    count: number;
    trendPercentage: number;
    isPositive: boolean;
  };
  pendingApprovals: {
    count: number;
    requiresActionText: string;
  };
  approvedRegistrations: {
    count: number;
    ratioPercentage: number;
  };
  activeTeams: {
    count: number;
    totalTeams: number;
    verifiedPercentage: number;
  };
}

export interface RegistrationDonutData {
  approved: number;
  approvedPercent: number;
  pending: number;
  pendingPercent: number;
  rejected: number;
  rejectedPercent: number;
  total: number;
}

export interface RegistrationBreakdownData {
  teamRegistrations: number;
  teamMaxCap: number;
  teamPercentage: number;
  staffRegistrations: number;
  staffMaxCap: number;
  staffPercentage: number;
  dailyIntakeAvg: number;
  verificationRate: number;
}

export interface RecentRegistrationItem {
  id: string;
  registrationId: string;
  registrantName: string;
  avatarUrl?: string;
  registrantType: RegistrantType;
  teamName: string;
  memberType: MemberType;
  submittedAt: string;
  status: RegistrationStatus;
}

export interface TeamOverviewItem {
  id: string;
  teamId: string;
  name: string;
  code: string;
  logoUrl?: string;
  league: string;
  totalRegistrations: number;
  approvedCount: number;
  pendingCount: number;
  rejectedCount: number;
  status: TeamStatus;
}

export interface DashboardData {
  stats: DashboardStatCards;
  overview: RegistrationDonutData;
  breakdown: RegistrationBreakdownData;
  recentRegistrations: RecentRegistrationItem[];
  teamOverview: TeamOverviewItem[];
}
