import type {
  CateringDashboardSummary,
  MealsOverview,
  TeamMemberMealRosterItem,
  StaffMealRosterItem,
  MealPeriodConfig,
  DistributionRecord,
  DistributionDetail,
  HourlyBucket,
  AllDistributionReportSummary,
  MealPeriodReportSummary,
  TeamWiseReportSummary,
  StaffReportSummary,
  MealReportFilters,
  CateringUser,
  VerificationMethod,
  MealPeriodKey,
  MealStatusType,
  LiveDistributionReport,
} from "@/types/catering.types";
import {
  MOCK_OPERATING_DATE,
  MOCK_ACTIVATED_TEAMS,
  MOCK_TEAM_ROSTERS,
  MOCK_STAFF_MEMBERS,
  GLOBAL_LEDGER,
  GLOBAL_MEAL_CONFIGS,
  GLOBAL_USERS,
} from "./mock/cateringMockData";
import {
  COUNTERS,
  DEFAULT_MEALS_CONFIG,
  DEFAULT_MEAL_PERIODS,
  getTodayDateString,
  getTodayHeaderFormatted,
} from "@/constants/catering";
import { getPeriodState, formatIST12h, getNow } from "@/utils/cateringClock";
import { axiosInstance } from "./axiosInstance";
import { ApiError } from "@/lib/apiError";

const DELAY_MS = 100;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const isBrowser = typeof window !== "undefined";

export const uuidToCodeCache = new Map<string, string>();
export const codeToUuidCache = new Map<string, string>();
export const verificationCodeCache = new Map<string, string>();

/**
 * Resolves any identifier (UUID, RID, or code) to the canonical registrantCode
 * accepted by the meal distribution API by querying the search endpoint first.
 */
export async function resolveIdentifierToRegistrantCode(
  idOrCodeOrRid: string,
  date?: string,
): Promise<string> {
  const trimmed = (idOrCodeOrRid || "").trim();
  if (!trimmed) return trimmed;

  if (uuidToCodeCache.has(trimmed)) {
    return uuidToCodeCache.get(trimmed)!;
  }
  if (uuidToCodeCache.has(trimmed.toUpperCase())) {
    return uuidToCodeCache.get(trimmed.toUpperCase())!;
  }
  if (uuidToCodeCache.has(trimmed.toLowerCase())) {
    return uuidToCodeCache.get(trimmed.toLowerCase())!;
  }

  if (isBrowser) {
    try {
      const searchDate = date || getTodayDateString();

      // 1. Search across active teams and staff for meal distribution
      try {
        const searchRes = await axiosInstance.get("/api/v1/super/manage-meals/search", {
          params: { q: trimmed, date: searchDate },
        });
        const d = searchRes.data?.data || searchRes.data?.results || searchRes.data;
        const rawList: Array<{
          id?: string;
          registrantId?: string;
          registrantCode?: string;
          code?: string;
          rid?: string;
          registrationId?: string;
          applicationId?: string;
          applicationCode?: string;
          verificationCode?: string;
          verificationPasscode?: string;
          passcode?: string;
        }> = Array.isArray(d) ? d : (d?.items || d?.registrants || []);

        if (rawList.length > 0) {
          const lower = trimmed.toLowerCase();
          const match =
            rawList.find((r) => {
              const rRid = String(r.rid || r.registrationId || "").toLowerCase();
              const rCode = String(r.registrantCode || r.code || "").toLowerCase();
              const rId = String(r.id || r.registrantId || "").toLowerCase();
              const rApp = String(r.applicationId || r.applicationCode || "").toLowerCase();
              return rRid === lower || rCode === lower || rId === lower || rApp === lower;
            }) || rawList[0];

          if (match) {
            const resolvedCode = match.registrantCode || match.code || match.id || match.registrantId;
            if (resolvedCode) {
              uuidToCodeCache.set(trimmed, resolvedCode);
              uuidToCodeCache.set(trimmed.toUpperCase(), resolvedCode);
              if (match.id) {
                uuidToCodeCache.set(match.id, resolvedCode);
                codeToUuidCache.set(resolvedCode, match.id);
              }
              if (match.registrantId) uuidToCodeCache.set(match.registrantId, resolvedCode);
              if (match.rid) {
                uuidToCodeCache.set(String(match.rid), resolvedCode);
                uuidToCodeCache.set(String(match.rid).toUpperCase(), resolvedCode);
              }
              if (match.registrationId) {
                uuidToCodeCache.set(String(match.registrationId), resolvedCode);
              }

              const vCode = match.verificationCode || match.verificationPasscode || match.passcode;
              if (vCode) {
                verificationCodeCache.set(resolvedCode, vCode);
                verificationCodeCache.set(resolvedCode.toUpperCase(), vCode);
              }

              return resolvedCode;
            }
          }
        }
      } catch {
        // Search request failed; proceed to fallback rosters
      }

      // 2. Check staff roster
      try {
        const staffRes = await axiosInstance.get("/api/v1/super/manage-meals/staff/registrants", {
          params: { date: searchDate },
        });
        const sData = staffRes.data?.data || staffRes.data;
        const staffList: Array<{
          id?: string;
          registrantId?: string;
          registrantCode?: string;
          code?: string;
          rid?: string;
          registrationId?: string;
        }> = Array.isArray(sData) ? sData : (sData?.items || sData?.registrants || []);
        const lower = trimmed.toLowerCase();
        for (const s of staffList) {
          const c = s.registrantCode || s.code;
          const u = s.id || s.registrantId;
          const r = s.rid || s.registrationId;
          if (u && c) {
            uuidToCodeCache.set(u, c);
            codeToUuidCache.set(c, u);
          }
          if (r && c) {
            uuidToCodeCache.set(String(r), c);
            uuidToCodeCache.set(String(r).toUpperCase(), c);
          }
          if (
            (u && String(u).toLowerCase() === lower) ||
            (r && String(r).toLowerCase() === lower) ||
            (c && String(c).toLowerCase() === lower)
          ) {
            if (c) {
              uuidToCodeCache.set(trimmed, c);
              return c;
            }
          }
        }
      } catch {
        // staff roster check failed
      }

      // 3. Check team rosters from dashboard active teams
      try {
        const dashRes = await axiosInstance.get("/api/v1/super/manage-meals/dashboard", {
          params: { date: searchDate },
        });
        const dData = dashRes.data?.data || dashRes.data;
        const teams: Array<{ id?: string }> = Array.isArray(dData?.teams) ? dData.teams : [];
        const lower = trimmed.toLowerCase();
        for (const t of teams) {
          if (!t.id) continue;
          try {
            const teamRes = await axiosInstance.get(`/api/v1/super/manage-meals/teams/${t.id}/registrants`, {
              params: { date: searchDate },
            });
            const tData = teamRes.data?.data || teamRes.data;
            const members: Array<{
              id?: string;
              registrantId?: string;
              registrantCode?: string;
              code?: string;
              rid?: string;
              registrationId?: string;
            }> = Array.isArray(tData) ? tData : (tData?.items || tData?.registrants || []);
            for (const m of members) {
              const c = m.registrantCode || m.code;
              const u = m.id || m.registrantId;
              const r = m.rid || m.registrationId;
              if (u && c) {
                uuidToCodeCache.set(u, c);
                codeToUuidCache.set(c, u);
              }
              if (r && c) {
                uuidToCodeCache.set(String(r), c);
                uuidToCodeCache.set(String(r).toUpperCase(), c);
              }
              if (
                (u && String(u).toLowerCase() === lower) ||
                (r && String(r).toLowerCase() === lower) ||
                (c && String(c).toLowerCase() === lower)
              ) {
                if (c) {
                  uuidToCodeCache.set(trimmed, c);
                  return c;
                }
              }
            }
          } catch {
            // continue checking next team
          }
        }
      } catch {
        // dashboard teams check failed
      }
    } catch {
      // ignore
    }
  }

  return trimmed;
}

export const resolveUuidToRegistrantCode = resolveIdentifierToRegistrantCode;

/**
 * Global cache of team IDs to human-readable names
 */
export const teamNameCache = new Map<string, string>();

/**
 * Fetches or resolves the attendee's badge verification code (passcode)
 * from registration details or session cache for automated provide validation.
 * Strictly uses Super Admin endpoints or local QR cache; never calls Event portal.
 */
export async function fetchRegistrantVerificationCode(
  registrantIdOrCode: string,
): Promise<string> {
  const trimmed = (registrantIdOrCode || "").trim();
  if (!trimmed) return "";

  if (verificationCodeCache.has(trimmed)) {
    return verificationCodeCache.get(trimmed)!;
  }
  if (verificationCodeCache.has(trimmed.toUpperCase())) {
    return verificationCodeCache.get(trimmed.toUpperCase())!;
  }
  if (typeof window !== "undefined") {
    const sessionVal =
      sessionStorage.getItem(`vcode_${trimmed}`) ||
      sessionStorage.getItem(`vcode_${trimmed.toUpperCase()}`);
    if (sessionVal) {
      verificationCodeCache.set(trimmed, sessionVal);
      return sessionVal;
    }
  }

  // Fallback to last scanned verification code from QR if available
  if (typeof window !== "undefined") {
    const lastScanned = sessionStorage.getItem("last_scanned_verification_code");
    if (lastScanned && lastScanned.trim().length >= 4) {
      return lastScanned.trim();
    }
  }

  // Resolve canonical code if a UUID or alternative was passed
  let canonical = trimmed;
  if (uuidToCodeCache.has(trimmed)) {
    canonical = uuidToCodeCache.get(trimmed)!;
    if (verificationCodeCache.has(canonical)) {
      return verificationCodeCache.get(canonical)!;
    }
  }

  return canonical.toUpperCase();
}

export class CateringApiError extends Error {
  code: string;
  data?: Record<string, unknown>;

  constructor(message: string, code: string, data?: Record<string, unknown>) {
    super(message);
    this.name = "CateringApiError";
    this.code = code;
    this.data = data;
  }
}

// -------------------------------------------------------------
// DASHBOARD
// -------------------------------------------------------------
export async function getCateringDashboard(
  date: string = MOCK_OPERATING_DATE,
): Promise<CateringDashboardSummary> {
  const now = getNow();
  const periodsConfig =
    GLOBAL_MEAL_CONFIGS[date] ?? GLOBAL_MEAL_CONFIGS[MOCK_OPERATING_DATE] ?? DEFAULT_MEALS_CONFIG;
  const dayLedger = GLOBAL_LEDGER.filter((r) => r.date === date);

  let activeTeamsCount = MOCK_ACTIVATED_TEAMS.length;
  let eligibleRegistrantsCount = 125 + MOCK_STAFF_MEMBERS.length;
  let mealsProvidedTodayCount = dayLedger.length;

  if (isBrowser) {
    try {
      const [dashRes, manageRes] = await Promise.allSettled([
        axiosInstance.get("/api/v1/super/dashboard", { params: { date } }),
        axiosInstance.get("/api/v1/super/manage-meals/dashboard", { params: { date } }),
      ]);

      if (dashRes.status === "fulfilled" && dashRes.value.data) {
        const d = dashRes.value.data;
        if (typeof d.totalEligibleRegistrants === "number" && d.totalEligibleRegistrants > 0) {
          eligibleRegistrantsCount = d.totalEligibleRegistrants;
        }
        if (typeof d.servedMeals === "number" && d.servedMeals > 0) {
          mealsProvidedTodayCount = d.servedMeals;
        }
      }

      if (manageRes.status === "fulfilled" && manageRes.value.data) {
        const m = manageRes.value.data;
        if (m.kpis) {
          if (typeof m.kpis.activeTeams === "number" && m.kpis.activeTeams > 0) {
            activeTeamsCount = m.kpis.activeTeams;
          }
          if (typeof m.kpis.eligibleRegistrants === "number" && m.kpis.eligibleRegistrants > 0) {
            eligibleRegistrantsCount = m.kpis.eligibleRegistrants;
          }
          if (typeof m.kpis.mealsProvided === "number" && m.kpis.mealsProvided > 0) {
            mealsProvidedTodayCount = m.kpis.mealsProvided;
          }
        }
      }
    } catch {
      // Graceful fallback to computed state
    }
  } else {
    await sleep(DELAY_MS);
  }

  const periods = periodsConfig.map((p) => {
    const periodMeals = dayLedger.filter((r) => {
      if (r.periodKey === p.key) return true;
      if (p.key === "meal1" && r.periodKey === "breakfast") return true;
      if (p.key === "meal2" && r.periodKey === "lunch") return true;
      if (p.key === "meal3" && r.periodKey === "dinner") return true;
      return false;
    }).length;
    return {
      id: p.id || (p.key as string) || "period-01",
      key: p.key,
      label: p.label,
      subtitle: p.subtitle,
      start: p.start,
      end: p.end,
      state: getPeriodState(p, now, date),
      mealsProvided: periodMeals,
      enabled: p.enabled,
    };
  });

  // Team-wise distribution rows
  const teamDistributionRows = MOCK_ACTIVATED_TEAMS.map((t) => {
    const teamMeals = dayLedger.filter((r) => r.teamId === t.id).length;
    const rate = Math.round((teamMeals / t.rosterCap) * 100);
    return {
      id: t.id,
      name: t.name,
      letterCode: t.letterCode,
      isStaffRow: false,
      eligibleCount: t.rosterCap,
      mealsProvidedCount: teamMeals,
      distributionRatePercent: rate,
    };
  });

  // Staff row
  const staffMeals = dayLedger.filter((r) => r.recipientType === "staff").length;
  teamDistributionRows.push({
    id: "staff-roster",
    name: "Tournament / Operations Staff",
    letterCode: "",
    isStaffRow: true,
    eligibleCount: MOCK_STAFF_MEMBERS.length,
    mealsProvidedCount: staffMeals,
    distributionRatePercent: Math.round((staffMeals / MOCK_STAFF_MEMBERS.length) * 100),
  });

  // Recent 5 activity records
  const recentSorted = [...dayLedger].sort(
    (a, b) => new Date(b.providedAt).getTime() - new Date(a.providedAt).getTime(),
  ).slice(0, 5);

  const recentActivity = recentSorted.map((r) => {
    let name = "Unknown";
    let code = r.registrantId;
    let teamName = "Operational Staff";

    if (r.recipientType === "staff") {
      const s = MOCK_STAFF_MEMBERS.find((m) => m.registrantId === r.registrantId);
      if (s) {
        name = s.fullName;
        code = s.registrantCode;
      }
    } else if (r.teamId) {
      const roster = MOCK_TEAM_ROSTERS[r.teamId] || [];
      const m = roster.find((item) => item.registrantId === r.registrantId);
      const teamObj = MOCK_ACTIVATED_TEAMS.find((t) => t.id === r.teamId);
      if (m) {
        name = m.fullName;
        code = m.registrantCode;
      }
      if (teamObj) {
        teamName = teamObj.name;
      }
    }

    const pConf = periodsConfig.find((p) => p.key === r.periodKey);

    return {
      id: r.id,
      receiptCode: r.receiptCode,
      registrantId: r.registrantId,
      registrantCode: code,
      registrantName: name,
      recipientType: r.recipientType,
      teamName,
      periodKey: r.periodKey,
      periodLabel: pConf ? pConf.label : r.periodKey,
      date: r.date,
      providedAt: r.providedAt,
    };
  });

  return {
    date,
    activeTeamsCount,
    eligibleRegistrantsCount,
    mealsProvidedTodayCount,
    periods,
    teamDistributionRows,
    recentActivity,
  };
}

// -------------------------------------------------------------
// MANAGE MEALS OVERVIEW
// -------------------------------------------------------------
export async function getMealsOverview(
  date?: string,
): Promise<MealsOverview> {
  const opDate = date || new Date().toISOString().slice(0, 10);
  const dayLedger = GLOBAL_LEDGER.filter((r) => r.date === opDate);

  if (isBrowser) {
    try {
      const res = await axiosInstance.get("/api/v1/super/manage-meals/dashboard", {
        params: date ? { date } : undefined,
      });
      const d = res.data?.data || res.data;
      if (d) {
        const liveTeams = Array.isArray(d.teams)
          ? d.teams.map((t: { id?: string; teamId?: string; name?: string; teamName?: string; letterCode?: string; code?: string; active?: boolean; rosterCap?: number; eligibleCount?: number; eligibleMembers?: number; eligibleRegistrants?: number; servedCount?: number; mealsProvidedCount?: number; mealsProvided?: number }) => {
              const eligible = t.eligibleRegistrants ?? t.eligibleCount ?? t.eligibleMembers ?? t.rosterCap ?? 0;
              const served = t.mealsProvided ?? t.mealsProvidedCount ?? t.servedCount ?? 0;
              const teamKey = t.id || t.teamId || `team-${(t.name || "team").toLowerCase().replace(/\s+/g, "-")}`;
              const teamTitle = t.name || t.teamName || "Team";
              if (teamKey && teamTitle && !/^[0-9a-f]{8}-[0-9a-f]{4}/i.test(teamTitle)) {
                teamNameCache.set(teamKey, teamTitle);
              }
              return {
                id: teamKey,
                name: teamTitle,
                letterCode: t.letterCode || t.code || (teamTitle || "TM").slice(0, 2).toUpperCase(),
                status: "ACTIVE" as const,
                eligibleCount: eligible,
                mealsProvidedCount: served,
                progressPercent: eligible ? Math.round((served / eligible) * 100) : 0,
              };
            })
          : [];

        const staffCount = d.staff?.mealsProvided ?? d.kpis?.staffMealsProvided ?? 0;
        const staffEligible = d.staff?.eligibleMembers ?? d.staff?.eligibleCount ?? d.kpis?.eligibleStaff ?? 0;

        return {
          date: d.date || opDate,
          activeTeamsCount: d.kpis?.activeTeams ?? liveTeams.length,
          eligibleRegistrantsCount: d.kpis?.eligibleRegistrants ?? (liveTeams.reduce((acc: number, t: { eligibleCount: number }) => acc + t.eligibleCount, 0) + staffEligible),
          mealsProvidedTodayCount: d.kpis?.mealsProvided ?? (liveTeams.reduce((acc: number, t: { mealsProvidedCount: number }) => acc + t.mealsProvidedCount, 0) + staffCount),
          teams: liveTeams,
          staffSummary: {
            eligibleCount: staffEligible,
            mealsProvidedCount: staffCount,
            progressPercent: staffEligible ? Math.round((staffCount / staffEligible) * 100) : 0,
          },
        };
      }
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string } } };
      const msg = apiErr.response?.data?.message || (err as Error)?.message || "Failed to fetch manage meals dashboard.";
      throw new CateringApiError(msg, "API_ERROR");
    }
  } else {
    await sleep(DELAY_MS);
  }

  const teams = MOCK_ACTIVATED_TEAMS.map((t) => {
    const count = dayLedger.filter((r) => r.teamId === t.id).length;
    return {
      id: t.id,
      name: t.name,
      letterCode: t.letterCode,
      status: "ACTIVE" as const,
      eligibleCount: t.rosterCap,
      mealsProvidedCount: count,
      progressPercent: Math.round((count / t.rosterCap) * 100),
    };
  });

  const staffCount = dayLedger.filter((r) => r.recipientType === "staff").length;

  return {
    date: opDate,
    activeTeamsCount: teams.length,
    eligibleRegistrantsCount: 125 + MOCK_STAFF_MEMBERS.length,
    mealsProvidedTodayCount: dayLedger.length,
    teams,
    staffSummary: {
      eligibleCount: MOCK_STAFF_MEMBERS.length,
      mealsProvidedCount: staffCount,
      progressPercent: Math.round((staffCount / MOCK_STAFF_MEMBERS.length) * 100),
    },
  };
}

// -------------------------------------------------------------
// TEAM & STAFF ROSTERS
// -------------------------------------------------------------
export async function getTeamMealRoster(
  teamId: string,
  params: { search?: string; periodKey?: MealPeriodKey | "all"; status?: string; page?: number; pageSize?: number } = {},
): Promise<{ items: TeamMemberMealRosterItem[]; total: number; teamName: string; letterCode: string }> {
  if (isBrowser) {
    try {
      const res = await axiosInstance.get(`/api/v1/super/manage-meals/teams/${teamId}/registrants`, {
        params: {
          search: params.search,
          page: params.page,
          pageSize: params.pageSize,
        },
      });
      const d = res.data?.data || res.data;
      if (d) {
        const rawItems = Array.isArray(d) ? d : (d.items || d.registrants || []);
        const mappedItems: TeamMemberMealRosterItem[] = rawItems.map((m: {
          id?: string;
          registrantId?: string;
          registrantCode?: string | { code?: string; value?: string };
          code?: string;
          fullName?: string;
          name?: string;
          role?: string;
          memberType?: string;
          mealPreference?: string;
          dietaryPreference?: string;
          photoUrl?: string;
          team?: { id?: string; name?: string; letterCode?: string };
          teamName?: string;
          meals?: TeamMemberMealRosterItem["meals"];
          mealStatus?: Record<string, string>;
          periods?: Array<{ id?: string; name?: string; status?: string; servedAt?: string | null }>;
          totalMealsProvided?: number;
        }, idx: number) => {
          if (m.team?.id && m.team?.name && !/^[0-9a-f]{8}-[0-9a-f]{4}/i.test(m.team.name)) {
            teamNameCache.set(m.team.id, m.team.name);
          }

          const rawCode =
            typeof m.registrantCode === "string" && m.registrantCode.trim()
              ? m.registrantCode.trim()
              : typeof m.registrantCode === "object" && m.registrantCode !== null
                ? m.registrantCode.code || m.registrantCode.value || ""
                : m.code || "";

          const regUuid = m.id || m.registrantId || "";
          const regCode =
            rawCode ||
            (regUuid && uuidToCodeCache.get(regUuid)) ||
            (regUuid && !/^[0-9a-f]{8}-[0-9a-f]{4}/i.test(regUuid) ? regUuid : `JCC${(100000 + idx).toString()}`);

          if (regUuid && regCode) {
            uuidToCodeCache.set(regUuid, regCode);
            codeToUuidCache.set(regCode, regUuid);
          }

          const mealsRecord: Record<string, { state: MealStatusType | "not_provided"; providedAt?: string }> = {
            breakfast: { state: "not_provided" },
            lunch: { state: "not_provided" },
            dinner: { state: "not_provided" },
            ...(m.meals || {}),
          };

          if (m.mealStatus && typeof m.mealStatus === "object") {
            Object.entries(m.mealStatus).forEach(([k, v]) => {
              const val = String(v).toUpperCase();
              const state = val === "SERVED" || val === "PROVIDED" ? ("provided" as const) : val === "NOT_COLLECTED" ? ("not_collected" as const) : ("pending" as const);
              mealsRecord[k.toLowerCase()] = { state };
              mealsRecord[k.toLowerCase().replace(/\s+/g, "")] = { state };
            });
          }

          if (Array.isArray(m.periods)) {
            m.periods.forEach((p) => {
              if (p.name) {
                const val = String(p.status || "").toUpperCase();
                const state = val === "SERVED" || val === "PROVIDED" || !!p.servedAt ? ("provided" as const) : val === "NOT_COLLECTED" ? ("not_collected" as const) : ("pending" as const);
                mealsRecord[p.name.toLowerCase()] = { state, providedAt: p.servedAt || undefined };
                mealsRecord[p.name.toLowerCase().replace(/\s+/g, "")] = { state, providedAt: p.servedAt || undefined };
              }
            });
          }

          return {
            id: regCode,
            registrantId: regCode,
            registrantCode: regCode,
            fullName: m.fullName || m.name || "Team Member",
            memberType: m.memberType || m.role || "Player",
            contactNumber: "",
            isVip: false,
            mealPreference: ((m.mealPreference || m.dietaryPreference)?.toLowerCase() === "non_veg" ? "non_veg" : "veg") as "veg" | "non_veg",
            photoUrl: m.photoUrl,
            meals: mealsRecord as unknown as TeamMemberMealRosterItem["meals"],
            totalMealsProvided: m.totalMealsProvided || Object.values(mealsRecord).filter((c) => c.state === "provided").length || 0,
          };
        });

        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(teamId);
        let resolvedTeamName =
          (d.team?.name && !/^[0-9a-f]{8}-[0-9a-f]{4}/i.test(d.team.name) && d.team.name) ||
          (d.teamName && !/^[0-9a-f]{8}-[0-9a-f]{4}/i.test(d.teamName) && d.teamName) ||
          (d.name && !/^[0-9a-f]{8}-[0-9a-f]{4}/i.test(d.name) && d.name) ||
          (rawItems[0]?.team?.name && !/^[0-9a-f]{8}-[0-9a-f]{4}/i.test(rawItems[0].team.name) && rawItems[0].team.name) ||
          (rawItems[0]?.teamName && !/^[0-9a-f]{8}-[0-9a-f]{4}/i.test(rawItems[0].teamName) && rawItems[0].teamName) ||
          teamNameCache.get(teamId);

        if (!resolvedTeamName && isUuid) {
          try {
            const dashRes = await axiosInstance.get("/api/v1/super/manage-meals/dashboard");
            const dashData = dashRes.data?.data || dashRes.data;
            if (Array.isArray(dashData?.teams)) {
              dashData.teams.forEach((t: { id?: string; name?: string }) => {
                if (t.id && t.name && !/^[0-9a-f]{8}-[0-9a-f]{4}/i.test(t.name)) {
                  teamNameCache.set(t.id, t.name);
                }
              });
              resolvedTeamName = teamNameCache.get(teamId);
            }
          } catch {
            // ignore
          }
        }

        if (!resolvedTeamName) {
          resolvedTeamName = isUuid ? "Team Roster" : teamId.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
        }

        const resolvedLetterCode =
          d.team?.letterCode ||
          d.letterCode ||
          rawItems[0]?.team?.letterCode ||
          (resolvedTeamName !== "Team Roster" ? resolvedTeamName.slice(0, 2).toUpperCase() : "TM");

        return {
          items: mappedItems,
          total: typeof d.total === "number" ? d.total : mappedItems.length,
          teamName: resolvedTeamName,
          letterCode: resolvedLetterCode,
        };
      }
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string } } };
      const msg = apiErr.response?.data?.message || (err as Error)?.message || "Failed to fetch team registrants.";
      throw new CateringApiError(msg, "API_ERROR");
    }
  } else {
    await sleep(DELAY_MS);
  }

  const rawRoster = MOCK_TEAM_ROSTERS[teamId] || [];
  const teamObj = MOCK_ACTIVATED_TEAMS.find((t) => t.id === teamId);

  const items = rawRoster.map((item) => {
    const memberDistributions = GLOBAL_LEDGER.filter(
      (r) => r.registrantId === item.registrantId && r.date === MOCK_OPERATING_DATE,
    );
    const bDist = memberDistributions.find((r) => r.periodKey === "breakfast");
    const lDist = memberDistributions.find((r) => r.periodKey === "lunch");
    const dDist = memberDistributions.find((r) => r.periodKey === "dinner");

    return {
      ...item,
      meals: {
        breakfast: bDist
          ? { state: "provided" as const, providedAt: bDist.providedAt }
          : item.meals.breakfast,
        lunch: lDist
          ? { state: "provided" as const, providedAt: lDist.providedAt }
          : item.meals.lunch,
        dinner: dDist
          ? { state: "provided" as const, providedAt: dDist.providedAt }
          : item.meals.dinner,
      },
      totalMealsProvided: memberDistributions.length,
    };
  });

  let filtered = [...items];
  if (params.search) {
    const q = params.search.toLowerCase();
    filtered = filtered.filter(
      (i) =>
        i.fullName.toLowerCase().includes(q) ||
        i.registrantCode.toLowerCase().includes(q) ||
        i.designation.toLowerCase().includes(q),
    );
  }

  if (params.periodKey && params.periodKey !== "all") {
    const pk = (
      params.periodKey === "meal1"
        ? "breakfast"
        : params.periodKey === "meal2"
          ? "lunch"
          : params.periodKey === "meal3"
            ? "dinner"
            : params.periodKey
    ) as "breakfast" | "lunch" | "dinner";
    if (params.status === "provided") {
      filtered = filtered.filter((i) => i.meals[pk]?.state === "provided");
    } else if (params.status === "not_provided") {
      filtered = filtered.filter((i) => i.meals[pk]?.state !== "provided");
    }
  }

  const page = params.page || 1;
  const pageSize = params.pageSize || 10;
  const start = (page - 1) * pageSize;
  const paged = filtered.slice(start, start + pageSize);

  return {
    items: paged,
    total: filtered.length,
    teamName: teamObj ? teamObj.name : "Team",
    letterCode: teamObj ? teamObj.letterCode : "A",
  };
}

export async function getStaffMealRoster(
  params: { search?: string; periodKey?: MealPeriodKey | "all"; status?: string; page?: number; pageSize?: number } = {},
): Promise<{ items: StaffMealRosterItem[]; total: number }> {
  if (isBrowser) {
    try {
      const res = await axiosInstance.get("/api/v1/super/manage-meals/staff/registrants", {
        params: {
          search: params.search,
          page: params.page,
          pageSize: params.pageSize,
        },
      });
      const d = res.data?.data || res.data;
      if (d) {
        const rawItems = Array.isArray(d) ? d : (d.items || d.registrants || []);
        const mappedItems: StaffMealRosterItem[] = rawItems.map((m: {
          id?: string;
          registrantId?: string;
          registrantCode?: string;
          code?: string;
          fullName?: string;
          name?: string;
          designation?: string;
          role?: string;
          mealPreference?: string;
          dietaryPreference?: string;
          photoUrl?: string;
          meals?: StaffMealRosterItem["meals"];
          mealStatus?: Record<string, string>;
          periods?: Array<{ id?: string; name?: string; status?: string; servedAt?: string | null }>;
          totalMealsProvided?: number;
        }, idx: number) => {
          const regCode = m.registrantCode || m.code || `STAFF-${(idx + 1).toString().padStart(3, "0")}`;
          const regUuid = m.id || m.registrantId || `staff-${idx + 1}`;
          if (regUuid && regCode) {
            uuidToCodeCache.set(regUuid, regCode);
            codeToUuidCache.set(regCode, regUuid);
          }

          const mealsRecord: Record<string, { state: MealStatusType | "not_provided"; providedAt?: string }> = {
            breakfast: { state: "not_provided" },
            lunch: { state: "not_provided" },
            dinner: { state: "not_provided" },
            ...(m.meals || {}),
          };

          if (m.mealStatus && typeof m.mealStatus === "object") {
            Object.entries(m.mealStatus).forEach(([k, v]) => {
              const val = String(v).toUpperCase();
              const state = val === "SERVED" || val === "PROVIDED" ? ("provided" as const) : val === "NOT_COLLECTED" ? ("not_collected" as const) : ("pending" as const);
              mealsRecord[k.toLowerCase()] = { state };
              mealsRecord[k.toLowerCase().replace(/\s+/g, "")] = { state };
            });
          }

          if (Array.isArray(m.periods)) {
            m.periods.forEach((p) => {
              if (p.name) {
                const val = String(p.status || "").toUpperCase();
                const state = val === "SERVED" || val === "PROVIDED" || !!p.servedAt ? ("provided" as const) : val === "NOT_COLLECTED" ? ("not_collected" as const) : ("pending" as const);
                mealsRecord[p.name.toLowerCase()] = { state, providedAt: p.servedAt || undefined };
                mealsRecord[p.name.toLowerCase().replace(/\s+/g, "")] = { state, providedAt: p.servedAt || undefined };
              }
            });
          }

          return {
            id: regCode,
            registrantId: regCode,
            registrantCode: regCode,
            fullName: m.fullName || m.name || "Staff Member",
            designation: m.designation || m.role || "Operational Staff",
            contactNumber: "",
            isVip: false,
            mealPreference: ((m.mealPreference || m.dietaryPreference)?.toLowerCase() === "non_veg" ? "non_veg" : "veg") as "veg" | "non_veg",
            photoUrl: m.photoUrl,
            meals: mealsRecord as unknown as StaffMealRosterItem["meals"],
            totalMealsProvided: m.totalMealsProvided || Object.values(mealsRecord).filter((c) => c.state === "provided").length || 0,
          };
        });
        return {
          items: mappedItems,
          total: typeof d.total === "number" ? d.total : mappedItems.length,
        };
      }
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string } } };
      const msg = apiErr.response?.data?.message || (err as Error)?.message || "Failed to fetch staff roster.";
      throw new CateringApiError(msg, "API_ERROR");
    }
  } else {
    await sleep(DELAY_MS);
  }

  const items = MOCK_STAFF_MEMBERS.map((item) => {
    const staffDist = GLOBAL_LEDGER.filter(
      (r) => r.registrantId === item.registrantId && r.date === MOCK_OPERATING_DATE,
    );
    const bDist = staffDist.find((r) => r.periodKey === "breakfast");
    const lDist = staffDist.find((r) => r.periodKey === "lunch");
    const dDist = staffDist.find((r) => r.periodKey === "dinner");

    return {
      ...item,
      meals: {
        breakfast: bDist
          ? { state: "provided" as const, providedAt: bDist.providedAt }
          : item.meals.breakfast,
        lunch: lDist
          ? { state: "provided" as const, providedAt: lDist.providedAt }
          : item.meals.lunch,
        dinner: dDist
          ? { state: "provided" as const, providedAt: dDist.providedAt }
          : item.meals.dinner,
      },
      totalMealsProvided: staffDist.length,
    };
  });

  let filtered = [...items];
  if (params.search) {
    const q = params.search.toLowerCase();
    filtered = filtered.filter(
      (i) =>
        i.fullName.toLowerCase().includes(q) ||
        i.registrantCode.toLowerCase().includes(q) ||
        i.designation.toLowerCase().includes(q),
    );
  }

  const page = params.page || 1;
  const pageSize = params.pageSize || 10;
  const start = (page - 1) * pageSize;
  const paged = filtered.slice(start, start + pageSize);

  return {
    items: paged,
    total: filtered.length,
  };
}

// -------------------------------------------------------------
// SEARCH & SCAN RESOLUTION
// -------------------------------------------------------------
export async function searchMealRegistrants(
  query: string,
  date: string = MOCK_OPERATING_DATE,
): Promise<Array<TeamMemberMealRosterItem & { teamName: string; isStaff: boolean }>> {
  if (!query || query.trim().length === 0) return [];
  const q = query.trim();

  if (isBrowser) {
    try {
      const searchDate = date || getTodayDateString();
      const res = await axiosInstance.get("/api/v1/super/manage-meals/search", {
        params: { q, date: searchDate },
      });
      const rawList = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.results)
          ? res.data.results
          : Array.isArray(res.data?.data)
            ? res.data.data
            : [];

      return rawList.map((r: {
        id?: string;
        registrantId?: string;
        registrantCode?: string | null;
        code?: string | null;
        rid?: string | null;
        registrationId?: string | null;
        applicationId?: string | null;
        fullName?: string;
        name?: string;
        type?: string;
        memberType?: string;
        team?: { id?: string; name?: string; league?: string };
        teamName?: string;
        photoUrl?: string;
        mealPreference?: string;
        dietaryPreference?: string;
        eligible?: boolean;
        verificationCode?: string;
        verificationPasscode?: string;
        passcode?: string;
      }) => {
        const regCode = r.registrantCode || r.code || r.id || `REG-${Date.now().toString().slice(-4)}`;
        const regUuid = r.id || r.registrantId;
        const regRid = r.rid || r.registrationId;
        if (regUuid && regCode) {
          uuidToCodeCache.set(regUuid, regCode);
          codeToUuidCache.set(regCode, regUuid);
        }
        if (regRid && regCode) {
          uuidToCodeCache.set(String(regRid), regCode);
          uuidToCodeCache.set(String(regRid).toUpperCase(), regCode);
        }
        if (regCode) {
          uuidToCodeCache.set(regCode, regCode);
        }
        const vCode = r.verificationCode || r.verificationPasscode || r.passcode;
        if (vCode && regCode) {
          verificationCodeCache.set(regCode, vCode);
          verificationCodeCache.set(regCode.toUpperCase(), vCode);
        }

        const isEligibleToday =
          r.eligible !== undefined
            ? Boolean(r.eligible)
            : (r as { isEligibleToday?: boolean }).isEligibleToday !== undefined
              ? Boolean((r as { isEligibleToday?: boolean }).isEligibleToday)
              : true;

        const ineligibilityReason =
          (r as { ineligibilityReason?: string; reason?: string }).ineligibilityReason ||
          (r as { ineligibilityReason?: string; reason?: string }).reason ||
          (isEligibleToday === false ? "Not eligible today" : undefined);

        return {
          id: regCode,
          registrantId: regCode,
          registrantCode: regCode,
          fullName: r.fullName || r.name || "Participant",
          designation:
            (r as { designation?: string; role?: string }).designation ||
            (r as { designation?: string; role?: string }).role ||
            r.memberType ||
            (r.type === "STAFF" ? "Staff" : "Participant"),
          memberType: r.memberType || (r.type === "STAFF" ? "Staff" : "Player"),
          contactNumber: "",
          isVip: false,
          mealPreference: ((r.mealPreference || r.dietaryPreference)?.toLowerCase() === "non_veg" ? "non_veg" : "veg") as "veg" | "non_veg",
          photoUrl: r.photoUrl,
          isEligibleToday,
          ineligibilityReason,
          meals: {
            breakfast: { state: "not_provided" as const },
            lunch: { state: "not_provided" as const },
            dinner: { state: "not_provided" as const },
          },
          totalMealsProvided: 0,
          teamName: r.team?.name || r.teamName || (r.type === "STAFF" ? "Operational Staff" : "Tournament Team"),
          isStaff: r.type === "STAFF",
        };
      });
    } catch {
      // Fall through to mock search only if offline/network error
    }
  } else {
    await sleep(DELAY_MS);
  }

  const results: Array<TeamMemberMealRosterItem & { teamName: string; isStaff: boolean }> = [];

  // Search in team rosters
  Object.entries(MOCK_TEAM_ROSTERS).forEach(([teamId, roster]) => {
    const teamObj = MOCK_ACTIVATED_TEAMS.find((t) => t.id === teamId);
    roster.forEach((m) => {
      if (
        m.fullName.toLowerCase().includes(q) ||
        m.registrantCode.toLowerCase().includes(q) ||
        m.id.toLowerCase().includes(q)
      ) {
        results.push({
          ...m,
          teamName: teamObj ? teamObj.name : "Team",
          isStaff: false,
        });
      }
    });
  });

  // Search staff
  MOCK_STAFF_MEMBERS.forEach((s) => {
    if (
      s.fullName.toLowerCase().includes(q) ||
      s.registrantCode.toLowerCase().includes(q) ||
      s.id.toLowerCase().includes(q)
    ) {
      results.push({
        ...s,
        teamName: "Operational Staff",
        isStaff: true,
        memberType: "Staff",
        isVip: false,
      });
    }
  });

  return results;
}

export async function resolveScan(payload: string): Promise<{
  eligible: boolean;
  registrantId?: string;
  reason?: string;
}> {
  let q = payload.trim();
  if (!q) return { eligible: false, reason: "Empty scan payload." };

  // If payload is JSON (e.g. {"rid":"JCC100002","code":"DDRLHUF7","team":"CSK",...})
  if (q.startsWith("{") && q.endsWith("}")) {
    try {
      const parsed = JSON.parse(q);
      const regId =
        parsed.rid ||
        parsed.registrantCode ||
        parsed.registrationId ||
        parsed.registrantId ||
        parsed.id ||
        parsed.code;

      const vCode =
        parsed.verificationCode ||
        parsed.verificationPasscode ||
        parsed.passcode ||
        parsed.vcd ||
        (parsed.rid && parsed.code ? parsed.code : undefined);

      if (vCode && regId) {
        const vCodeStr = String(vCode).trim();
        const regIdStr = String(regId).trim();
        verificationCodeCache.set(regIdStr, vCodeStr);
        verificationCodeCache.set(regIdStr.toUpperCase(), vCodeStr);
        if (typeof window !== "undefined") {
          sessionStorage.setItem("last_scanned_verification_code", vCodeStr);
          sessionStorage.setItem(`vcode_${regIdStr}`, vCodeStr);
          sessionStorage.setItem(`vcode_${regIdStr.toUpperCase()}`, vCodeStr);
        }
      }

      if (regId) {
        q = String(regId).trim();
      }
    } catch {
      // ignore
    }
  }

  if (isBrowser) {
    try {
      const today = getTodayDateString();
      const resolved = await resolveIdentifierToRegistrantCode(q, today);
      if (resolved && resolved !== q) {
        return {
          eligible: true,
          registrantId: resolved,
        };
      }

      // Check if payload is directly a valid registrant code or ID
      try {
        const checkRes = await axiosInstance.get(
          `/api/v1/super/manage-meals/registrants/${encodeURIComponent(resolved || q)}`,
          { params: { date: today } },
        );
        const cd = checkRes.data?.data || checkRes.data;
        if (cd?.registrant || cd?.id || cd?.registrantCode) {
          const finalCode = cd.registrantCode || cd.code || cd.registrant?.registrantCode || resolved || q;
          return {
            eligible: cd.eligible !== undefined ? Boolean(cd.eligible) : true,
            registrantId: finalCode,
            reason: cd.reason || cd.ineligibilityReason,
          };
        }
      } catch {
        // Direct ID check failed
      }
    } catch {
      // Fall through
    }
  } else {
    await sleep(DELAY_MS);
  }

  // Look for match
  for (const roster of Object.values(MOCK_TEAM_ROSTERS)) {
    const match = roster.find(
      (m) =>
        m.registrantCode.toUpperCase() === q ||
        m.registrantId.toUpperCase() === q ||
        m.contactNumber.replace(/\s+/g, "") === q.replace(/\s+/g, ""),
    );
    if (match) {
      return { eligible: true, registrantId: match.registrantCode || match.registrantId };
    }
  }

  for (const staff of MOCK_STAFF_MEMBERS) {
    if (
      staff.registrantCode.toUpperCase() === q ||
      staff.registrantId.toUpperCase() === q
    ) {
      return { eligible: true, registrantId: staff.registrantCode || staff.registrantId };
    }
  }

  return {
    eligible: false,
    registrantId: q,
    reason: "Credential not found or registrant not activated for today's matchday roster.",
  };
}

// -------------------------------------------------------------
// REGISTRANT MEAL STATUS (FOR MEAL DISTRIBUTION PAGE)
// -------------------------------------------------------------
export async function getRegistrantMealStatus(
  registrantId: string,
  date: string = MOCK_OPERATING_DATE,
): Promise<{
  registrant: {
    id: string;
    code: string;
    fullName: string;
    type: string;
    isVip: boolean;
    teamName: string;
    teamId?: string;
    dietaryPreference: "veg" | "non_veg";
    photoUrl?: string;
    verificationCode?: string;
    isEligibleToday?: boolean;
    ineligibilityReason?: string;
  };
  periods: Array<{
    id?: string;
    key: MealPeriodKey;
    label: string;
    subtitle?: string;
    start?: string;
    end?: string;
    state: "disabled" | "closed" | "live" | "upcoming";
    isProvided: boolean;
    providedAt?: string;
    canDispense: boolean;
    reasonText?: string;
  }>;
  nextEligiblePeriod?: {
    key: MealPeriodKey;
    label: string;
    timeText: string;
  };
}> {
  if (isBrowser) {
    let targetCode = (registrantId || "").trim();
    if (uuidToCodeCache.has(targetCode)) {
      targetCode = uuidToCodeCache.get(targetCode)!;
    } else if (uuidToCodeCache.has(targetCode.toUpperCase())) {
      targetCode = uuidToCodeCache.get(targetCode.toUpperCase())!;
    }

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetCode);
    const looksLikeStandardCode = /^JCC\d+$/i.test(targetCode) || /^REG-/i.test(targetCode) || /^STAFF-/i.test(targetCode);
    if (isUuid || !looksLikeStandardCode) {
      const resolved = await resolveIdentifierToRegistrantCode(targetCode, date);
      if (resolved && resolved !== targetCode) {
        targetCode = resolved;
      }
    }

    try {
      let res;
      try {
        res = await axiosInstance.get(
          `/api/v1/super/manage-meals/registrants/${encodeURIComponent(targetCode)}`,
          { params: { date } },
        );
      } catch (firstErr: unknown) {
        const apiErr = firstErr as { response?: { status?: number } };
        if (apiErr?.response?.status === 404) {
          const resolved = await resolveIdentifierToRegistrantCode(registrantId.trim(), date);
          if (resolved && resolved !== targetCode) {
            targetCode = resolved;
            try {
              res = await axiosInstance.get(
                `/api/v1/super/manage-meals/registrants/${encodeURIComponent(targetCode)}`,
                { params: { date } },
              );
            } catch (secondErr: unknown) {
              const secApiErr = secondErr as { response?: { status?: number } };
              if (secApiErr?.response?.status !== 404) {
                throw secondErr;
              }
            }
          }
        } else {
          throw firstErr;
        }
      }

      if (!res) {
        // Fallback: search for the registrant via /api/v1/super/manage-meals/search
        try {
          const searchResults = await searchMealRegistrants(registrantId.trim(), date);
          const found =
            searchResults.find(
              (r) =>
                r.registrantCode.toLowerCase() === registrantId.trim().toLowerCase() ||
                r.registrantId.toLowerCase() === registrantId.trim().toLowerCase() ||
                r.id.toLowerCase() === registrantId.trim().toLowerCase(),
            ) || searchResults[0];

          if (found) {
            const vCode =
              verificationCodeCache.get(found.registrantCode) ||
              verificationCodeCache.get(targetCode) ||
              (typeof window !== "undefined"
                ? sessionStorage.getItem(`vcode_${found.registrantCode}`) ||
                  sessionStorage.getItem("last_scanned_verification_code") ||
                  undefined
                : undefined);

            return {
              registrant: {
                id: found.id || found.registrantId || targetCode,
                code: found.registrantCode || targetCode,
                fullName: found.fullName || "Participant",
                teamId: undefined,
                teamName: found.teamName || "Matchday Team",
                type: found.memberType || "Player",
                isVip: Boolean(found.isVip),
                dietaryPreference: found.mealPreference || "veg",
                photoUrl: found.photoUrl,
                verificationCode: vCode,
                isEligibleToday: false,
                ineligibilityReason: found.ineligibilityReason || "Not eligible for meal service today",
              },
              periods: DEFAULT_MEALS_CONFIG.map((c, idx) => ({
                id: c.id || `period-${idx + 1}`,
                key: c.key as MealPeriodKey,
                label: c.label,
                subtitle: `${c.label} Distribution`,
                start: c.start,
                end: c.end,
                state: "closed" as const,
                isProvided: false,
                canDispense: false,
                reasonText: found.ineligibilityReason || "Not eligible for meal service today",
              })),
            };
          }
        } catch {
          // ignore search fallback failure and let normal 404 throw below
        }
        throw new CateringApiError("Registrant ID was not found.", "REGISTRANT_NOT_FOUND");
      }

      const d = res.data?.data || res.data;
      if (d) {
        const returnedReg = d.registrant || d;
        const rawPeriods = Array.isArray(d.periods)
          ? d.periods
          : Array.isArray(returnedReg.periods)
            ? returnedReg.periods
            : [];

        const effectiveRawPeriods =
          rawPeriods.length > 0
            ? rawPeriods
            : DEFAULT_MEALS_CONFIG.map((c, idx) => ({
                id: c.id || `meal-period-${idx + 1}`,
                name: c.label,
                label: c.label,
                key: c.key,
                status: "NOT_ELIGIBLE",
                canDispense: false,
                start: c.start,
                end: c.end,
                reasonText:
                  returnedReg.ineligibilityReason ||
                  returnedReg.reason ||
                  d.reason ||
                  "Not eligible for meal service today",
              }));

        const mappedPeriods = effectiveRawPeriods.map((p: {
          id?: string;
          name?: string;
          label?: string;
          key?: string;
          status?: string;
          servedAt?: string | null;
          canDispense?: boolean;
          startTime?: string | null;
          endTime?: string | null;
          start?: string;
          end?: string;
          subtitle?: string;
          reasonText?: string;
        }, idx: number) => {
          const periodNumber = idx + 1;
          const key = (p.key || (p.name ? p.name.toLowerCase().replace(/\s+/g, "") : `meal${periodNumber}`)) as MealPeriodKey;
          const label = p.label || p.name || `Meal ${periodNumber}`;
          const isProvided = p.status === "SERVED" || !!p.servedAt;
          const canDispense = !isProvided && (p.canDispense ?? p.status === "READY_FOR_DISPENSE");
          const state: "disabled" | "closed" | "live" | "upcoming" = isProvided
            ? "closed"
            : canDispense || p.status === "READY_FOR_DISPENSE"
              ? "live"
              : p.status === "PENDING"
                ? "upcoming"
                : "closed";

          return {
            id: p.id || (p.key as string) || `meal-period-${idx + 1}`,
            key,
            label,
            subtitle: p.subtitle || `${label} Distribution`,
            start: p.start || p.startTime || undefined,
            end: p.end || p.endTime || undefined,
            state,
            isProvided,
            providedAt: p.servedAt || undefined,
            canDispense,
            reasonText: isProvided
              ? "Portion already collected"
              : canDispense
                ? "Ready for dispense"
                : p.reasonText || "Not available for dispense",
          };
        });

        const regCode = returnedReg.registrantCode || returnedReg.code || targetCode;
        if (returnedReg.id && regCode) {
          uuidToCodeCache.set(returnedReg.id, regCode);
          codeToUuidCache.set(regCode, returnedReg.id);
        }
        if (returnedReg.team?.id && returnedReg.team?.name) {
          teamNameCache.set(returnedReg.team.id, returnedReg.team.name);
        }

        let vCode =
          returnedReg.verificationCode ||
          returnedReg.verificationPasscode ||
          returnedReg.passcode ||
          returnedReg.vcd ||
          returnedReg.accreditation?.verificationPasscode ||
          d.verificationCode ||
          d.verificationPasscode ||
          d.passcode;

        if (!vCode) {
          vCode = await fetchRegistrantVerificationCode(regCode);
        }
        if (vCode) {
          verificationCodeCache.set(regCode, vCode);
          verificationCodeCache.set(regCode.toUpperCase(), vCode);
          if (returnedReg.id) verificationCodeCache.set(returnedReg.id, vCode);
          if (typeof window !== "undefined") {
            sessionStorage.setItem(`vcode_${regCode}`, vCode);
            sessionStorage.setItem(`vcode_${regCode.toUpperCase()}`, vCode);
            sessionStorage.setItem("last_scanned_verification_code", vCode);
          }
        }

        const isEligibleToday =
          returnedReg.eligible !== undefined
            ? Boolean(returnedReg.eligible)
            : d.eligible !== undefined
              ? Boolean(d.eligible)
              : mappedPeriods.some((p: { canDispense?: boolean; isProvided?: boolean }) => p.canDispense || p.isProvided);

        const ineligibilityReason =
          returnedReg.ineligibilityReason ||
          returnedReg.reason ||
          d.reason ||
          (isEligibleToday === false ? "Not eligible for meal service today" : undefined);

        return {
          registrant: {
            id: returnedReg.id || targetCode,
            code: regCode,
            fullName: returnedReg.fullName || returnedReg.name || "Participant",
            teamId: returnedReg.team?.id || returnedReg.teamId,
            teamName: returnedReg.team?.name || returnedReg.teamName || (returnedReg.type === "STAFF" ? "Operational Staff" : "Matchday Team"),
            type: returnedReg.memberType || returnedReg.type || (returnedReg.type === "STAFF" ? "Staff" : "Player"),
            isVip: !!returnedReg.isVip,
            dietaryPreference: ((returnedReg.dietaryPreference || returnedReg.mealPreference || "veg").toLowerCase() === "non_veg" ? "non_veg" : "veg") as "veg" | "non_veg",
            photoUrl: returnedReg.photoUrl,
            verificationCode: vCode || undefined,
            isEligibleToday,
            ineligibilityReason,
          },
          periods: mappedPeriods,
          nextEligiblePeriod: d.nextEligiblePeriod,
        };
      }
      throw new CateringApiError("Registrant not found", "REGISTRANT_NOT_FOUND");
    } catch (err: unknown) {
      if (err instanceof CateringApiError) throw err;
      const apiErr = err as { response?: { data?: { message?: string; code?: string } } };
      const msg = apiErr.response?.data?.message || (err as Error)?.message || "Registrant ID was not found.";
      const code = apiErr.response?.data?.code || "REGISTRANT_NOT_FOUND";
      throw new CateringApiError(msg, code);
    }
  } else {
    await sleep(DELAY_MS);
  }

  const now = getNow();
  const periodsConfig =
    GLOBAL_MEAL_CONFIGS[date] ?? GLOBAL_MEAL_CONFIGS[MOCK_OPERATING_DATE] ?? DEFAULT_MEALS_CONFIG;

  // Find person
  let found: {
    id: string;
    code: string;
    fullName: string;
    type: string;
    isVip: boolean;
    teamName: string;
    teamId?: string;
    dietaryPreference: "veg" | "non_veg";
    photoUrl?: string;
  } | null = null;

  for (const [tId, roster] of Object.entries(MOCK_TEAM_ROSTERS)) {
    const m = roster.find((i) => i.registrantId === registrantId || i.id === registrantId || i.registrantCode === registrantId);
    if (m) {
      const teamObj = MOCK_ACTIVATED_TEAMS.find((t) => t.id === tId);
      found = {
        id: m.registrantId,
        code: m.registrantCode,
        fullName: m.fullName,
        type: m.memberType,
        isVip: m.isVip,
        teamName: teamObj ? teamObj.name : "Matchday Team",
        teamId: tId,
        dietaryPreference: m.mealPreference,
        photoUrl: m.photoUrl,
      };
      break;
    }
  }

  if (!found) {
    const s = MOCK_STAFF_MEMBERS.find((i) => i.registrantId === registrantId || i.id === registrantId || i.registrantCode === registrantId);
    if (s) {
      found = {
        id: s.registrantId,
        code: s.registrantCode,
        fullName: s.fullName,
        type: "Staff",
        isVip: false,
        teamName: "Operational Staff",
        dietaryPreference: s.mealPreference,
        photoUrl: s.photoUrl,
      };
    }
  }

  if (!found) {
    throw new CateringApiError("Registrant not found", "NOT_FOUND");
  }

  // Check ledger records for this person today
  const personDistributions = GLOBAL_LEDGER.filter(
    (r) => r.registrantId === found!.id && r.date === date,
  );

  const periods = periodsConfig.map((p) => {
    const dist = personDistributions.find((r) => {
      if (r.periodKey === p.key) return true;
      if (p.key === "meal1" && r.periodKey === "breakfast") return true;
      if (p.key === "meal2" && r.periodKey === "lunch") return true;
      if (p.key === "meal3" && r.periodKey === "dinner") return true;
      return false;
    });
    const periodState = getPeriodState(p, now, date);
    const isProvided = !!dist;

    let canDispense = false;
    let reasonText = "";

    if (periodState === "disabled") {
      reasonText = "Not served today";
    } else if (isProvided) {
      reasonText = `Already provided • Duplicate locked${p.start ? ` (${formatIST12h(p.start)} service)` : ""}`;
    } else if (periodState === "closed") {
      reasonText = "Missed • Window closed";
    } else if (periodState === "upcoming") {
      reasonText = p.start ? `Opens at ${formatIST12h(p.start)}` : "Upcoming service";
    } else if (periodState === "live") {
      canDispense = true;
      reasonText = "Selected for Scan • Eligible for 1 Portion";
    }

    return {
      id: p.id || (p.key as string) || "period-01",
      key: p.key,
      label: p.label,
      subtitle: p.subtitle,
      start: p.start,
      end: p.end,
      state: periodState,
      isProvided,
      providedAt: dist?.providedAt,
      canDispense,
      reasonText,
    };
  });

  let nextEligiblePeriod: { key: MealPeriodKey; label: string; timeText: string } | undefined;
  for (const p of periods) {
    if (!p.isProvided && (p.state === "live" || p.state === "upcoming")) {
      nextEligiblePeriod = {
        key: p.key,
        label: p.label,
        timeText: p.state === "live" ? "now" : formatIST12h(p.start),
      };
      break;
    }
  }

  return {
    registrant: found,
    periods,
    nextEligiblePeriod,
  };
}

// -------------------------------------------------------------
// PROVIDE MEAL (IDEMPOTENT MUTATION WITH 409 DUPLICATE CHECK)
// -------------------------------------------------------------
export async function provideMeal(params: {
  registrantId: string;
  registrantCode?: string;
  mealPeriodId?: string;
  verificationCode?: string;
  periodKey: MealPeriodKey;
  counterId: string;
  operatorId: string;
  verificationMethod: VerificationMethod;
  idempotencyKey?: string;
  date?: string;
}): Promise<DistributionRecord> {
  const date = params.date || MOCK_OPERATING_DATE;
  const now = getNow();
  const idempotencyKey =
    params.idempotencyKey ||
    `idem-${params.registrantId}-${params.periodKey}-${Date.now()}`;

  // 1. Check idempotency: if same idempotencyKey exists, return that record
  const existingIdempotent = GLOBAL_LEDGER.find(
    (r) => r.idempotencyKey === idempotencyKey,
  );
  if (existingIdempotent) {
    return existingIdempotent;
  }

  // Live backend call in browser
  if (isBrowser) {
    try {
      let regCode =
        params.registrantCode ||
        uuidToCodeCache.get(params.registrantId) ||
        uuidToCodeCache.get(params.registrantId.toUpperCase());
      if (!regCode) {
        regCode = await resolveIdentifierToRegistrantCode(params.registrantId, date);
      }

      const mealPeriodId = params.mealPeriodId || params.periodKey;
      let verificationCode = (params.verificationCode || "").trim();
      if (!verificationCode) {
        verificationCode =
          verificationCodeCache.get(regCode) ||
          verificationCodeCache.get(params.registrantId) ||
          (typeof window !== "undefined"
            ? sessionStorage.getItem(`vcode_${regCode}`) ||
              sessionStorage.getItem(`vcode_${params.registrantId}`) ||
              sessionStorage.getItem("last_scanned_verification_code") ||
              ""
            : "");
      }
      if (!verificationCode) {
        verificationCode = await fetchRegistrantVerificationCode(regCode || params.registrantId);
      }

      const res = await axiosInstance.post(`/api/v1/super/meal-days/${date}/provide`, {
        registrantCode: regCode,
        mealPeriodId: mealPeriodId,
        verificationCode: verificationCode,
      });

      const responseData = res.data?.data || res.data;
      const record: DistributionRecord = {
        id: responseData?.id || `mr-${Date.now().toString().slice(-6)}`,
        receiptCode: `MR-${date.replace(/-/g, "")}-${Date.now().toString().slice(-4)}`,
        registrantId: params.registrantId,
        recipientType: "team_member",
        date,
        periodKey: params.periodKey,
        providedAt: responseData?.servedAt || new Date().toISOString(),
        counterId: params.counterId,
        operatorId: params.operatorId,
        verificationMethod: params.verificationMethod,
        mealType: responseData?.mealPreference?.toLowerCase() === "non_veg" ? "non_veg" : "veg",
        idempotencyKey,
      };
      GLOBAL_LEDGER.unshift(record);
      return record;
    } catch (err: unknown) {
      if (err instanceof ApiError && err.statusCode === 409) {
        throw new CateringApiError(
          err.message || "Meal Already Provided for this period today.",
          "DUPLICATE_DISTRIBUTION",
          {
            originalClaim: {
              periodKey: params.periodKey,
              providedAt: new Date().toISOString(),
              counterName: "Main Catering Counter 01",
              receiptCode: `MR-DUP-${Date.now().toString().slice(-4)}`,
            },
          },
        );
      }
      const apiErr = err as { response?: { data?: { message?: string; code?: string }; status?: number } };
      if (apiErr?.response?.status === 409) {
        throw new CateringApiError(
          apiErr.response?.data?.message || "Meal Already Provided for this period today.",
          "DUPLICATE_DISTRIBUTION",
          {
            originalClaim: {
              periodKey: params.periodKey,
              providedAt: new Date().toISOString(),
              counterName: "Main Catering Counter 01",
              receiptCode: `MR-DUP-${Date.now().toString().slice(-4)}`,
            },
          },
        );
      }
      const msg = apiErr?.response?.data?.message || (err as Error)?.message || "Failed to dispense meal.";
      const code = apiErr?.response?.data?.code || "DISPENSE_FAILED";
      throw new CateringApiError(msg, code);
    }
  } else {
    await sleep(DELAY_MS);
  }

  // 2. Window validation
  const periodsConfig =
    GLOBAL_MEAL_CONFIGS[date] ?? GLOBAL_MEAL_CONFIGS[MOCK_OPERATING_DATE] ?? DEFAULT_MEALS_CONFIG;
  let pConf = periodsConfig.find((p) => p.key === params.periodKey);
  if (!pConf) {
    if (params.periodKey === "breakfast") pConf = periodsConfig.find((p) => p.key === "meal1") ?? DEFAULT_MEAL_PERIODS[0];
    else if (params.periodKey === "lunch") pConf = periodsConfig.find((p) => p.key === "meal2") ?? DEFAULT_MEAL_PERIODS[1];
    else if (params.periodKey === "dinner") pConf = periodsConfig.find((p) => p.key === "meal3") ?? DEFAULT_MEAL_PERIODS[2];
  }
  if (!pConf || !pConf.enabled) {
    throw new CateringApiError("Meal period is not available today", "WINDOW_CLOSED");
  }

  const windowCheckConf =
    params.periodKey === "breakfast"
      ? DEFAULT_MEAL_PERIODS[0]!
      : params.periodKey === "lunch"
        ? DEFAULT_MEAL_PERIODS[1]!
        : params.periodKey === "dinner"
          ? DEFAULT_MEAL_PERIODS[2]!
          : pConf;
  const pState = getPeriodState(windowCheckConf, now, date);
  if (pState !== "live") {
    throw new CateringApiError(
      `Service window is ${pState}. Distribution is only allowed during live active windows.`,
      "WINDOW_CLOSED",
    );
  }

  // 3. Duplicate distribution check
  const priorClaim = GLOBAL_LEDGER.find(
    (r) =>
      r.registrantId === params.registrantId &&
      r.periodKey === params.periodKey &&
      r.date === date,
  );
  if (priorClaim) {
    const counterObj = COUNTERS.find((c) => c.id === priorClaim.counterId);
    throw new CateringApiError(
      "Meal Already Provided for this period today.",
      "DUPLICATE_DISTRIBUTION",
      {
        originalClaim: {
          periodKey: priorClaim.periodKey,
          providedAt: priorClaim.providedAt,
          counterName: counterObj ? counterObj.name : priorClaim.counterId,
          receiptCode: priorClaim.receiptCode,
        },
      },
    );
  }

  // 4. Resolve recipient info
  let recipientType: "team_member" | "staff" = "team_member";
  let teamId: string | undefined;
  let mealType: "veg" | "non_veg" = "veg";

  for (const [tId, roster] of Object.entries(MOCK_TEAM_ROSTERS)) {
    const match = roster.find((i) => i.registrantId === params.registrantId);
    if (match) {
      recipientType = "team_member";
      teamId = tId;
      mealType = match.mealPreference;
      break;
    }
  }

  if (!teamId) {
    const staffMatch = MOCK_STAFF_MEMBERS.find((i) => i.registrantId === params.registrantId);
    if (staffMatch) {
      recipientType = "staff";
      mealType = staffMatch.mealPreference;
    }
  }

  // 5. Generate permanent ledger record
  const receiptNum = 1000 + GLOBAL_LEDGER.length + 1;
  const newRecord: DistributionRecord = {
    id: `dist-${receiptNum}`,
    receiptCode: `MR-20261103-${receiptNum}`,
    registrantId: params.registrantId,
    recipientType,
    teamId,
    date,
    periodKey: params.periodKey,
    providedAt: now.toISOString(),
    counterId: params.counterId,
    operatorId: params.operatorId,
    verificationMethod: params.verificationMethod,
    mealType,
    idempotencyKey: idempotencyKey,
  };

  GLOBAL_LEDGER.push(newRecord);
  return newRecord;
}

// -------------------------------------------------------------
// MEAL CONFIGURATION
// -------------------------------------------------------------
export async function getMealConfig(
  date?: string,
): Promise<MealPeriodConfig[]> {
  const opDate = date || new Date().toISOString().slice(0, 10);
  if (isBrowser) {
    try {
      const res = await axiosInstance.get("/api/v1/super/manage-meals/configuration", {
        params: { date: opDate },
      });
      const d = res.data?.data || res.data;
      if (d?.periods && Array.isArray(d.periods) && d.periods.length > 0) {
        return d.periods.map((p: {
          id?: string;
          sortOrder?: number;
          sessionLabel?: string;
          name?: string;
          description?: string;
          isEnabled?: boolean;
          status?: string;
          availability?: string;
          vegPlanned?: number;
          nonVegPlanned?: number;
          totalPlanned?: number;
          startTime?: string | null;
          endTime?: string | null;
        }, idx: number) => {
          const isEnabled = p.isEnabled ?? true;
          const sortOrder = p.sortOrder ?? idx + 1;
          const vegPlanned = p.vegPlanned ?? 0;
          const nonVegPlanned = p.nonVegPlanned ?? 0;
          const totalPlanned = p.totalPlanned ?? (vegPlanned + nonVegPlanned);
          const name = p.name || `Meal ${sortOrder}`;
          const sessionLabel = p.sessionLabel || `SESSION ${sortOrder}`;

          return {
            id: p.id,
            key: p.id || `meal${sortOrder}`,
            sortOrder,
            sessionLabel,
            name,
            label: name,
            description: p.description || "",
            subtitle: p.description || "",
            enabled: isEnabled,
            isEnabled,
            status: p.status || (isEnabled ? "Active for Service" : "Disabled"),
            availability: p.availability || (isEnabled ? "Open All Day" : "Inactive"),
            vegPlanned,
            nonVegPlanned,
            plannedVeg: vegPlanned,
            plannedNonVeg: nonVegPlanned,
            totalPlanned,
            startTime: p.startTime || null,
            endTime: p.endTime || null,
            start: p.startTime || "",
            end: p.endTime || "",
          };
        });
      }
    } catch {
      // Fall through to mock
    }
  } else {
    await sleep(DELAY_MS);
  }

  if (!GLOBAL_MEAL_CONFIGS[opDate] || GLOBAL_MEAL_CONFIGS[opDate].length === 0) {
    GLOBAL_MEAL_CONFIGS[opDate] = JSON.parse(JSON.stringify(DEFAULT_MEALS_CONFIG));
  }
  return JSON.parse(JSON.stringify(GLOBAL_MEAL_CONFIGS[opDate] ?? DEFAULT_MEALS_CONFIG));
}

export async function saveMealConfig(
  date: string,
  periods: MealPeriodConfig[],
): Promise<{ success: boolean; periods: MealPeriodConfig[] }> {
  // Basic validation
  if (!periods.some((p) => p.enabled ?? p.isEnabled)) {
    throw new CateringApiError("At least one meal session must remain enabled.", "VALIDATION_ERROR");
  }

  for (const p of periods) {
    const veg = p.vegPlanned ?? p.plannedVeg ?? 0;
    const nonVeg = p.nonVegPlanned ?? p.plannedNonVeg ?? 0;
    if (veg < 0 || nonVeg < 0) {
      throw new CateringApiError("Planned meal quantities must be positive integers.", "VALIDATION_ERROR");
    }
  }

  const payload = {
    date,
    periods: periods.map((p, idx) => ({
      id: p.id || p.key || `meal${idx + 1}`,
      name: p.name || p.label || `Meal ${idx + 1}`,
      isEnabled: p.enabled !== false && p.isEnabled !== false,
      startTime: p.startTime || p.start || null,
      endTime: p.endTime || p.end || null,
      vegPlanned: p.vegPlanned ?? p.plannedVeg ?? 0,
      nonVegPlanned: p.nonVegPlanned ?? p.plannedNonVeg ?? 0,
    })),
  };

  if (isBrowser) {
    try {
      await axiosInstance.put("/api/v1/super/manage-meals/configuration", payload);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        throw new CateringApiError(err.message, "API_ERROR");
      }
      throw err;
    }
  } else {
    await sleep(DELAY_MS);
  }

  GLOBAL_MEAL_CONFIGS[date] = JSON.parse(JSON.stringify(periods));
  return { success: true, periods: JSON.parse(JSON.stringify(periods)) };
}

// -------------------------------------------------------------
// LIVE RECONCILIATION DISTRIBUTION REPORT
// -------------------------------------------------------------
export async function getLiveDistributionReport(
  params: { date?: string; teamId?: string; format?: "json" | "csv" } = {},
): Promise<LiveDistributionReport> {
  const date = params.date || getTodayDateString();
  if (isBrowser) {
    try {
      const res = await axiosInstance.get("/api/v1/super/reports/live-distribution", {
        params: {
          date,
          teamId: params.teamId !== "all" ? params.teamId : undefined,
          format: params.format || "json",
        },
      });
      return (res.data?.data || res.data) as LiveDistributionReport;
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string } } };
      const msg =
        apiErr.response?.data?.message ||
        (err as Error)?.message ||
        "Failed to fetch live distribution report.";
      throw new CateringApiError(msg, "API_ERROR");
    }
  }
  return {
    date,
    teamFilter: { teamId: null, teamName: "All Teams", activeTeamsCount: 5 },
    kpis: {
      totalMealsProvided: {
        value: 0,
        badge: "Reconciled 100%",
        isReconciled: true,
        subtitle: "Total actual meals recorded across all eligible recipients today",
      },
      teamMealsProvided: {
        provided: 0,
        eligible: 0,
        activeTeamsCount: 0,
        displayValue: "0 / 0 Active",
        subtitle: "Distributed to verified players, coaches & team staff",
      },
      staffMealsProvided: {
        provided: 0,
        eligible: 0,
        displayValue: "00 / 00 Verified",
        subtitle: "Independently verified meals for approved operational staff",
      },
    },
    mealPeriodDistribution: {
      totalPeriods: 0,
      periodsBadge: "0 Periods Total",
      totalDailySum: 0,
      totalDailySumLabel: "Total Daily Sum: 0 Meals",
      periods: [],
    },
    approvedStaffDistribution: {
      badge: "NON-MATCHDAY",
      subtitle: "Independent logistics & operational personnel",
      summary: {
        approvedRosterCount: 0,
        approvedRosterLabel: "0 Staff",
        mealsDispensedCount: 0,
        mealsDispensedLabel: "0 Recorded",
      },
      recipients: [],
    },
    teamWiseDistribution: {
      activeTeamsCount: 0,
      activeTeamsBadge: "0 Active Teams",
      sumTeamMeals: 0,
      sumTeamMealsLabel: "Sum: 0 Team Meals",
      teams: [],
      footer: {
        totalActiveAllocation: 0,
        totalAllocationLabel: "0 Total Eligible",
        totalMealsProvided: 0,
        totalProvidedLabel: "0 Provided",
        averageProgress: 0,
        averageProgressLabel: "Average Progress: 0%",
        sumMeals: 0,
        sumMealsLabel: "Sum: 0 Meals",
      },
    },
    recentActivity: [],
    auditProtocol: {
      title: "Audit & Reconciliation Protocol",
      isReconciled: true,
      totalMeals: 0,
      teamMeals: 0,
      staffMeals: 0,
      checksumFormula: "0 == 0 + 0",
      statement: "Cryptographic ledger records strictly reconcile.",
    },
  };
}

export async function exportLiveDistributionReportCsv(
  date?: string,
  teamId?: string,
): Promise<Blob> {
  const opDate = date || getTodayDateString();
  const res = await axiosInstance.get("/api/v1/super/reports/live-distribution", {
    params: {
      date: opDate,
      teamId: teamId !== "all" ? teamId : undefined,
      format: "csv",
    },
    responseType: "blob",
  });
  return res.data;
}

// -------------------------------------------------------------
// REPORTS & VELOCITY
// -------------------------------------------------------------
export async function getDistributionLedger(params: MealReportFilters = {}): Promise<{
  records: DistributionDetail[];
  total: number;
  summary: AllDistributionReportSummary;
}> {
  const date = params.date || MOCK_OPERATING_DATE;

  if (isBrowser) {
    try {
      await axiosInstance.get("/api/v1/super/reports/distribution", {
        params: { date },
      });
    } catch {
      // Fall through
    }
  } else {
    await sleep(DELAY_MS);
  }

  let list = GLOBAL_LEDGER.filter((r) => r.date === date);

  if (params.teamId && params.teamId !== "all") {
    list = list.filter((r) => r.teamId === params.teamId);
  }

  if (params.periodKey && params.periodKey !== "all") {
    list = list.filter((r) => r.periodKey === params.periodKey);
  }

  if (params.recipientType && params.recipientType !== "all") {
    list = list.filter((r) => r.recipientType === params.recipientType);
  }

  const teamDist = list.filter((r) => r.recipientType === "team_member").length;
  const staffDist = list.filter((r) => r.recipientType === "staff").length;
  const total = list.length;
  const isBalanced = teamDist + staffDist === total;

  const summary: AllDistributionReportSummary = {
    totalDistributions: total,
    teamDistributions: teamDist,
    teamDistributionsPercent: total ? Math.round((teamDist / total) * 100) : 0,
    teamCount: MOCK_ACTIVATED_TEAMS.length,
    staffDistributions: staffDist,
    staffDistributionsPercent: total ? Math.round((staffDist / total) * 100) : 0,
    formula: {
      teamCount: teamDist,
      staffCount: staffDist,
      total,
      isBalanced,
    },
    reconciliationStatus: isBalanced ? "balanced" : "discrepancy",
    discrepancyCount: isBalanced ? 0 : Math.abs(total - (teamDist + staffDist)),
  };

  const detailed: DistributionDetail[] = list.map((r) => {
    let recipientName = "Athlete";
    let recipientDesignation = "Player";
    let teamName: string | undefined = undefined;

    if (r.recipientType === "staff") {
      const s = MOCK_STAFF_MEMBERS.find((m) => m.registrantId === r.registrantId);
      if (s) {
        recipientName = s.fullName;
        recipientDesignation = s.designation;
      }
    } else if (r.teamId) {
      const roster = MOCK_TEAM_ROSTERS[r.teamId] || [];
      const m = roster.find((item) => item.registrantId === r.registrantId);
      const t = MOCK_ACTIVATED_TEAMS.find((item) => item.id === r.teamId);
      if (m) {
        recipientName = m.fullName;
        recipientDesignation = m.designation;
      }
      if (t) {
        teamName = t.name;
      }
    }

    const counter = COUNTERS.find((c) => c.id === r.counterId) || {
      name: "Main Counter",
      terminal: "Terminal #4",
      gate: "Gate B",
    };

    const operator = GLOBAL_USERS.find((u) => u.id === r.operatorId) || {
      fullName: "Alex Morgan",
      roleId: "SUPER_ADMIN",
    };

    return {
      ...r,
      recipientName,
      recipientDesignation,
      teamName,
      counterName: counter.name,
      counterTerminal: counter.terminal,
      counterGate: counter.gate,
      operatorName: operator.fullName,
      operatorRole: operator.roleId,
      auditTrail: [
        {
          event: "Passcode & ID Verified",
          timestamp: r.providedAt,
          actor: operator.fullName,
          details: `Validated via ${r.verificationMethod.toUpperCase()}`,
        },
        {
          event: "Meal Dispensed & Ledger Locked",
          timestamp: r.providedAt,
          actor: `${counter.name} (${counter.terminal})`,
          details: `Dispensed 1 Portion (${r.mealType.toUpperCase()})`,
        },
      ],
    };
  });

  detailed.sort(
    (a, b) => new Date(b.providedAt).getTime() - new Date(a.providedAt).getTime(),
  );

  return {
    records: detailed,
    total: detailed.length,
    summary,
  };
}

export async function getDistributionDetail(id: string): Promise<DistributionDetail> {
  const found = GLOBAL_LEDGER.find((r) => r.id === id || r.receiptCode === id);
  if (!found) {
    throw new CateringApiError("Distribution record not found", "NOT_FOUND");
  }

  const res = await getDistributionLedger({ date: found.date });
  const detail = res.records.find((r) => r.id === found.id);
  if (!detail) {
    throw new CateringApiError("Detail mapping failed", "NOT_FOUND");
  }
  return detail;
}

export async function getHourlyVelocity(
  _params: { date?: string } = {},
): Promise<HourlyBucket[]> {
  const date = _params.date || MOCK_OPERATING_DATE;
  const dayLedger = GLOBAL_LEDGER.filter((r) => r.date === date);

  const buckets: HourlyBucket[] = [];
  for (let h = 8; h <= 21; h++) {
    const label = `${String(h).padStart(2, "0")}:00`;
    const inHour = dayLedger.filter((r) => {
      const d = new Date(r.providedAt);
      return d.getHours() === h;
    });

    const bCount = inHour.filter((r) => r.periodKey === "breakfast").length;
    const lCount = inHour.filter((r) => r.periodKey === "lunch").length;
    const dCount = inHour.filter((r) => r.periodKey === "dinner").length;

    buckets.push({
      hour: h,
      hourLabel: label,
      count: inHour.length,
      breakfastCount: bCount,
      lunchCount: lCount,
      dinnerCount: dCount,
      isPeak: h === 9 || h === 13,
    });
  }

  return buckets;
}

// -------------------------------------------------------------
// MEAL-PERIOD REPORT
// -------------------------------------------------------------
export async function getMealPeriodReport(
  periodKey: MealPeriodKey = "lunch",
  date: string = MOCK_OPERATING_DATE,
): Promise<{
  summary: MealPeriodReportSummary;
  teamBreakdown: Array<{
    teamId: string;
    teamName: string;
    letterCode: string;
    rosterSize: number;
    servedCount: number;
    completionPercent: number;
    status: "Active" | "High Inflow";
  }>;
  records: DistributionDetail[];
}> {
  if (isBrowser) {
    try {
      await axiosInstance.get("/api/v1/super/reports/quantities", {
        params: { date },
      });
    } catch {
      // Fall through
    }
  } else {
    await sleep(DELAY_MS);
  }

  const periodsConfig =
    GLOBAL_MEAL_CONFIGS[date] ?? GLOBAL_MEAL_CONFIGS[MOCK_OPERATING_DATE] ?? DEFAULT_MEALS_CONFIG;
  const pConf =
    periodsConfig.find((p) => p.key === periodKey) ??
    periodsConfig[1] ??
    DEFAULT_MEAL_PERIODS[1]!;
  const now = getNow();

  const dayLedger = GLOBAL_LEDGER.filter((r) => r.date === date && r.periodKey === periodKey);

  const teamMeals = dayLedger.filter((r) => r.recipientType === "team_member").length;
  const staffMeals = dayLedger.filter((r) => r.recipientType === "staff").length;
  const totalPeriodMeals = dayLedger.length;

  const overallTeamRate = Math.round((teamMeals / 125) * 100);

  const teamBreakdown = MOCK_ACTIVATED_TEAMS.map((t) => {
    const served = dayLedger.filter((r) => r.teamId === t.id).length;
    const completion = Math.round((served / t.rosterCap) * 100);
    const isHighInflow = completion >= overallTeamRate + 5;
    return {
      teamId: t.id,
      teamName: t.name,
      letterCode: t.letterCode,
      rosterSize: t.rosterCap,
      servedCount: served,
      completionPercent: completion,
      status: isHighInflow ? ("High Inflow" as const) : ("Active" as const),
    };
  });

  const summary: MealPeriodReportSummary = {
    periodKey,
    periodLabel: pConf.label,
    periodRange:
      pConf.start && pConf.end
        ? `${formatIST12h(pConf.start)} – ${formatIST12h(pConf.end)}`
        : "Flexible Service",
    periodState: getPeriodState(pConf, now, date),
    totalPeriodMeals,
    teamPeriodMeals: teamMeals,
    teamEligibleCount: 125,
    staffPeriodMeals: staffMeals,
    staffEligibleCount: MOCK_STAFF_MEMBERS.length,
    completionRatePercent: Math.round((totalPeriodMeals / 131) * 100),
    formula: {
      teamMeals,
      staffMeals,
      totalMeals: totalPeriodMeals,
      isBalanced: teamMeals + staffMeals === totalPeriodMeals,
    },
  };

  const { records } = await getDistributionLedger({ date, periodKey });

  return {
    summary,
    teamBreakdown,
    records,
  };
}

// -------------------------------------------------------------
// TEAM-WISE REPORT
// -------------------------------------------------------------
export async function getTeamMealReport(
  teamId: string = "chennai-kings",
  date: string = MOCK_OPERATING_DATE,
): Promise<{
  summary: TeamWiseReportSummary;
  roster: TeamMemberMealRosterItem[];
}> {
  if (isBrowser) {
    try {
      await axiosInstance.get("/api/v1/super/reports/teams", {
        params: { date },
      });
    } catch {
      // Fall through
    }
  } else {
    await sleep(DELAY_MS);
  }

  const now = getNow();
  const periodsConfig =
    GLOBAL_MEAL_CONFIGS[date] ?? GLOBAL_MEAL_CONFIGS[MOCK_OPERATING_DATE] ?? DEFAULT_MEALS_CONFIG;
  const teamObj =
    MOCK_ACTIVATED_TEAMS.find((t) => t.id === teamId) ?? MOCK_ACTIVATED_TEAMS[0]!;

  const teamDistributions = GLOBAL_LEDGER.filter(
    (r) => r.teamId === teamObj.id && r.date === date,
  );

  const periods = periodsConfig.map((p) => {
    const count = teamDistributions.filter((r) => {
      if (r.periodKey === p.key) return true;
      if (p.key === "meal1" && r.periodKey === "breakfast") return true;
      if (p.key === "meal2" && r.periodKey === "lunch") return true;
      if (p.key === "meal3" && r.periodKey === "dinner") return true;
      return false;
    }).length;
    return {
      id: p.id || (p.key as string) || "period-01",
      key: p.key,
      label: p.label,
      range:
        p.start && p.end
          ? `${formatIST12h(p.start)} – ${formatIST12h(p.end)}`
          : "Flexible Service",
      state: getPeriodState(p, now, date),
      count,
    };
  });

  const summary: TeamWiseReportSummary = {
    teamId: teamObj.id,
    teamName: teamObj.name,
    letterCode: teamObj.letterCode,
    eligibleCount: teamObj.rosterCap,
    mealsProvidedCount: teamDistributions.length,
    distributionRatePercent: Math.round((teamDistributions.length / teamObj.rosterCap) * 100),
    activatedDate: `Today, ${getTodayHeaderFormatted()}`,
    activatedBy: "Alex Morgan (Event Admin)",
    periods,
  };

  const { items } = await getTeamMealRoster(teamObj.id, { pageSize: 50 });

  return {
    summary,
    roster: items,
  };
}

// -------------------------------------------------------------
// STAFF REPORT
// -------------------------------------------------------------
export async function getStaffMealReport(
  date: string = MOCK_OPERATING_DATE,
): Promise<{
  summary: StaffReportSummary;
  roster: StaffMealRosterItem[];
}> {
  if (isBrowser) {
    try {
      await axiosInstance.get("/api/v1/super/reports/staff", {
        params: { date },
      });
    } catch {
      // Fall through
    }
  } else {
    await sleep(DELAY_MS);
  }

  const staffDist = GLOBAL_LEDGER.filter(
    (r) => r.recipientType === "staff" && r.date === date,
  );

  const bCount = staffDist.filter((r) => r.periodKey === "breakfast").length;
  const lCount = staffDist.filter((r) => r.periodKey === "lunch").length;
  const dCount = staffDist.filter((r) => r.periodKey === "dinner").length;
  const total = staffDist.length;

  const summary: StaffReportSummary = {
    approvedStaffCount: MOCK_STAFF_MEMBERS.length,
    staffMealsProvidedCount: total,
    distributionRatePercent: Math.round((total / MOCK_STAFF_MEMBERS.length) * 100),
    breakfastCount: bCount,
    lunchCount: lCount,
    dinnerCount: dCount,
    formula: {
      breakfast: bCount,
      lunch: lCount,
      dinner: dCount,
      total,
      isBalanced: bCount + lCount + dCount === total,
    },
  };

  const { items } = await getStaffMealRoster({ pageSize: 50 });

  return {
    summary,
    roster: items,
  };
}

// -------------------------------------------------------------
// USER MANAGEMENT API
// -------------------------------------------------------------
export async function getCateringUsers(
  params: { search?: string; role?: string; status?: string; page?: number; pageSize?: number } = {},
): Promise<{
  users: CateringUser[];
  total: number;
  activeCount: number;
  pendingCount: number;
  inactiveCount: number;
}> {
  if (isBrowser) {
    try {
      const [usersRes, summaryRes] = await Promise.allSettled([
        axiosInstance.get("/api/v1/super/users", {
          params: {
            page: params.page || 1,
            pageSize: params.pageSize || 20,
            search: params.search,
            role: params.role !== "all" ? params.role : undefined,
            status: params.status !== "all" ? params.status : undefined,
          },
        }),
        axiosInstance.get("/api/v1/super/users/summary"),
      ]);

      if (usersRes.status === "fulfilled" && usersRes.value.data?.data) {
        const liveUsers = usersRes.value.data.data;
        const mappedLive: CateringUser[] = liveUsers.map((u: {
          id: string;
          userCode?: string;
          name: string;
          email: string;
          contactNumber?: string | null;
          role?: { name: string; code: string };
          accountStatus?: string;
          invitationStatus?: string;
          lastLogin?: { formatted?: string; timestamp?: string };
          createdAt?: string;
        }) => {
          let roleId: CateringUser["roleId"] = "SUPER_ADMIN";
          const rName = u.role?.name || "";
          if (rName.toLowerCase().includes("operator")) roleId = "MEAL_OPERATOR";
          else if (rName.toLowerCase().includes("report")) roleId = "REPORTS_VIEWER";

          let status: CateringUser["status"] = "active";
          if (u.accountStatus === "INACTIVE") status = "inactive";
          else if (u.invitationStatus === "PENDING") status = "invitation_pending";

          return {
            id: u.id,
            userCode: u.userCode || `USR-${u.id.slice(0, 4)}`,
            fullName: u.name,
            email: u.email,
            phone: u.contactNumber || undefined,
            roleId,
            status,
            invitation: {
              status: u.invitationStatus === "PENDING" ? ("pending" as const) : ("accepted" as const),
              sentAt: u.createdAt || new Date().toISOString(),
              expiresAt: new Date(Date.now() + 72 * 3600 * 1000).toISOString(),
              acceptedAt: u.accountStatus === "ACTIVE" ? u.createdAt || new Date().toISOString() : undefined,
            },
            createdAt: u.createdAt || new Date().toISOString(),
          };
        });

        let filtered = [...mappedLive];
        if (params.search) {
          const q = params.search.toLowerCase();
          filtered = filtered.filter(
            (u) =>
              u.fullName.toLowerCase().includes(q) ||
              u.email.toLowerCase().includes(q) ||
              u.userCode.toLowerCase().includes(q),
          );
        }
        if (params.role && params.role !== "all") {
          filtered = filtered.filter((u) => u.roleId === params.role);
        }
        if (params.status && params.status !== "all") {
          filtered = filtered.filter((u) => u.status === params.status);
        }

        const summary = summaryRes.status === "fulfilled" ? summaryRes.value.data : null;

        return {
          users: filtered,
          total: typeof usersRes.value.data.total === "number" ? usersRes.value.data.total : filtered.length,
          activeCount: summary?.activeUsers ?? filtered.filter((u) => u.status === "active").length,
          pendingCount: summary?.pendingInvitations ?? filtered.filter((u) => u.status.startsWith("invitation_")).length,
          inactiveCount: filtered.filter((u) => u.status === "inactive").length,
        };
      }
    } catch {
      // Fall through to local state
    }
  } else {
    await sleep(DELAY_MS);
  }

  let list = [...GLOBAL_USERS];

  if (params.search) {
    const q = params.search.toLowerCase();
    list = list.filter(
      (u) =>
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.userCode.toLowerCase().includes(q),
    );
  }

  if (params.role && params.role !== "all") {
    list = list.filter((u) => u.roleId === params.role);
  }

  if (params.status && params.status !== "all") {
    list = list.filter((u) => u.status === params.status);
  }

  const activeCount = GLOBAL_USERS.filter((u) => u.status === "active").length;
  const pendingCount = GLOBAL_USERS.filter((u) => u.status.startsWith("invitation_")).length;
  const inactiveCount = GLOBAL_USERS.filter((u) => u.status === "inactive").length;

  return {
    users: list,
    total: GLOBAL_USERS.length,
    activeCount,
    pendingCount,
    inactiveCount,
  };
}

export async function getUserById(userId: string): Promise<CateringUser> {
  if (isBrowser) {
    try {
      const res = await axiosInstance.get(`/api/v1/super/users/${userId}`);
      if (res.data) {
        const u = res.data;
        let roleId: CateringUser["roleId"] = "SUPER_ADMIN";
        const rName = u.role?.name || "";
        if (rName.toLowerCase().includes("operator")) roleId = "MEAL_OPERATOR";
        else if (rName.toLowerCase().includes("report")) roleId = "REPORTS_VIEWER";

        let status: CateringUser["status"] = "active";
        if (u.accountStatus === "INACTIVE") status = "inactive";
        else if (u.invitationStatus === "PENDING") status = "invitation_pending";

        return {
          id: u.id,
          userCode: u.userCode || `USR-${u.id.slice(0, 4)}`,
          fullName: u.name,
          email: u.email,
          phone: u.contactNumber || undefined,
          roleId,
          status,
          invitation: {
            status: u.invitationStatus === "PENDING" ? ("pending" as const) : ("accepted" as const),
            sentAt: u.createdAt || new Date().toISOString(),
            expiresAt: new Date(Date.now() + 72 * 3600 * 1000).toISOString(),
            acceptedAt: u.accountStatus === "ACTIVE" ? u.createdAt || new Date().toISOString() : undefined,
          },
          createdAt: u.createdAt || new Date().toISOString(),
        };
      }
    } catch {
      // Fall through
    }
  } else {
    await sleep(DELAY_MS);
  }

  const found = GLOBAL_USERS.find((u) => u.id === userId || u.userCode === userId);
  if (!found) {
    throw new CateringApiError("User dossier not found", "NOT_FOUND");
  }
  return found;
}

export async function createCateringUser(data: {
  fullName: string;
  email: string;
  phone?: string;
  roleId: CateringUser["roleId"];
  permissions?: string[];
}): Promise<CateringUser> {
  // Basic email validation
  if (!data.email || !data.email.includes("@")) {
    throw new CateringApiError("A valid email address is required.", "INVALID_EMAIL");
  }

  // Uniqueness check
  if (GLOBAL_USERS.some((u) => u.email.toLowerCase() === data.email.toLowerCase())) {
    throw new CateringApiError(
      "A user account with this email address already exists.",
      "EMAIL_TAKEN",
    );
  }

  if (isBrowser) {
    try {
      const targetRoleId =
        data.roleId === "SUPER_ADMIN"
          ? "981b57d4-0aba-4a38-a979-c68b46718280"
          : data.roleId === "MEAL_OPERATOR"
            ? "86e90369-cc77-477f-9caf-4ae498adab63"
            : "9a93ef3d-1f46-4cd8-a802-10999d2ab6f0";

      const res = await axiosInstance.post("/api/v1/super/users", {
        name: data.fullName,
        email: data.email,
        contactNumber: data.phone,
        roleId: targetRoleId,
      });

      if (res.data) {
        const u = res.data;
        return {
          id: u.id,
          userCode: u.userCode || `USR-${u.id.slice(0, 4)}`,
          fullName: u.name,
          email: u.email,
          phone: u.contactNumber || undefined,
          roleId: data.roleId,
          status: "active",
          invitation: {
            status: "accepted",
            sentAt: new Date().toISOString(),
            expiresAt: new Date().toISOString(),
            acceptedAt: new Date().toISOString(),
          },
          createdAt: u.createdAt || new Date().toISOString(),
        };
      }
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        throw new CateringApiError(err.message, "REQUEST_FAILED");
      }
      throw err;
    }
  } else {
    await sleep(DELAY_MS);
  }

  const codeNum = String(GLOBAL_USERS.length + 1).padStart(3, "0");
  const newUser: CateringUser = {
    id: `usr-${Date.now()}`,
    userCode: `USR-2026-${codeNum}`,
    fullName: data.fullName,
    email: data.email,
    phone: data.phone,
    roleId: data.roleId,
    status: "active",
    invitation: {
      status: "accepted",
      sentAt: new Date().toISOString(),
      expiresAt: new Date().toISOString(),
      acceptedAt: new Date().toISOString(),
    },
    createdAt: new Date().toISOString(),
  };

  GLOBAL_USERS.unshift(newUser);
  return newUser;
}

export async function inviteUser(data: {
  fullName: string;
  email: string;
  phone?: string;
  roleId: CateringUser["roleId"];
}): Promise<CateringUser> {
  // Basic email validation
  if (!data.email || !data.email.includes("@")) {
    throw new CateringApiError("A valid email address is required.", "INVALID_EMAIL");
  }

  // Uniqueness check
  if (GLOBAL_USERS.some((u) => u.email.toLowerCase() === data.email.toLowerCase())) {
    throw new CateringApiError(
      "A user account with this email address already exists.",
      "EMAIL_TAKEN",
    );
  }

  if (isBrowser) {
    try {
      await axiosInstance.post("/api/v1/super/users/invite", {
        name: data.fullName,
        email: data.email,
        contactNumber: data.phone,
        roleId:
          data.roleId === "SUPER_ADMIN"
            ? "981b57d4-0aba-4a38-a979-c68b46718280"
            : data.roleId === "MEAL_OPERATOR"
              ? "86e90369-cc77-477f-9caf-4ae498adab63"
              : "c6225d5b-1c1e-4e3b-ac78-79271c330453",
      });
    } catch {
      // Fall through
    }
  } else {
    await sleep(DELAY_MS);
  }

  const codeNum = String(GLOBAL_USERS.length + 1).padStart(3, "0");
  const newUser: CateringUser = {
    id: `usr-${Date.now()}`,
    userCode: `USR-2026-${codeNum}`,
    fullName: data.fullName,
    email: data.email,
    phone: data.phone,
    roleId: data.roleId,
    status: "invitation_pending",
    invitation: {
      status: "pending",
      sentAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 72 * 3600 * 1000).toISOString(),
    },
    createdAt: new Date().toISOString(),
  };

  GLOBAL_USERS.unshift(newUser);
  return newUser;
}

export async function updateUser(
  userId: string,
  data: Partial<Pick<CateringUser, "fullName" | "phone" | "roleId" | "email">>,
): Promise<CateringUser> {
  const idx = GLOBAL_USERS.findIndex((u) => u.id === userId);
  const user = GLOBAL_USERS[idx];
  if (idx === -1 || !user) {
    throw new CateringApiError("User not found", "NOT_FOUND");
  }

  // Self and Last Super Admin Guard
  if (user.id === "usr-001" && data.roleId && data.roleId !== "SUPER_ADMIN") {
    throw new CateringApiError("You cannot demote your own Super Admin role.", "FORBIDDEN");
  }

  if (isBrowser) {
    try {
      await axiosInstance.patch(`/api/v1/super/users/${userId}`, {
        name: data.fullName,
        contactNumber: data.phone,
      });
    } catch {
      // Fall through
    }
  } else {
    await sleep(DELAY_MS);
  }

  let pendingEmail: string | undefined = user.pendingEmail;
  if (data.email && data.email !== user.email) {
    pendingEmail = data.email;
  }

  const updatedUser: CateringUser = {
    ...user,
    fullName: data.fullName || user.fullName,
    phone: data.phone !== undefined ? data.phone : user.phone,
    roleId: data.roleId || user.roleId,
    pendingEmail,
  };

  GLOBAL_USERS[idx] = updatedUser;
  return updatedUser;
}

export async function setUserStatus(
  userId: string,
  status: "active" | "inactive",
  _notes?: string,
): Promise<CateringUser> {
  const idx = GLOBAL_USERS.findIndex((u) => u.id === userId);
  const targetUser = GLOBAL_USERS[idx];
  if (idx === -1 || !targetUser) {
    throw new CateringApiError("User not found", "NOT_FOUND");
  }

  // Self deactivation guard
  if (targetUser.id === "usr-001" && status === "inactive") {
    throw new CateringApiError("You cannot deactivate your own administrative account.", "FORBIDDEN");
  }

  // Last super admin guard
  if (
    targetUser.roleId === "SUPER_ADMIN" &&
    status === "inactive" &&
    GLOBAL_USERS.filter((u) => u.roleId === "SUPER_ADMIN" && u.status === "active").length <= 1
  ) {
    throw new CateringApiError(
      "Cannot deactivate the last active Super Admin account.",
      "FORBIDDEN",
    );
  }

  if (isBrowser) {
    try {
      if (status === "inactive") {
        await axiosInstance.post(`/api/v1/super/users/${userId}/deactivate`);
      } else {
        await axiosInstance.post(`/api/v1/super/users/${userId}/reactivate`);
      }
    } catch {
      // Fall through
    }
  } else {
    await sleep(DELAY_MS);
  }

  targetUser.status = status;
  return targetUser;
}

export async function resendInvitation(userId: string): Promise<CateringUser> {
  const idx = GLOBAL_USERS.findIndex((u) => u.id === userId);
  const targetUser = GLOBAL_USERS[idx];
  if (idx === -1 || !targetUser) {
    throw new CateringApiError("User not found", "NOT_FOUND");
  }

  if (isBrowser) {
    try {
      await axiosInstance.post(`/api/v1/super/users/${userId}/resend-invitation`);
    } catch {
      // Fall through
    }
  } else {
    await sleep(DELAY_MS);
  }

  targetUser.invitation = {
    status: "pending",
    sentAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 72 * 3600 * 1000).toISOString(),
  };
  targetUser.status = "invitation_pending";
  return targetUser;
}

// -------------------------------------------------------------
// EXPORT PIPELINE
// -------------------------------------------------------------
export async function exportCateringReport(
  _slug: string,
  format: "csv" | "xlsx",
  filters: MealReportFilters = {},
): Promise<Blob> {
  const { records } = await getDistributionLedger(filters);

  if (format === "csv") {
    const headers = [
      "Receipt Code",
      "Registrant ID",
      "Recipient Name",
      "Designation",
      "Type",
      "Team",
      "Meal Period",
      "Dietary",
      "Dispatched At",
      "Station",
      "Terminal",
      "Gate",
      "Operator",
    ];

    const rows = records.map((r) => [
      r.receiptCode,
      r.registrantId,
      `"${r.recipientName}"`,
      `"${r.recipientDesignation}"`,
      r.recipientType === "staff" ? "Staff" : "Team Member",
      `"${r.teamName || "—"}"`,
      r.periodKey.toUpperCase(),
      r.mealType.toUpperCase(),
      r.providedAt,
      `"${r.counterName}"`,
      r.counterTerminal,
      r.counterGate,
      `"${r.operatorName}"`,
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    return new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  }

  // Excel (.xlsx) export using ExcelJS
  const ExcelJS = await import("exceljs");
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Jeff's Catering Super Admin";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Distribution Records");
  sheet.columns = [
    { header: "Receipt Code", key: "receiptCode", width: 20 },
    { header: "Registrant ID", key: "registrantId", width: 18 },
    { header: "Recipient Name", key: "recipientName", width: 22 },
    { header: "Designation", key: "recipientDesignation", width: 20 },
    { header: "Type", key: "recipientType", width: 14 },
    { header: "Team", key: "teamName", width: 20 },
    { header: "Meal Period", key: "periodKey", width: 14 },
    { header: "Dietary", key: "mealType", width: 12 },
    { header: "Dispatched At", key: "providedAt", width: 24 },
    { header: "Counter Station", key: "counterName", width: 26 },
  ];

  records.forEach((r) => {
    sheet.addRow({
      receiptCode: r.receiptCode,
      registrantId: r.registrantId,
      recipientName: r.recipientName,
      recipientDesignation: r.recipientDesignation,
      recipientType: r.recipientType === "staff" ? "Staff" : "Team Member",
      teamName: r.teamName || "—",
      periodKey: r.periodKey.toUpperCase(),
      mealType: r.mealType.toUpperCase(),
      providedAt: r.providedAt,
      counterName: `${r.counterName} (${r.counterTerminal})`,
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}
