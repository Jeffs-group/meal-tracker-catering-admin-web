import { axiosInstance } from "./axiosInstance";
import { ENDPOINTS } from "./endpoints";
import {
  mockGetTeams,
  mockGetStaffs,
  mockGetOrganizers,
  mockGetRegistrantDetail,
  mockApproveRegistrant,
  mockRejectRegistrant,
  mockRevokeApproval,
  mockReopenVerification,
  mockResendPasscode,
  mockToggleMealEligibility,
} from "./mock/mockHandlers";
import type {
  TeamRegistrationRow,
  StaffRegistrationRow,
  OrganizerRegistrationRow,
  RegistrantDetail,
  StaffStats,
} from "@/types/registration.types";
import type { PaginatedResult, TableQueryParams } from "@/types/common.types";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

export const registrationsApi = {
  getTeams: async (
    params?: TableQueryParams,
  ): Promise<PaginatedResult<TeamRegistrationRow>> => {
    if (USE_MOCK) {
      return mockGetTeams(params);
    }
    const response = await axiosInstance.get<{
      data: PaginatedResult<TeamRegistrationRow>;
    }>(ENDPOINTS.REGISTRATIONS.TEAMS, { params });
    return response.data.data;
  },

  getStaffs: async (
    params?: TableQueryParams,
  ): Promise<{
    result: PaginatedResult<StaffRegistrationRow>;
    stats: StaffStats;
  }> => {
    if (USE_MOCK) {
      return mockGetStaffs(params);
    }
    const response = await axiosInstance.get<{
      data: {
        result: PaginatedResult<StaffRegistrationRow>;
        stats: StaffStats;
      };
    }>(ENDPOINTS.REGISTRATIONS.STAFFS, { params });
    return response.data.data;
  },

  getOrganizers: async (
    params?: TableQueryParams,
  ): Promise<{
    result: PaginatedResult<OrganizerRegistrationRow>;
    stats: StaffStats;
  }> => {
    if (USE_MOCK) {
      return mockGetOrganizers(params);
    }
    const response = await axiosInstance.get<{
      data: {
        result: PaginatedResult<OrganizerRegistrationRow>;
        stats: StaffStats;
      };
    }>(ENDPOINTS.REGISTRATIONS.ORGANIZERS, { params });
    return response.data.data;
  },

  getDetail: async (id: string): Promise<RegistrantDetail> => {
    if (USE_MOCK) {
      return mockGetRegistrantDetail(id);
    }
    const response = await axiosInstance.get<{ data: RegistrantDetail }>(
      ENDPOINTS.REGISTRATIONS.DETAIL(id),
    );
    return response.data.data;
  },

  approve: async (id: string): Promise<RegistrantDetail> => {
    if (USE_MOCK) {
      return mockApproveRegistrant(id);
    }
    const response = await axiosInstance.post<{ data: RegistrantDetail }>(
      ENDPOINTS.REGISTRATIONS.APPROVE(id),
    );
    return response.data.data;
  },

  reject: async (id: string, reason: string): Promise<RegistrantDetail> => {
    if (USE_MOCK) {
      return mockRejectRegistrant(id, reason);
    }
    const response = await axiosInstance.post<{ data: RegistrantDetail }>(
      ENDPOINTS.REGISTRATIONS.REJECT(id),
      { reason },
    );
    return response.data.data;
  },

  revoke: async (id: string, reason?: string): Promise<RegistrantDetail> => {
    if (USE_MOCK) {
      return mockRevokeApproval(id, reason);
    }
    const response = await axiosInstance.post<{ data: RegistrantDetail }>(
      ENDPOINTS.REGISTRATIONS.REVOKE(id),
      { reason },
    );
    return response.data.data;
  },

  reopen: async (id: string): Promise<RegistrantDetail> => {
    if (USE_MOCK) {
      return mockReopenVerification(id);
    }
    const response = await axiosInstance.post<{ data: RegistrantDetail }>(
      ENDPOINTS.REGISTRATIONS.REOPEN(id),
    );
    return response.data.data;
  },

  resendPasscode: async (
    id: string,
  ): Promise<{ success: boolean; message: string }> => {
    if (USE_MOCK) {
      return mockResendPasscode(id);
    }
    const response = await axiosInstance.post<{
      data: { success: boolean; message: string };
    }>(ENDPOINTS.REGISTRATIONS.RESEND_PASSCODE(id));
    return response.data.data;
  },

  toggleMealEligibility: async (id: string): Promise<boolean> => {
    if (USE_MOCK) {
      return mockToggleMealEligibility(id);
    }
    const response = await axiosInstance.post<{ data: boolean }>(
      ENDPOINTS.REGISTRATIONS.TOGGLE_MEAL(id),
    );
    return response.data.data;
  },
};
