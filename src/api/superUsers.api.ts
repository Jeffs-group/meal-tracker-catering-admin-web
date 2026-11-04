import { axiosInstance } from "./axiosInstance";
import { SUPER_ENDPOINTS } from "./endpoints";
import type {
  SuperUserSummaryDto,
  UserResponseDto,
  CreateUserDto,
  UpdateUserDto,
  SuperUserDetailDto,
  InviteUserDto,
  ResetPasswordResponseDto,
  PermissionsMatrixResponseDto,
  RoleResponseDto,
  CreateRoleDto,
  UpdateRoleDto,
} from "@/types/superAdminApi.types";

export interface UserListFilterParams {
  page?: number;
  pageSize?: number;
  search?: string;
  roleId?: string;
  status?: string;
  isActive?: boolean;
}

/**
 * Super Admin Users & Roles API Service
 */
export async function getSuperUsersSummary(): Promise<SuperUserSummaryDto> {
  const response = await axiosInstance.get<SuperUserSummaryDto>(
    SUPER_ENDPOINTS.SUPER_USERS.SUMMARY,
  );
  return response.data;
}

export async function exportSuperUsers(
  params?: UserListFilterParams,
): Promise<Blob> {
  const response = await axiosInstance.get(
    SUPER_ENDPOINTS.SUPER_USERS.EXPORT,
    {
      params,
      responseType: "blob",
    },
  );
  return response.data;
}

export async function uploadUserPhoto(
  file: File,
): Promise<{ photoUrl: string; key?: string }> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await axiosInstance.post<{ photoUrl: string; key?: string }>(
    SUPER_ENDPOINTS.SUPER_USERS.PHOTO,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return response.data;
}

export async function inviteSuperUser(
  data: InviteUserDto,
): Promise<UserResponseDto> {
  const response = await axiosInstance.post<UserResponseDto>(
    SUPER_ENDPOINTS.SUPER_USERS.INVITE,
    data,
  );
  return response.data;
}

export async function listSuperUsers(
  params?: UserListFilterParams,
): Promise<UserResponseDto[]> {
  const response = await axiosInstance.get<UserResponseDto[]>(
    SUPER_ENDPOINTS.SUPER_USERS.LIST,
    { params },
  );
  return response.data;
}

export async function createSuperUser(
  data: CreateUserDto,
): Promise<UserResponseDto> {
  const response = await axiosInstance.post<UserResponseDto>(
    SUPER_ENDPOINTS.SUPER_USERS.CREATE,
    data,
  );
  return response.data;
}

export async function getSuperUserDetail(
  id: string,
): Promise<SuperUserDetailDto> {
  const response = await axiosInstance.get<SuperUserDetailDto>(
    SUPER_ENDPOINTS.SUPER_USERS.DETAIL(id),
  );
  return response.data;
}

export async function updateSuperUser(
  id: string,
  data: UpdateUserDto,
): Promise<UserResponseDto> {
  const response = await axiosInstance.patch<UserResponseDto>(
    SUPER_ENDPOINTS.SUPER_USERS.UPDATE(id),
    data,
  );
  return response.data;
}

export async function deactivateSuperUser(
  id: string,
): Promise<{ success: boolean; message?: string }> {
  const response = await axiosInstance.post<{ success: boolean; message?: string }>(
    SUPER_ENDPOINTS.SUPER_USERS.DEACTIVATE(id),
  );
  return response.data;
}

export async function reactivateSuperUser(
  id: string,
): Promise<{ success: boolean; message?: string }> {
  const response = await axiosInstance.post<{ success: boolean; message?: string }>(
    SUPER_ENDPOINTS.SUPER_USERS.REACTIVATE(id),
  );
  return response.data;
}

export async function resendSuperUserInvitation(
  id: string,
): Promise<{ success: boolean; message?: string }> {
  const response = await axiosInstance.post<{ success: boolean; message?: string }>(
    SUPER_ENDPOINTS.SUPER_USERS.RESEND_INVITATION(id),
  );
  return response.data;
}

export async function resetSuperUserPassword(
  id: string,
): Promise<ResetPasswordResponseDto> {
  const response = await axiosInstance.post<ResetPasswordResponseDto>(
    SUPER_ENDPOINTS.SUPER_USERS.RESET_PASSWORD(id),
  );
  return response.data;
}

export async function getSuperPermissionsMatrix(): Promise<PermissionsMatrixResponseDto> {
  const response = await axiosInstance.get<PermissionsMatrixResponseDto>(
    SUPER_ENDPOINTS.SUPER_USERS.PERMISSIONS_MATRIX,
  );
  return response.data;
}

export async function listSuperRoles(
  search?: string,
): Promise<RoleResponseDto[]> {
  const response = await axiosInstance.get<RoleResponseDto[]>(
    SUPER_ENDPOINTS.SUPER_USERS.ROLES_LIST,
    { params: search ? { search } : undefined },
  );
  return response.data;
}

export async function createSuperRole(
  data: CreateRoleDto,
): Promise<RoleResponseDto> {
  const response = await axiosInstance.post<RoleResponseDto>(
    SUPER_ENDPOINTS.SUPER_USERS.ROLES_CREATE,
    data,
  );
  return response.data;
}

export async function updateSuperRole(
  id: string,
  data: UpdateRoleDto,
): Promise<RoleResponseDto> {
  const response = await axiosInstance.patch<RoleResponseDto>(
    SUPER_ENDPOINTS.SUPER_USERS.ROLES_UPDATE(id),
    data,
  );
  return response.data;
}

// Event Admin Users & Roles
export async function listEventRoles(): Promise<RoleResponseDto[]> {
  const response = await axiosInstance.get<RoleResponseDto[]>(
    SUPER_ENDPOINTS.SUPER_USERS.EVENT_ROLES,
  );
  return response.data;
}

export async function listEventUsers(): Promise<UserResponseDto[]> {
  const response = await axiosInstance.get<UserResponseDto[]>(
    SUPER_ENDPOINTS.SUPER_USERS.EVENT_USERS,
  );
  return response.data;
}

export async function createEventUser(
  data: CreateUserDto,
): Promise<UserResponseDto> {
  const response = await axiosInstance.post<UserResponseDto>(
    SUPER_ENDPOINTS.SUPER_USERS.EVENT_USERS_CREATE,
    data,
  );
  return response.data;
}

export async function updateEventUser(
  id: string,
  data: UpdateUserDto,
): Promise<UserResponseDto> {
  const response = await axiosInstance.patch<UserResponseDto>(
    SUPER_ENDPOINTS.SUPER_USERS.EVENT_USERS_UPDATE(id),
    data,
  );
  return response.data;
}

export async function resetEventUserPassword(
  id: string,
): Promise<ResetPasswordResponseDto> {
  const response = await axiosInstance.post<ResetPasswordResponseDto>(
    SUPER_ENDPOINTS.SUPER_USERS.EVENT_USERS_RESET_PASSWORD(id),
  );
  return response.data;
}

