import { ROUTES } from "./routes";
import type { ReportKey } from "@/types/reports.types";

/**
 * Assumption: Roster compliance threshold is set to 70% as the operational minimum.
 * Teams with approved registrations / total registrations below 70% are flagged as non-compliant.
 */
export const COMPLIANCE_THRESHOLD = 70;

export interface ReportItemConfig {
  key: ReportKey;
  title: string;
  eyebrow: string;
  description: string;
  route: string;
  exportSlug: string;
}

export const REPORTS_CONFIG: Record<ReportKey, ReportItemConfig> = {
  registration: {
    key: "registration",
    title: "Registration Report",
    eyebrow: "CANDIDATE DOSSIER",
    description:
      "Get a consolidated, auditable directory of all candidate registrations received across events and sporting leagues.",
    route: ROUTES.REPORTS_REGISTRATIONS,
    exportSlug: "registration-report",
  },
  team: {
    key: "team",
    title: "Team-wise Registration Report",
    eyebrow: "PARTICIPATION MATRIX",
    description:
      "Understand the registration, roster verification, and approval status of each team across active leagues.",
    route: ROUTES.REPORTS_TEAMS,
    exportSlug: "team-wise-registration",
  },
  "staff-organizer": {
    key: "staff-organizer",
    title: "Staff & Organizer Report",
    eyebrow: "PERSONNEL CREDENTIALS",
    description:
      "Get a consolidated report of registered Staff and Organizers across active logistics streams.",
    route: ROUTES.REPORTS_STAFF_ORGANIZERS,
    exportSlug: "staff-organizer-report",
  },
  "meal-eligibility": {
    key: "meal-eligibility",
    title: "Meal Eligibility Report",
    eyebrow: "ACCREDITATION & GATE ACCESS",
    description:
      "Identify registrants who are currently authorized to claim hospitality vouchers and dining service gates across active venue hubs.",
    route: ROUTES.REPORTS_MEAL_ELIGIBILITY,
    exportSlug: "meal-eligibility-report",
  },
};

export const DATE_RANGE_PRESETS = [
  { label: "Season to date", id: "season_to_date" },
  { label: "Last 7 days", id: "last_7_days" },
  { label: "Last 30 days", id: "last_30_days" },
  { label: "Custom", id: "custom" },
] as const;

export type DateRangePresetId = (typeof DATE_RANGE_PRESETS)[number]["id"];

