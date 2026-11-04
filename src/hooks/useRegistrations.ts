import { useQuery } from "@tanstack/react-query";
import { registrationsApi } from "@/api/registrations.api";
import type { TableQueryParams } from "@/types/common.types";

export function useTeams(params?: TableQueryParams) {
  return useQuery({
    queryKey: ["registrations", "teams", params],
    queryFn: () => registrationsApi.getTeams(params),
  });
}

export function useStaffs(params?: TableQueryParams) {
  return useQuery({
    queryKey: ["registrations", "staffs", params],
    queryFn: () => registrationsApi.getStaffs(params),
  });
}

export function useOrganizers(params?: TableQueryParams) {
  return useQuery({
    queryKey: ["registrations", "organizers", params],
    queryFn: () => registrationsApi.getOrganizers(params),
  });
}

export function useRegistrantDetail(id: string | null) {
  return useQuery({
    queryKey: ["registrations", "detail", id],
    queryFn: () => registrationsApi.getDetail(id!),
    enabled: !!id,
  });
}
