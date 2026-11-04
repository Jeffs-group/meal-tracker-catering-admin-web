export type RegistrationStatus = "APPROVED" | "PENDING" | "REJECTED";

export type TeamStatus = "ACTIVE" | "INACTIVE";

export type RegistrantType = "TEAM" | "STAFF" | "ORGANIZER";

export type MemberType =
  "PLAYER" | "OWNER" | "COACH" | "STAFF" | "ORGANIZER" | "OTHERS";

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: PaginationMeta;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data: T;
}

export interface TableQueryParams {
  search?: string;
  status?: string;
  role?: string;
  league?: string;
  tab?: string;
  memberType?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
