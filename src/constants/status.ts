import type {
  RegistrationStatus,
  TeamStatus,
  MemberType,
  RegistrantType,
} from "@/types/common.types";

export const REGISTRATION_STATUS_CONFIG: Record<
  RegistrationStatus,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  APPROVED: {
    label: "Approved",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
  },
  PENDING: {
    label: "Pending",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    dot: "bg-amber-500",
  },
  REJECTED: {
    label: "Rejected",
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200",
    dot: "bg-rose-500",
  },
};

export const TEAM_STATUS_CONFIG: Record<
  TeamStatus,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  ACTIVE: {
    label: "Active",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
  },
  INACTIVE: {
    label: "Inactive",
    bg: "bg-slate-100",
    text: "text-slate-600",
    border: "border-slate-200",
    dot: "bg-slate-400",
  },
};

export const MEMBER_TYPE_LABELS: Record<MemberType, string> = {
  PLAYER: "Player",
  OWNER: "Owner",
  COACH: "Coach",
  STAFF: "Staff",
  ORGANIZER: "Organizer",
  OTHERS: "Others",
};

export const REGISTRANT_TYPE_LABELS: Record<RegistrantType, string> = {
  TEAM: "Team Member",
  STAFF: "Staff",
  ORGANIZER: "Organizer",
};

export const LEAGUE_OPTIONS = [
  { value: "", label: "All Leagues" },
  { value: "ISCL", label: "ISCL" },
  { value: "KSPL", label: "KSPL" },
  { value: "TNPL", label: "TNPL" },
];

export const STATUS_FILTER_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "APPROVED", label: "Approved" },
  { value: "PENDING", label: "Pending" },
  { value: "REJECTED", label: "Rejected" },
];

export const TEAM_STATUS_FILTER_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
];
