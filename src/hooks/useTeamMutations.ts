import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { teamsApi } from "@/api/teams.api";
import type {
  TeamListParams,
  TeamListResponse,
  CreateTeamPayload,
  UpdateTeamPayload,
  DeactivateTeamPayload,
  ReactivateTeamPayload,
} from "@/types/team.types";

export const TEAM_QUERY_KEYS = {
  all: ["teams"] as const,
  manage: (params?: TeamListParams) => ["teams", "manage", params] as const,
  detail: (id: string) => ["teams", "detail", id] as const,
  members: (id: string, params?: unknown) =>
    ["teams", "members", id, params] as const,
};

export function useManageTeams(params: TeamListParams = {}) {
  return useQuery<TeamListResponse>({
    queryKey: TEAM_QUERY_KEYS.manage(params),
    queryFn: () => teamsApi.getTeams(params),
    staleTime: 1000 * 30, // 30 seconds
  });
}

export function useTeamMutations() {
  const queryClient = useQueryClient();

  const invalidateAllTeamQueries = (teamId?: string) => {
    queryClient.invalidateQueries({ queryKey: ["teams", "manage"] });
    queryClient.invalidateQueries({ queryKey: ["registrations", "teams"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard", "summary"] });
    queryClient.invalidateQueries({ queryKey: ["reports"] });
    if (teamId) {
      queryClient.invalidateQueries({ queryKey: ["teams", "detail", teamId] });
      queryClient.invalidateQueries({ queryKey: ["teams", "members", teamId] });
    }
  };

  const createMutation = useMutation({
    mutationFn: (payload: CreateTeamPayload) => teamsApi.createTeam(payload),
    onSuccess: () => {
      invalidateAllTeamQueries();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      teamId,
      payload,
    }: {
      teamId: string;
      payload: UpdateTeamPayload;
    }) => teamsApi.updateTeam(teamId, payload),
    onSuccess: (_, variables) => {
      invalidateAllTeamQueries(variables.teamId);
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: ({
      teamId,
      payload,
    }: {
      teamId: string;
      payload: DeactivateTeamPayload;
    }) => teamsApi.deactivateTeam(teamId, payload),
    onSuccess: (_, variables) => {
      invalidateAllTeamQueries(variables.teamId);
      // Invalidate all registrations so meal eligibility updates everywhere
      queryClient.invalidateQueries({ queryKey: ["registrations"] });
    },
  });

  const reactivateMutation = useMutation({
    mutationFn: ({
      teamId,
      payload,
    }: {
      teamId: string;
      payload: ReactivateTeamPayload;
    }) => teamsApi.reactivateTeam(teamId, payload),
    onSuccess: (_, variables) => {
      invalidateAllTeamQueries(variables.teamId);
      queryClient.invalidateQueries({ queryKey: ["registrations"] });
    },
  });

  return {
    createTeam: createMutation,
    updateTeam: updateMutation,
    deactivateTeam: deactivateMutation,
    reactivateTeam: reactivateMutation,
  };
}

