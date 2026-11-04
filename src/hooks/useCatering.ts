import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useMemo } from "react";
import {
  getCateringDashboard,
  getMealsOverview,
  getTeamMealRoster,
  getStaffMealRoster,
  searchMealRegistrants,
  getRegistrantMealStatus,
  provideMeal,
  getMealConfig,
  saveMealConfig,
  getLiveDistributionReport,
  getDistributionLedger,
  getDistributionDetail,
  getHourlyVelocity,
  getMealPeriodReport,
  getTeamMealReport,
  getStaffMealReport,
  getCateringUsers,
  getUserById,
  createCateringUser,
  inviteUser,
  updateUser,
  setUserStatus,
  resendInvitation,
} from "@/api/catering.api";
import type {
  MealReportFilters,
  MealPeriodKey,
  VerificationMethod,
  MealPeriodConfig,
  CateringUser,
} from "@/types/catering.types";
import { OPERATING_DATE_DEFAULT } from "@/constants/catering";

export const CATERING_QUERY_KEYS = {
  dashboard: (date: string) => ["catering", "dashboard", date],
  mealsOverview: (date: string) => ["catering", "meals-overview", date],
  teamRoster: (teamId: string, params: object) => ["catering", "roster", "team", teamId, params],
  staffRoster: (params: object) => ["catering", "roster", "staff", params],
  search: (q: string, date: string) => ["catering", "search", q, date],
  registrantStatus: (id: string, date: string) => ["catering", "registrant-status", id, date],
  mealConfig: (date: string) => ["catering", "meal-config", date],
  ledger: (params: object) => ["catering", "ledger", params],
  detail: (id: string) => ["catering", "distribution-detail", id],
  velocity: (params: object) => ["catering", "velocity", params],
  mealPeriodReport: (periodKey: string, date: string) => ["catering", "report", "meal-period", periodKey, date],
  teamReport: (teamId: string, date: string) => ["catering", "report", "team", teamId, date],
  staffReport: (date: string) => ["catering", "report", "staff", date],
  users: (params: object) => ["catering", "users", params],
  userDossier: (id: string) => ["catering", "user-dossier", id],
};

// ----------------------------------------------------------------------
// QUERIES
// ----------------------------------------------------------------------
export function useCateringDashboard(date: string = OPERATING_DATE_DEFAULT) {
  return useQuery({
    queryKey: CATERING_QUERY_KEYS.dashboard(date),
    queryFn: () => getCateringDashboard(date),
    refetchInterval: 30000,
  });
}

export function useMealsOverview(date?: string) {
  return useQuery({
    queryKey: CATERING_QUERY_KEYS.mealsOverview(date || "today"),
    queryFn: () => getMealsOverview(date),
    staleTime: 0,
    refetchOnMount: "always",
    refetchInterval: 30000,
  });
}

export function useTeamMealRoster(
  teamId: string,
  params: { search?: string; periodKey?: MealPeriodKey | "all"; status?: string; page?: number; pageSize?: number } = {},
) {
  return useQuery({
    queryKey: CATERING_QUERY_KEYS.teamRoster(teamId, params),
    queryFn: () => getTeamMealRoster(teamId, params),
    placeholderData: (prev) => prev,
    refetchInterval: 30000,
  });
}

export function useStaffMealRoster(
  params: { search?: string; periodKey?: MealPeriodKey | "all"; status?: string; page?: number; pageSize?: number } = {},
) {
  return useQuery({
    queryKey: CATERING_QUERY_KEYS.staffRoster(params),
    queryFn: () => getStaffMealRoster(params),
    placeholderData: (prev) => prev,
    refetchInterval: 30000,
  });
}

export function useMealSearch(query: string, date: string = OPERATING_DATE_DEFAULT) {
  return useQuery({
    queryKey: CATERING_QUERY_KEYS.search(query, date),
    queryFn: () => searchMealRegistrants(query, date),
    enabled: query.trim().length >= 2,
  });
}

export function useRegistrantMealStatus(registrantId: string, date: string = OPERATING_DATE_DEFAULT) {
  return useQuery({
    queryKey: CATERING_QUERY_KEYS.registrantStatus(registrantId, date),
    queryFn: () => getRegistrantMealStatus(registrantId, date),
    enabled: !!registrantId,
  });
}

export function useMealConfig(date: string = OPERATING_DATE_DEFAULT) {
  return useQuery({
    queryKey: CATERING_QUERY_KEYS.mealConfig(date),
    queryFn: () => getMealConfig(date),
  });
}

export function useDistributionLedger(params: MealReportFilters = {}) {
  return useQuery({
    queryKey: CATERING_QUERY_KEYS.ledger(params),
    queryFn: () => getDistributionLedger(params),
    placeholderData: (prev) => prev,
    refetchInterval: 30000,
  });
}

export function useLiveDistributionReport(
  params: { date?: string; teamId?: string } = {},
) {
  const date = params.date || OPERATING_DATE_DEFAULT;
  const teamId = params.teamId || "all";
  return useQuery({
    queryKey: ["catering", "reports", "live-distribution", date, teamId],
    queryFn: () => getLiveDistributionReport({ date, teamId }),
    refetchInterval: 15000,
  });
}

export function useDistributionDetail(id: string) {
  return useQuery({
    queryKey: CATERING_QUERY_KEYS.detail(id),
    queryFn: () => getDistributionDetail(id),
    enabled: !!id,
  });
}

export function useHourlyVelocity(params: { date?: string } = {}) {
  return useQuery({
    queryKey: CATERING_QUERY_KEYS.velocity(params),
    queryFn: () => getHourlyVelocity(params),
    refetchInterval: 30000,
  });
}

export function useMealPeriodReport(periodKey: MealPeriodKey = "lunch", date: string = OPERATING_DATE_DEFAULT) {
  return useQuery({
    queryKey: CATERING_QUERY_KEYS.mealPeriodReport(periodKey, date),
    queryFn: () => getMealPeriodReport(periodKey, date),
    placeholderData: (prev) => prev,
    refetchInterval: 30000,
  });
}

export function useTeamMealReport(teamId: string = "chennai-kings", date: string = OPERATING_DATE_DEFAULT) {
  return useQuery({
    queryKey: CATERING_QUERY_KEYS.teamReport(teamId, date),
    queryFn: () => getTeamMealReport(teamId, date),
    placeholderData: (prev) => prev,
    refetchInterval: 30000,
  });
}

export function useStaffMealReport(date: string = OPERATING_DATE_DEFAULT) {
  return useQuery({
    queryKey: CATERING_QUERY_KEYS.staffReport(date),
    queryFn: () => getStaffMealReport(date),
    placeholderData: (prev) => prev,
    refetchInterval: 30000,
  });
}

export function useCateringUsers(params: { search?: string; role?: string; status?: string } = {}) {
  return useQuery({
    queryKey: CATERING_QUERY_KEYS.users(params),
    queryFn: () => getCateringUsers(params),
    placeholderData: (prev) => prev,
  });
}

export function useUserDossier(userId: string) {
  return useQuery({
    queryKey: CATERING_QUERY_KEYS.userDossier(userId),
    queryFn: () => getUserById(userId),
    enabled: !!userId,
  });
}

// ----------------------------------------------------------------------
// MUTATIONS
// ----------------------------------------------------------------------
export function useProvideMeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vars: {
      registrantId: string;
      periodKey: MealPeriodKey;
      counterId: string;
      operatorId: string;
      verificationMethod: VerificationMethod;
      idempotencyKey: string;
      date?: string;
    }) => provideMeal(vars),
    onSuccess: () => {
      // Invalidate all dependent operational queries
      queryClient.invalidateQueries({ queryKey: ["catering"] });
    },
  });
}

export function useSaveMealConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vars: { date: string; periods: MealPeriodConfig[] }) =>
      saveMealConfig(vars.date, vars.periods),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: CATERING_QUERY_KEYS.mealConfig(vars.date) });
      queryClient.invalidateQueries({ queryKey: ["catering", "dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["catering", "meals-overview"] });
      queryClient.invalidateQueries({ queryKey: ["catering", "report"] });
    },
  });
}

export function useUserMutations() {
  const queryClient = useQueryClient();

  const create = useMutation({
    mutationFn: (data: {
      fullName: string;
      email: string;
      phone?: string;
      roleId: CateringUser["roleId"];
      permissions?: string[];
    }) => createCateringUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["catering", "users"] });
      queryClient.invalidateQueries({ queryKey: ["super", "users"] });
    },
  });

  const invite = useMutation({
    mutationFn: (data: {
      fullName: string;
      email: string;
      phone?: string;
      roleId: CateringUser["roleId"];
    }) => inviteUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["catering", "users"] });
    },
  });

  const update = useMutation({
    mutationFn: (vars: {
      userId: string;
      data: Partial<Pick<CateringUser, "fullName" | "phone" | "roleId" | "email">>;
    }) => updateUser(vars.userId, vars.data),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["catering", "users"] });
      queryClient.invalidateQueries({ queryKey: CATERING_QUERY_KEYS.userDossier(vars.userId) });
    },
  });

  const setStatus = useMutation({
    mutationFn: (vars: { userId: string; status: "active" | "inactive"; notes?: string }) =>
      setUserStatus(vars.userId, vars.status, vars.notes),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["catering", "users"] });
      queryClient.invalidateQueries({ queryKey: CATERING_QUERY_KEYS.userDossier(vars.userId) });
    },
  });

  const resend = useMutation({
    mutationFn: (userId: string) => resendInvitation(userId),
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: ["catering", "users"] });
      queryClient.invalidateQueries({ queryKey: CATERING_QUERY_KEYS.userDossier(userId) });
    },
  });

  return { create, invite, update, setStatus, resend };
}

// ----------------------------------------------------------------------
// REAL-TIME SYNC STATUS HOOK
// ----------------------------------------------------------------------
export function useSyncStatus(lastUpdatedAt?: number) {
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const [secondsSinceLastUpdate, setSecondsSinceLastUpdate] = useState(0);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (lastUpdatedAt) {
        setSecondsSinceLastUpdate(Math.floor((Date.now() - lastUpdatedAt) / 1000));
      } else {
        setSecondsSinceLastUpdate(0);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lastUpdatedAt]);

  const state = useMemo(() => {
    if (!isOnline) {
      return { status: "offline" as const, label: "Offline", color: "red" as const };
    }
    if (secondsSinceLastUpdate > 60) {
      return { status: "reconnecting" as const, label: "Reconnecting…", color: "amber" as const };
    }
    return { status: "live" as const, label: "Live • Updated 01:22 PM", color: "green" as const };
  }, [isOnline, secondsSinceLastUpdate]);

  return state;
}

// ----------------------------------------------------------------------
// IDLE TIMEOUT HOOK
// ----------------------------------------------------------------------
export function useIdleTimeout(
  timeoutHours: number = 4,
  onTimeout?: () => void,
) {
  const timeoutMs = timeoutHours * 3600 * 1000;

  useEffect(() => {
    let timer: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        onTimeout?.();
      }, timeoutMs);
    };

    const events = ["mousedown", "mousemove", "keydown", "scroll", "touchstart"];
    events.forEach((e) => window.addEventListener(e, resetTimer));
    resetTimer();

    return () => {
      clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, resetTimer));
    };
  }, [timeoutMs, onTimeout]);
}
