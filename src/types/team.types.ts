import type {
  RegistrationStatus,
  TeamStatus,
  MemberType,
} from "./common.types";
import type { League } from "@/constants/leagues";

export type { League };

export interface TeamMemberRow {
  id: string;
  registrationId: string; // e.g. REG-CK-101
  name: string;
  avatarUrl?: string;
  memberType: MemberType;
  contact: string;
  email: string;
  submittedAt: string; // formatted with date + time IST
  status: RegistrationStatus;
  mealEligible: boolean; // derived: team.status === 'ACTIVE' && status === 'APPROVED'
}

export interface TeamStats {
  total: number;
  maxCap: number;
  approved: number;
  approvedPercentage: number;
  pending: number;
  rejected: number;
  rejectedPercentage: number;
}

export interface TeamDetail {
  id: string;
  name: string;
  code: string;
  league: League;
  franchiseId: string; // e.g. FRAN-KSPL-CK-2026
  teamCode: string; // Canonical format: TM-KSPL-001
  logoUrl?: string;
  status: TeamStatus;
  licensed?: boolean;
  updatedAt?: string;
  updatedBy?: string;
  stats: TeamStats;
  memberCountsByType: {
    ALL: number;
    PLAYER: number;
    OWNER: number;
    COACH: number;
    OTHERS: number;
  };
}

export interface Team {
  id: string;
  teamCode: string; // Canonical: TM-KSPL-001 (immutable)
  name: string;
  league: League;
  status: TeamStatus;
  licensed: boolean;
  registrationsTotal: number;
  approvedCount: number;
  pendingCount: number;
  rejectedCount: number;
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
  initials?: string;
}

export interface TeamStatsSummary {
  total: number;
  kspl: number;
  iscl: number;
  active: number;
  inactive: number;
}

export interface TeamListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  league?: League | "ALL";
  status?: TeamStatus | "ALL";
  sort?: string;
}

export interface TeamListResponse {
  items: Team[];
  total: number;
  stats: TeamStatsSummary;
}

export interface CreateTeamPayload {
  name: string;
  league: League;
}

export interface UpdateTeamPayload {
  name: string;
  league: League;
}

export interface DeactivateTeamPayload {
  reason: string;
  notes?: string;
}

export interface ReactivateTeamPayload {
  notes?: string;
}

export interface AuditEntry {
  id: string;
  entityType: "TEAM" | "REGISTRANT";
  entityId: string;
  action:
    | "team_created"
    | "team_updated"
    | "team_deactivated"
    | "team_reactivated"
    | "registration_approved"
    | "registration_rejected"
    | "pass_revoked";
  actor: string;
  reason?: string;
  notes?: string;
  timestamp: string;
}
