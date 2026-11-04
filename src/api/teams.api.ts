import { axiosInstance } from "./axiosInstance";
import { ENDPOINTS } from "./endpoints";
import {
  mockGetTeamDetail,
  mockGetTeamMembers,
  mockToggleTeamStatus,
  mockGetManageTeams,
  mockCreateTeam,
  mockUpdateTeam,
  mockDeactivateTeam,
  mockReactivateTeam,
} from "./mock/mockHandlers";
import type {
  TeamDetail,
  TeamMemberRow,
  Team,
  TeamListParams,
  TeamListResponse,
  CreateTeamPayload,
  UpdateTeamPayload,
  DeactivateTeamPayload,
  ReactivateTeamPayload,
} from "@/types/team.types";
import type { PaginatedResult, TableQueryParams } from "@/types/common.types";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

export const teamsApi = {
  // Manage Teams Page list & stats
  getTeams: async (params?: TeamListParams): Promise<TeamListResponse> => {
    if (USE_MOCK) {
      return mockGetManageTeams(params);
    }
    const response = await axiosInstance.get<{ data: TeamListResponse }>(
      ENDPOINTS.TEAMS.LIST,
      { params },
    );
    return response.data.data;
  },

  // Team detail
  getTeamById: async (teamId: string): Promise<TeamDetail> => {
    if (USE_MOCK) {
      return mockGetTeamDetail(teamId);
    }
    const response = await axiosInstance.get<{ data: TeamDetail }>(
      ENDPOINTS.TEAMS.DETAIL(teamId),
    );
    return response.data.data;
  },

  getDetail: async (teamId: string): Promise<TeamDetail> => {
    return teamsApi.getTeamById(teamId);
  },

  getMembers: async (
    teamId: string,
    params?: TableQueryParams,
  ): Promise<PaginatedResult<TeamMemberRow>> => {
    if (USE_MOCK) {
      return mockGetTeamMembers(teamId, params);
    }
    const response = await axiosInstance.get<{
      data: PaginatedResult<TeamMemberRow>;
    }>(ENDPOINTS.TEAMS.MEMBERS(teamId), { params });
    return response.data.data;
  },

  createTeam: async (payload: CreateTeamPayload): Promise<Team> => {
    if (USE_MOCK) {
      return mockCreateTeam(payload);
    }
    const response = await axiosInstance.post<{ data: Team }>(
      ENDPOINTS.TEAMS.CREATE,
      payload,
    );
    return response.data.data;
  },

  updateTeam: async (
    teamId: string,
    payload: UpdateTeamPayload,
  ): Promise<Team> => {
    if (USE_MOCK) {
      return mockUpdateTeam(teamId, payload);
    }
    const response = await axiosInstance.put<{ data: Team }>(
      ENDPOINTS.TEAMS.UPDATE(teamId),
      payload,
    );
    return response.data.data;
  },

  deactivateTeam: async (
    teamId: string,
    payload: DeactivateTeamPayload,
  ): Promise<Team> => {
    if (USE_MOCK) {
      return mockDeactivateTeam(teamId, payload);
    }
    const response = await axiosInstance.post<{ data: Team }>(
      ENDPOINTS.TEAMS.DEACTIVATE(teamId),
      payload,
    );
    return response.data.data;
  },

  reactivateTeam: async (
    teamId: string,
    payload: ReactivateTeamPayload,
  ): Promise<Team> => {
    if (USE_MOCK) {
      return mockReactivateTeam(teamId, payload);
    }
    const response = await axiosInstance.post<{ data: Team }>(
      ENDPOINTS.TEAMS.REACTIVATE(teamId),
      payload,
    );
    return response.data.data;
  },

  toggleStatus: async (
    teamId: string,
  ): Promise<{ id: string; status: "ACTIVE" | "INACTIVE" }> => {
    if (USE_MOCK) {
      const updated = await mockToggleTeamStatus(teamId);
      return { id: updated.id, status: updated.status };
    }
    const response = await axiosInstance.post<{
      data: { id: string; status: "ACTIVE" | "INACTIVE" };
    }>(ENDPOINTS.TEAMS.TOGGLE_STATUS(teamId));
    return response.data.data;
  },
};
