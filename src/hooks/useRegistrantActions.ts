import { useMutation, useQueryClient } from "@tanstack/react-query";
import { registrationsApi } from "@/api/registrations.api";

export function useApproveRegistrant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => registrationsApi.approve(id),
    onSuccess: (data) => {
      queryClient.setQueryData(["registrations", "detail", data.id], data);
      queryClient.invalidateQueries({ queryKey: ["registrations"] });
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "summary"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
}

export function useRejectRegistrant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      registrationsApi.reject(id, reason),
    onSuccess: (data) => {
      queryClient.setQueryData(["registrations", "detail", data.id], data);
      queryClient.invalidateQueries({ queryKey: ["registrations"] });
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "summary"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
}

export function useRevokeApproval() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      registrationsApi.revoke(id, reason),
    onSuccess: (data) => {
      queryClient.setQueryData(["registrations", "detail", data.id], data);
      queryClient.invalidateQueries({ queryKey: ["registrations"] });
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "summary"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
}

export function useReopenVerification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => registrationsApi.reopen(id),
    onSuccess: (data) => {
      queryClient.setQueryData(["registrations", "detail", data.id], data);
      queryClient.invalidateQueries({ queryKey: ["registrations"] });
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "summary"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
}

export function useResendPasscode() {
  return useMutation({
    mutationFn: (id: string) => registrationsApi.resendPasscode(id),
  });
}

export function useToggleMealEligibility() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => registrationsApi.toggleMealEligibility(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["registrations", "staffs"] });
      queryClient.invalidateQueries({
        queryKey: ["registrations", "organizers"],
      });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "summary"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
}
