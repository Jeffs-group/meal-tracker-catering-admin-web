export type League = "KSPL" | "ISCL";

export interface LeagueConfigItem {
  code: League;
  shortName: string;
  fullName: string;
  tagline: string;
  description: string;
  iconName: string;
}

export const LEAGUE_CONFIG: Record<League, LeagueConfigItem> = {
  KSPL: {
    code: "KSPL",
    shortName: "KSPL League",
    fullName: "Karnataka Softball Premier League",
    tagline: "Premier League Division",
    description: "Tier-1 Premier Championship division for state franchises.",
    iconName: "Trophy",
  },
  ISCL: {
    code: "ISCL",
    shortName: "ISCL League",
    fullName: "Indian Softball Cricket League",
    tagline: "Premier League Division",
    description: "National softball tournament league across all recognized franchises.",
    iconName: "Shield",
  },
};

export const CURRENT_SEASON = {
  year: 2026,
  label: "2026 SEASON",
  status: "Season 2026 Live",
};

export const DEACTIVATION_REASONS = [
  { value: "Season ended", label: "Season ended" },
  { value: "Franchise withdrawn", label: "Franchise withdrawn" },
  { value: "Compliance review", label: "Compliance review" },
  { value: "Payment/licensing issue", label: "Payment/licensing issue" },
  { value: "Duplicate team", label: "Duplicate team" },
  { value: "Other", label: "Other (Specification required)" },
] as const;

export type DeactivationReason =
  (typeof DEACTIVATION_REASONS)[number]["value"];

export const SORT_OPTIONS = [
  { value: "name_asc", label: "Name (A – Z)" },
  { value: "name_desc", label: "Name (Z – A)" },
  { value: "registrants_desc", label: "Most registrants" },
  { value: "approved_desc", label: "Most approved" },
  { value: "updated_desc", label: "Recently updated" },
] as const;

export type SortOptionValue = (typeof SORT_OPTIONS)[number]["value"];

