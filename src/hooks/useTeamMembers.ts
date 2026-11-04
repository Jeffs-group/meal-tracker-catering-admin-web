import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { teamsApi } from "@/api/teams.api";
import type { TableQueryParams } from "@/types/common.types";

export function useTeamDetail(teamId: string) {
  return useQuery({
    queryKey: ["teams", "detail", teamId],
    queryFn: () => teamsApi.getDetail(teamId),
    enabled: !!teamId,
  });
}

export function useTeamMembers(teamId: string, params?: TableQueryParams) {
  return useQuery({
    queryKey: ["teams", "members", teamId, params],
    queryFn: () => teamsApi.getMembers(teamId, params),
    enabled: !!teamId,
  });
}

export function useToggleTeamStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (teamId: string) => teamsApi.toggleStatus(teamId),
    onSuccess: (_, teamId) => {
      // Invalidate relevant queries so meal eligibility and counts refresh
      queryClient.invalidateQueries({ queryKey: ["teams", "detail", teamId] });
      queryClient.invalidateQueries({ queryKey: ["teams", "members", teamId] });
      queryClient.invalidateQueries({ queryKey: ["registrations", "teams"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "summary"] });
    },
  });
}
