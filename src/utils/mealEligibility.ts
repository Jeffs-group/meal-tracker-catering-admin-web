import type { MealEligibilityReason } from "@/types/reports.types";
import type { RegistrationStatus, TeamStatus } from "@/types/common.types";

export interface RegistrantMealContext {
  status: RegistrationStatus;
  teamStatus?: TeamStatus | null;
  hasTeam: boolean;
  mealEligibleToggle?: boolean; // For staff / organizers, true by default unless toggled off
  teamActivatedToday?: boolean; // Matchday activation for operating date
}

/**
 * Returns the exact operational reason code for a registrant's meal eligibility.
 * Reused by UI tables, report summaries, CSV/Excel exports, and reconciliation tests.
 */
export function getMealEligibilityReason(
  context: RegistrantMealContext,
): MealEligibilityReason {
  // 1. Unapproved: Any registrant whose status is not APPROVED is unapproved, regardless of team
  if (context.status !== "APPROVED") {
    return "unapproved";
  }

  // 2. Team Inactive: An approved team member whose team is currently Inactive (season-level gate)
  if (context.hasTeam && context.teamStatus && context.teamStatus !== "ACTIVE") {
    return "team_inactive";
  }

  // 3. Team Not Activated Today: Matchday activation gate by Event Admin
  if (context.hasTeam && context.teamActivatedToday === false) {
    return "not_activated_today";
  }

  // 4. Access Disabled: An approved staff/organizer whose meal pass was manually turned off
  if (!context.hasTeam && context.mealEligibleToggle === false) {
    return "access_disabled";
  }

  // 5. Eligible: Approved AND active team AND activated today (if team) AND meal pass enabled
  return "eligible";
}

/**
 * Pure predicate function returning boolean eligibility status.
 */
export function isMealEligible(context: RegistrantMealContext): boolean {
  return getMealEligibilityReason(context) === "eligible";
}

/**
 * Human-readable labels and explanations for meal access reasons
 */
export const MEAL_REASON_META: Record<
  MealEligibilityReason,
  { label: string; subtext: string; badgeVariant: "success" | "danger" | "neutral" }
> = {
  eligible: {
    label: "Eligible today",
    subtext: "Active gate access",
    badgeVariant: "success",
  },
  team_inactive: {
    label: "Not eligible",
    subtext: "Team inactive",
    badgeVariant: "neutral",
  },
  not_activated_today: {
    label: "Not eligible today",
    subtext: "Team not activated today",
    badgeVariant: "neutral",
  },
  unapproved: {
    label: "Not eligible",
    subtext: "Pending / Rejected",
    badgeVariant: "danger",
  },
  access_disabled: {
    label: "Not eligible",
    subtext: "Access disabled",
    badgeVariant: "neutral",
  },
};
