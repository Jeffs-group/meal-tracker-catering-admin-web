import type {
  MealPeriodConfig,
  MatchdayActivation,
  DistributionRecord,
  CateringUser,
  TeamMemberMealRosterItem,
  StaffMealRosterItem,
} from "@/types/catering.types";
import { DEFAULT_MEALS_CONFIG, OPERATING_DATE_DEFAULT } from "@/constants/catering";

export const MOCK_OPERATING_DATE = OPERATING_DATE_DEFAULT;

export const MOCK_ACTIVATED_TEAMS: Array<{ id: string; name: string; letterCode: string; rosterCap: number }> = [];

export const MOCK_MATCHDAY_ACTIVATIONS: MatchdayActivation[] = [];

export const MOCK_CATERING_USERS: CateringUser[] = [];

export const MOCK_TEAM_ROSTERS: Record<string, TeamMemberMealRosterItem[]> = {};

export const MOCK_STAFF_MEMBERS: StaffMealRosterItem[] = [];

export const GLOBAL_LEDGER: DistributionRecord[] = [];

export const GLOBAL_MEAL_CONFIGS: Record<string, MealPeriodConfig[]> = {
  [MOCK_OPERATING_DATE]: JSON.parse(JSON.stringify(DEFAULT_MEALS_CONFIG)),
};

export const GLOBAL_USERS: CateringUser[] = [];
