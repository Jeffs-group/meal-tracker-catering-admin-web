import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  login,
  refreshAuthToken,
  logout,
  getCurrentUser,
} from "@/api/auth.api";
import {
  getSuperUsersSummary,
  exportSuperUsers,
  uploadUserPhoto,
  inviteSuperUser,
  listSuperUsers,
  createSuperUser,
  getSuperUserDetail,
  updateSuperUser,
  deactivateSuperUser,
  reactivateSuperUser,
  resendSuperUserInvitation,
  resetSuperUserPassword,
  getSuperPermissionsMatrix,
  listSuperRoles,
  createSuperRole,
  updateSuperRole,
  listEventRoles,
  listEventUsers,
  createEventUser,
  updateEventUser,
  resetEventUserPassword,
  type UserListFilterParams,
} from "@/api/superUsers.api";
import {
  listMealDays,
  createMealDay,
  getMealDayDetail,
  addMealPeriod,
  updateMealPeriod,
} from "@/api/superMeals.api";
import {
  getManageMealsDashboard,
  searchManageMeals,
  getManageMealsTeamRegistrants,
  getManageMealsStaffRegistrants,
  getRegistrantDistribution,
  saveManageMealsConfiguration,
  listMealDayRegistrants,
  verifyRegistrantForMeal,
  provideMealToRegistrant,
  type TeamRegistrantsFilterParams,
  type StaffRegistrantsFilterParams,
} from "@/api/manageMeals.api";
import {
  getSuperReportsDashboard,
  getDistributionReport,
  getRegistrantHistoryReport,
  getQuantityReport,
  getTeamDistributionReport,
  getStaffDistributionReport,
  exportReportCsv,
  type ReportFilterQueryParams,
} from "@/api/superReports.api";
import type {
  LoginDto,
  CreateUserDto,
  UpdateUserDto,
  InviteUserDto,
  CreateRoleDto,
  UpdateRoleDto,
  CreateMealDayDto,
  CreateMealPeriodDto,
  UpdateMealPeriodDto,
  ManageMealsSaveConfigDto,
  VerifyRegistrantDto,
  ProvideMealDto,
} from "@/types/superAdminApi.types";

export const SUPER_API_KEYS = {
  authMe: ["super", "auth", "me"],
  usersSummary: ["super", "users", "summary"],
  usersList: (params?: UserListFilterParams) => ["super", "users", "list", params],
  userDetail: (id: string) => ["super", "users", "detail", id],
  permissionsMatrix: ["super", "roles", "matrix"],
  rolesList: (search?: string) => ["super", "roles", "list", search],
  eventRolesList: ["super", "event-roles", "list"],
  eventUsersList: ["super", "event-users", "list"],
  mealDaysList: ["super", "meal-days", "list"],
  mealDayDetail: (date: string) => ["super", "meal-days", "detail", date],
  manageDashboard: (date?: string) => ["super", "manage-meals", "dashboard", date],
  manageSearch: (q: string, date?: string) => ["super", "manage-meals", "search", q, date],
  manageTeamRegistrants: (teamId: string, params?: TeamRegistrantsFilterParams) => [
    "super",
    "manage-meals",
    "teams",
    teamId,
    params,
  ],
  manageStaffRegistrants: (params?: StaffRegistrantsFilterParams) => [
    "super",
    "manage-meals",
    "staff",
    params,
  ],
  registrantDistribution: (code: string, date: string) => [
    "super",
    "manage-meals",
    "registrant",
    code,
    date,
  ],
  reportsDashboard: (params?: ReportFilterQueryParams) => ["super", "reports", "dashboard", params],
  reportsDistribution: (params?: ReportFilterQueryParams) => ["super", "reports", "distribution", params],
  reportsRegistrants: (params?: ReportFilterQueryParams) => ["super", "reports", "registrants", params],
  reportsQuantities: (params?: ReportFilterQueryParams) => ["super", "reports", "quantities", params],
  reportsTeams: (params?: ReportFilterQueryParams) => ["super", "reports", "teams", params],
  reportsStaff: (params?: ReportFilterQueryParams) => ["super", "reports", "staff", params],
};

// -------------------------------------------------------------
// AUTH HOOKS
// -------------------------------------------------------------
export function useCurrentUser() {
  return useQuery({
    queryKey: SUPER_API_KEYS.authMe,
    queryFn: getCurrentUser,
    retry: false,
  });
}

export function useLoginMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: LoginDto) => login(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUPER_API_KEYS.authMe });
    },
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.clear();
    },
  });
}

export function useRefreshAuthMutation() {
  return useMutation({
    mutationFn: refreshAuthToken,
  });
}

// -------------------------------------------------------------
// SUPER USERS & ROLES HOOKS
// -------------------------------------------------------------
export function useSuperUsersSummary() {
  return useQuery({
    queryKey: SUPER_API_KEYS.usersSummary,
    queryFn: getSuperUsersSummary,
  });
}

export function useSuperUsersList(params?: UserListFilterParams) {
  return useQuery({
    queryKey: SUPER_API_KEYS.usersList(params),
    queryFn: () => listSuperUsers(params),
  });
}

export function useSuperUserDetail(id: string) {
  return useQuery({
    queryKey: SUPER_API_KEYS.userDetail(id),
    queryFn: () => getSuperUserDetail(id),
    enabled: !!id,
  });
}

export function useSuperPermissionsMatrix() {
  return useQuery({
    queryKey: SUPER_API_KEYS.permissionsMatrix,
    queryFn: getSuperPermissionsMatrix,
  });
}

export function useSuperRolesList(search?: string) {
  return useQuery({
    queryKey: SUPER_API_KEYS.rolesList(search),
    queryFn: () => listSuperRoles(search),
  });
}

export function useCreateSuperUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateUserDto) => createSuperUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["super", "users"] });
    },
  });
}

export function useInviteSuperUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: InviteUserDto) => inviteSuperUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["super", "users"] });
    },
  });
}

export function useUpdateSuperUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserDto }) =>
      updateSuperUser(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["super", "users"] });
      queryClient.invalidateQueries({ queryKey: SUPER_API_KEYS.userDetail(id) });
    },
  });
}

export function useDeactivateSuperUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deactivateSuperUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["super", "users"] });
    },
  });
}

export function useReactivateSuperUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => reactivateSuperUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["super", "users"] });
    },
  });
}

export function useResendInvitationMutation() {
  return useMutation({
    mutationFn: (id: string) => resendSuperUserInvitation(id),
  });
}

export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: (id: string) => resetSuperUserPassword(id),
  });
}

export function useCreateSuperRoleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateRoleDto) => createSuperRole(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["super", "roles"] });
    },
  });
}

export function useUpdateSuperRoleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRoleDto }) =>
      updateSuperRole(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["super", "roles"] });
    },
  });
}

export function useUploadUserPhotoMutation() {
  return useMutation({
    mutationFn: (file: File) => uploadUserPhoto(file),
  });
}

export function useExportSuperUsersMutation() {
  return useMutation({
    mutationFn: (params?: UserListFilterParams) => exportSuperUsers(params),
  });
}

export function useEventRolesList() {
  return useQuery({
    queryKey: SUPER_API_KEYS.eventRolesList,
    queryFn: listEventRoles,
  });
}

export function useEventUsersList() {
  return useQuery({
    queryKey: SUPER_API_KEYS.eventUsersList,
    queryFn: listEventUsers,
  });
}

export function useCreateEventUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateUserDto) => createEventUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUPER_API_KEYS.eventUsersList });
    },
  });
}

export function useUpdateEventUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserDto }) =>
      updateEventUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUPER_API_KEYS.eventUsersList });
    },
  });
}

export function useResetEventUserPasswordMutation() {
  return useMutation({
    mutationFn: (id: string) => resetEventUserPassword(id),
  });
}

// -------------------------------------------------------------
// SUPER MEALS HOOKS
// -------------------------------------------------------------
export function useSuperMealDaysList() {
  return useQuery({
    queryKey: SUPER_API_KEYS.mealDaysList,
    queryFn: listMealDays,
  });
}

export function useSuperMealDayDetail(date: string) {
  return useQuery({
    queryKey: SUPER_API_KEYS.mealDayDetail(date),
    queryFn: () => getMealDayDetail(date),
    enabled: !!date,
  });
}

export function useCreateMealDayMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMealDayDto) => createMealDay(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUPER_API_KEYS.mealDaysList });
    },
  });
}

export function useAddMealPeriodMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ date, data }: { date: string; data: CreateMealPeriodDto }) =>
      addMealPeriod(date, data),
    onSuccess: (_, { date }) => {
      queryClient.invalidateQueries({ queryKey: SUPER_API_KEYS.mealDayDetail(date) });
      queryClient.invalidateQueries({ queryKey: SUPER_API_KEYS.mealDaysList });
    },
  });
}

export function useUpdateMealPeriodMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      date,
      periodId,
      data,
    }: {
      date: string;
      periodId: string;
      data: UpdateMealPeriodDto;
    }) => updateMealPeriod(date, periodId, data),
    onSuccess: (_, { date }) => {
      queryClient.invalidateQueries({ queryKey: SUPER_API_KEYS.mealDayDetail(date) });
      queryClient.invalidateQueries({ queryKey: SUPER_API_KEYS.mealDaysList });
    },
  });
}

// -------------------------------------------------------------
// MANAGE MEALS HOOKS
// -------------------------------------------------------------
export function useManageMealsDashboardLive(date?: string) {
  return useQuery({
    queryKey: SUPER_API_KEYS.manageDashboard(date),
    queryFn: () => getManageMealsDashboard(date),
    refetchInterval: 30000,
  });
}

export function useManageMealsSearchLive(q: string, date?: string) {
  return useQuery({
    queryKey: SUPER_API_KEYS.manageSearch(q, date),
    queryFn: () => searchManageMeals(q, date),
    enabled: q.trim().length >= 2,
  });
}

export function useManageMealsTeamRegistrantsLive(
  teamId: string,
  params?: TeamRegistrantsFilterParams,
) {
  return useQuery({
    queryKey: SUPER_API_KEYS.manageTeamRegistrants(teamId, params),
    queryFn: () => getManageMealsTeamRegistrants(teamId, params),
    enabled: !!teamId,
  });
}

export function useManageMealsStaffRegistrantsLive(
  params?: StaffRegistrantsFilterParams,
) {
  return useQuery({
    queryKey: SUPER_API_KEYS.manageStaffRegistrants(params),
    queryFn: () => getManageMealsStaffRegistrants(params),
  });
}

export function useRegistrantDistributionLive(registrantCode: string, date: string) {
  return useQuery({
    queryKey: SUPER_API_KEYS.registrantDistribution(registrantCode, date),
    queryFn: () => getRegistrantDistribution(registrantCode, date),
    enabled: !!registrantCode && !!date,
  });
}

export function useSaveManageMealsConfigMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ManageMealsSaveConfigDto) =>
      saveManageMealsConfiguration(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["super", "manage-meals"] });
      queryClient.invalidateQueries({ queryKey: ["super", "meal-days"] });
    },
  });
}

export function useVerifyRegistrantMutation() {
  return useMutation({
    mutationFn: ({ date, data }: { date: string; data: VerifyRegistrantDto }) =>
      verifyRegistrantForMeal(date, data),
  });
}

export function useProvideMealLiveMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ date, data }: { date: string; data: ProvideMealDto }) =>
      provideMealToRegistrant(date, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["super", "manage-meals"] });
      queryClient.invalidateQueries({ queryKey: ["super", "reports"] });
    },
  });
}

export function useListMealDayRegistrants(
  date: string,
  params?: { category?: string; periodId?: string },
) {
  return useQuery({
    queryKey: ["super", "meal-days", "registrants", date, params],
    queryFn: () => listMealDayRegistrants(date, params),
    enabled: !!date,
  });
}

// -------------------------------------------------------------
// SUPER REPORTS HOOKS
// -------------------------------------------------------------
export function useSuperReportsDashboard(params?: ReportFilterQueryParams) {
  return useQuery({
    queryKey: SUPER_API_KEYS.reportsDashboard(params),
    queryFn: () => getSuperReportsDashboard(params),
    refetchInterval: 30000,
  });
}

export function useDistributionReportQuery(params?: ReportFilterQueryParams) {
  return useQuery({
    queryKey: SUPER_API_KEYS.reportsDistribution(params),
    queryFn: () => getDistributionReport(params),
  });
}

export function useRegistrantHistoryReportQuery(params?: ReportFilterQueryParams) {
  return useQuery({
    queryKey: SUPER_API_KEYS.reportsRegistrants(params),
    queryFn: () => getRegistrantHistoryReport(params),
  });
}

export function useQuantityReportQuery(params?: ReportFilterQueryParams) {
  return useQuery({
    queryKey: SUPER_API_KEYS.reportsQuantities(params),
    queryFn: () => getQuantityReport(params),
  });
}

export function useTeamDistributionReportQuery(params?: ReportFilterQueryParams) {
  return useQuery({
    queryKey: SUPER_API_KEYS.reportsTeams(params),
    queryFn: () => getTeamDistributionReport(params),
  });
}

export function useStaffDistributionReportQuery(params?: ReportFilterQueryParams) {
  return useQuery({
    queryKey: SUPER_API_KEYS.reportsStaff(params),
    queryFn: () => getStaffDistributionReport(params),
  });
}

export function useExportReportCsvMutation() {
  return useMutation({
    mutationFn: ({
      reportType,
      date,
    }: {
      reportType: "distribution" | "registrants" | "quantities" | "teams" | "staff";
      date?: string;
    }) => exportReportCsv(reportType, date),
  });
}
