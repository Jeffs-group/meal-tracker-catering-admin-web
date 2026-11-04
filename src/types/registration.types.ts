import type {
  RegistrationStatus,
  TeamStatus,
  RegistrantType,
} from "./common.types";

export interface TeamRegistrationRow {
  id: string;
  teamId: string;
  name: string;
  code: string;
  league: string; // ISCL, KSPL, etc.
  totalRegistrations: number;
  approvedCount: number;
  pendingCount: number;
  rejectedCount: number;
  status: TeamStatus; // ACTIVE | INACTIVE
}

export interface StaffRegistrationRow {
  id: string;
  registrationId: string; // e.g. REG-STF-101
  name: string;
  avatarUrl?: string;
  role: string; // e.g. Operations Coordinator, Medical Staff
  department: string;
  contact: string;
  email: string;
  submittedAt: string;
  status: RegistrationStatus;
  mealEligible: boolean; // active toggle (derived rule: status === 'APPROVED')
}

export interface OrganizerRegistrationRow {
  id: string;
  registrationId: string; // e.g. REG-ORG-201
  name: string;
  avatarUrl?: string;
  role: string; // e.g. Tournament Director, Ground In-Charge
  organization: string;
  contact: string;
  email: string;
  submittedAt: string;
  status: RegistrationStatus;
  mealEligible: boolean;
}

export interface RegistrantPhotoMetadata {
  previewUrl: string;
  fileName: string;
  fileSize: string;
  dimensions: string;
}

export interface RegistrantAttributes {
  franchiseAndDivision: string;
  registrantTypeLabel: string;
  contactNumber: string;
  emailAddress: string;
  mealPreference: string;
  dateOfBirth: string;
}

export interface RegistrantAccreditation {
  registrantId: string; // e.g. CK-2026-099
  verificationPasscode: string; // e.g. VCD-8842-ISCL
  sentTime: string; // e.g. Today 14:31 IST
  qrValue: string; // payload string for QR scanner
  isActive: boolean;
}

export interface RegistrantRejectionInfo {
  primaryCategory: string; // e.g. Incompatible / Blurry Photo Identification
  adminRemarks: string; // Findings & Remarks from admin
}

export interface RegistrantDetail {
  id: string;
  applicationId: string; // e.g. #REG-CK-099 or APP-2026-ISCL-0842
  registrantId: string; // e.g. CK-2026-099 or REG-CK-101
  fullName: string;
  roleTitle: string; // e.g. Player (Chennai Kings)
  registrantType: RegistrantType;
  teamName: string;
  teamId?: string;
  teamStatus?: TeamStatus;
  status: RegistrationStatus;
  submittedAt: string;
  verifiedAt?: string; // e.g. 03 Nov 2026, 14:30 IST
  verifiedBy?: string; // e.g. Alex Morgan

  // Photo
  photo: RegistrantPhotoMetadata;

  // Profile Attributes Grid
  attributes: RegistrantAttributes;

  // Accreditation & Meal Token
  accreditation?: RegistrantAccreditation;

  // Rejection Details
  rejectionReason?: string;
  rejectionInfo?: RegistrantRejectionInfo;

  // Legacy compatibility
  mealCodeGenerated?: string;
}

export interface StaffStats {
  total: number;
  approvedMealEligible: number;
  pending: number;
  rejected: number;
  approvedPercent: number;
  pendingPercent: number;
  rejectedPercent: number;
}
