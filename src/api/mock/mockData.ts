import type {
  TeamStatus,
  RegistrationStatus,
  MemberType,
  RegistrantType,
} from "@/types/common.types";
import type { League } from "@/constants/leagues";

export interface RawTeam {
  id: string;
  name: string;
  code: string;
  teamCode: string;
  league: League;
  franchiseId: string;
  status: TeamStatus;
  licensed: boolean;
  maxCap: number;
  registrationsTotal: number;
  approvedCount: number;
  pendingCount: number;
  rejectedCount: number;
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
}

export interface RawMember {
  id: string;
  registrationId: string;
  teamId: string;
  fullName: string;
  avatarUrl?: string;
  designation?: string;
  isVip: boolean;
  memberType: MemberType;
  registrantType: RegistrantType;
  roleTitle: string;
  contactNumber: string;
  emailAddress: string;
  status: RegistrationStatus;
  submittedAt: string;
  verifiedAt?: string;
  verifiedBy?: string;
  verificationPasscode?: string;
  passcodeSentTime?: string;
  mealPreference: string;
  dateOfBirth: string;
  division: string;
  rejectionReason?: string;
  rejectionCategory?: string;
  adminRemarks?: string;
  mealCodeGenerated?: string;
  photo: {
    previewUrl: string;
    fileName: string;
    fileSize: string;
    dimensions: string;
  };
}

export interface RawStaff {
  id: string;
  registrationId: string;
  fullName: string;
  avatarUrl?: string;
  designation?: string;
  isVip: boolean;
  role: string;
  department: string;
  contactNumber: string;
  emailAddress: string;
  status: RegistrationStatus;
  submittedAt: string;
  mealEligible: boolean;
  mealPreference: string;
  dateOfBirth: string;
  rejectionReason?: string;
  photo: {
    previewUrl: string;
    fileName: string;
    fileSize: string;
    dimensions: string;
  };
}

export interface RawOrganizer {
  id: string;
  registrationId: string;
  fullName: string;
  avatarUrl?: string;
  designation?: string;
  isVip: boolean;
  role: string;
  organization: string;
  contactNumber: string;
  emailAddress: string;
  status: RegistrationStatus;
  submittedAt: string;
  mealEligible: boolean;
  mealPreference: string;
  dateOfBirth: string;
  rejectionReason?: string;
  photo: {
    previewUrl: string;
    fileName: string;
    fileSize: string;
    dimensions: string;
  };
}

export interface RawAuditEntry {
  id: string;
  actor: string;
  action: string;
  targetId?: string;
  details?: string;
  timestamp: string;
  entityType?: string;
  entityId?: string;
  reason?: string;
  notes?: string;
}

export const INITIAL_TEAMS: RawTeam[] = [];
export const INITIAL_MEMBERS: RawMember[] = [];
export const INITIAL_STAFF: RawStaff[] = [];
export const INITIAL_ORGANIZERS: RawOrganizer[] = [];
export const INITIAL_AUDIT_LOGS: RawAuditEntry[] = [];
