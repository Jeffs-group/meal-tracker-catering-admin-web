/**
 * Auto-generated TypeScript definitions from openapi.json
 * Jeff's Meal Tracking API v1 - Super Admin & Auth Endpoints
 */

export interface LoginDto {
  email: string;
  password: string;
}
export interface LoginResponseDto {
  /** Bearer token for Authorization. Expires in 15 minutes. */
  accessToken: string;
  user: AuthUserDto;
}
export interface LogoutResponseDto {
  signedOut: boolean;
}
export interface MeResponseDto {
  id: string;
  name: string;
  email: string;
  portal: 'EVENT' | 'SUPER';
  role: string;
  /** Permission keys granted by the user role. */
  permissions: string[];
}
export interface AuthUserDto {
  id: string;
  email: string;
  name: string;
  portal: 'EVENT' | 'SUPER';
  role: string;
}
export interface SuperUserSummaryDto {
  /** Total registered portal accounts across KSPL & ISCL */
  totalUsers: number;
  /** Users with active portal access and verified tokens */
  activeUsers: number;
  /** Percentage of active verified accounts */
  activePercentage: number;
  /** Users who have not completed their account activation */
  pendingInvitations: number;
}
export interface UserSummaryDto {
  /** Total users registered across active roles */
  totalUsers: number;
  /** Users with authorized active portal access */
  activeUsers: number;
  /** Percentage of active authorized users */
  activePercentage: number;
  /** Quarantined, suspended or inactive user accounts */
  inactiveUsers: number;
}
export interface UserRoleSummaryDto {
  id: string;
  name: string;
  code?: Record<string, unknown>;
  portal: 'EVENT' | 'SUPER';
}
export interface UserResponseDto {
  id: string;
  userCode?: Record<string, unknown>;
  name: string;
  email: string;
  contactNumber?: Record<string, unknown>;
  handle?: Record<string, unknown>;
  /** Profile avatar image URL */
  avatarUrl?: Record<string, unknown>;
  isActive: boolean;
  accountStatus?: 'ACTIVE' | 'INVITATION_PENDING' | 'INACTIVE';
  invitationStatus?: 'PENDING' | 'ACCEPTED' | 'EXPIRED';
  liveStation?: Record<string, unknown>;
  /** Last login metadata */
  lastLogin?: Record<string, unknown>;
  roleId: string;
  role?: UserRoleSummaryDto;
  createdAt?: string;
  /** Present when an Event or Super portal user is created/invited. False when Brevo is not configured. */
  emailed?: boolean;
  /** Temporary password returned when email sending is disabled in local/testing environment. */
  temporaryPassword?: string;
  /** Invitation onboarding token for testing/local setups. */
  invitationToken?: string;
}
export interface CreateUserDto {
  name: string;
  email: string;
  /** Contact phone number including country code */
  contactNumber?: string;
  /** User handle or slug */
  handle?: string;
  /** Profile avatar photo key */
  avatarKey?: string;
  /** Custom user identifier code */
  userCode?: string;
  /** Optional initial password. If omitted, a secure temporary password is automatically generated and emailed to the user. */
  password?: string;
  /** Target assigned role UUID */
  roleId: string;
}
export interface UpdateUserDto {
  name?: string;
  email?: string;
  contactNumber?: string;
  handle?: string;
  /** Profile avatar photo key */
  avatarKey?: string;
  userCode?: string;
  roleId?: string;
  isActive?: boolean;
}
export interface InviteUserDto {
  name: string;
  email: string;
  contactNumber?: string;
  /** Target assigned operational role UUID */
  roleId: string;
  /** Profile avatar photo key */
  avatarKey?: string;
}
export interface SuperUserAuditHistoryDto {
  accountCreated?: Record<string, unknown>;
  invitationAccepted?: Record<string, unknown>;
  lastTokenRotation?: Record<string, unknown>;
  operatingLeagueScope: string;
}
export interface SuperModuleAccessItemDto {
  moduleKey: string;
  moduleName: string;
  accessTier: string;
  description: string;
}
export interface SuperUserDetailDto {
  id: string;
  userCode?: Record<string, unknown>;
  name: string;
  email: string;
  contactNumber?: Record<string, unknown>;
  handle?: Record<string, unknown>;
  /** Profile avatar image URL */
  avatarUrl?: Record<string, unknown>;
  isActive: boolean;
  accountStatus?: 'ACTIVE' | 'INVITATION_PENDING' | 'INACTIVE';
  invitationStatus?: 'PENDING' | 'ACCEPTED' | 'EXPIRED';
  liveStation?: Record<string, unknown>;
  /** Last login metadata */
  lastLogin?: Record<string, unknown>;
  roleId: string;
  role?: UserRoleSummaryDto;
  createdAt?: string;
  /** Present when an Event or Super portal user is created/invited. False when Brevo is not configured. */
  emailed?: boolean;
  /** Temporary password returned when email sending is disabled in local/testing environment. */
  temporaryPassword?: string;
  /** Invitation onboarding token for testing/local setups. */
  invitationToken?: string;
  auditHistory: SuperUserAuditHistoryDto;
  moduleAccessSummary: SuperModuleAccessItemDto[];
}
export interface ResetPasswordResponseDto {
  /** False when Brevo is not configured or the send fails. The temporary password is then returned once. */
  emailed: boolean;
  temporaryPassword?: string;
}
export interface PermissionsMatrixResponseDto {
  modules: PermissionsMatrixModuleDto[];
}
export interface PermissionsMatrixModuleDto {
  moduleKey: string;
  moduleName: string;
  actions: PermissionsMatrixActionDto[];
}
export interface PermissionsMatrixActionDto {
  action: string;
  label: string;
  permissionKey: string;
}
export interface SuperPermissionsMatrixItemDto {
  moduleKey: string;
  moduleName: string;
  scopeDescription: string;
  actions: string[];
  accessTier: string;
}
export interface SuperPermissionsMatrixResponseDto {
  modules: SuperPermissionsMatrixItemDto[];
}
export interface RoleResponseDto {
  id: string;
  name: string;
  code?: Record<string, unknown>;
  description?: Record<string, unknown>;
  /** Whether role is a built-in protected system preset */
  isSystem: boolean;
  portal: 'EVENT' | 'SUPER';
  /** Human readable scope summary */
  permissionsScope: string;
  /** Total number of users assigned to this role */
  assignedUserCount: number;
  /** Leading user avatars assigned to this role */
  assignedUsers: AssignedUserAvatarDto[];
  permissions: RolePermissionDto[];
}
export interface RolePermissionDto {
  permission: string;
}
export interface RoleSummaryDto {
  /** Total system preset and custom defined roles */
  totalDefinedRoles: number;
  /** Number of roles with root Superadmin authority */
  superAdminTier: number;
  /** Number of delegated operational staff roles */
  delegatedStaffRoles: number;
  /** Total operators active this season across delegated roles */
  activeOperatorsCount: number;
}
export interface CreateRoleDto {
  name: string;
  /** Unique role reference identifier code */
  code?: string;
  description?: string;
  /** List of module permissions granted for this role */
  permissions: string[];
}
export interface UpdateRoleDto {
  name?: string;
  code?: string;
  description?: string;
  permissions?: string[];
}
export interface AssignedUserAvatarDto {
  id: string;
  name: string;
  initials: string;
  email: string;
}
export interface MealDaySummaryDto {
  date: string;
  /** Teams that are Active and meal-activated for this date. */
  activeTeams: number;
  eligibleTeamMembers: number;
  /** Approved staff. Staff eligibility does not depend on team or meal activation. */
  eligibleStaff: number;
  totalEligibleRegistrants: number;
  /** Sum of planned veg and non-veg quantities. This is a preparation target, not a serving cap. */
  mealsPlanned: number;
  mealsDistributed: number;
}
export interface CreateMealDayDto {
  serviceDate: string;
}
export interface MealDayCreatedDto {
  id: string;
  date: string;
}
export interface MealDayDetailDto {
  id: string;
  date: string;
  periods: MealPeriodDto[];
}
export interface MealPeriodDto {
  id: string;
  name: string;
  sortOrder: number;
  isEnabled: boolean;
  vegPlanned: number;
  nonVegPlanned: number;
  totalPlanned: number;
}
export interface CreateMealPeriodDto {
  name: string;
  sortOrder?: number;
  isEnabled?: boolean;
  vegPlanned: number;
  nonVegPlanned: number;
  startTime?: string;
  endTime?: string;
}
export interface UpdateMealPeriodDto {
  name?: string;
  sortOrder?: number;
  isEnabled?: boolean;
  vegPlanned?: number;
  nonVegPlanned?: number;
  startTime?: string;
  endTime?: string;
}
export interface PeriodStatusDto {
  id: string;
  name: string;
  status: 'PENDING' | 'PROVIDED' | 'NOT_ELIGIBLE';
}
export interface DistributionTeamDto {
  id: string;
  name: string;
  league: 'KSPL' | 'ISCL';
}
export interface ManageMealPeriodConfigItemDto {
  id: string;
  name?: string;
  isEnabled?: boolean;
  startTime?: string;
  endTime?: string;
  vegPlanned: number;
  nonVegPlanned: number;
}
export interface ManageMealsSaveConfigDto {
  date: string;
  periods: ManageMealPeriodConfigItemDto[];
}
export interface VerifyRegistrantDto {
  registrantCode: string;
}
export interface VerifyRegistrantResponseDto {
  id: string;
  /** Short-lived presigned S3 URL. */
  photoUrl: string;
  registrantCode: Record<string, unknown>;
  fullName: string;
  type: 'TEAM' | 'STAFF';
  team?: DistributionTeamDto;
  memberType?: 'PLAYER' | 'OWNER' | 'COACH';
  mealPreference: 'VEG' | 'NON_VEG';
  /** Approved, team Active, and meal-activated for this date. Staff only need approval. */
  eligible: boolean;
  periods: PeriodStatusDto[];
  reasonCode?: 'NOT_APPROVED' | 'NOT_ELIGIBLE';
  reason?: Record<string, unknown>;
}
export interface ProvideMealDto {
  registrantCode: string;
  verificationCode: string;
  mealPeriodId: string;
}
export interface ProvideMealResponseDto {
  id: string;
  registrantCode: Record<string, unknown>;
  mealPeriod: string;
  /** Copied from the registration. The counter does not choose again. */
  mealPreference: 'VEG' | 'NON_VEG';
  servedAt: string;
  operatorId: string;
  status: string;
}
export interface SuperDashboardDto {
  date: string;
  eligibleTeamMembers: number;
  eligibleStaff: number;
  totalEligibleRegistrants: number;
  plannedMeals: number;
  servedMeals: number;
  remainingMeals: number;
  veg: QuantitySplitDto;
  nonVeg: QuantitySplitDto;
  periods: DashboardPeriodDto[];
  recentTransactions: RecentTransactionDto[];
}
export interface DistributionReportRowDto {
  date: string;
  mealPeriod: string;
  enabled: boolean;
  totalDistributed: number;
  vegDistributed: number;
  nonVegDistributed: number;
}
export interface RegistrantHistoryRowDto {
  registrantCode: Record<string, unknown>;
  fullName: string;
  type: 'TEAM' | 'STAFF';
  team: string;
  mealPreference: 'VEG' | 'NON_VEG';
  meals: MealHistoryItemDto[];
}
export interface QuantityReportRowDto {
  date: string;
  mealPeriod: string;
  plannedVeg: number;
  plannedNonVeg: number;
  actualVeg: number;
  actualNonVeg: number;
  actualTotal: number;
  remainingVeg: number;
  remainingNonVeg: number;
  remainingTotal: number;
}
export interface TeamDistributionReportRowDto {
  date: string;
  team: string;
  league: 'KSPL' | 'ISCL';
  eligibleMembers: number;
  mealsDistributed: number;
  /** Eligible members times enabled periods, minus meals already served. */
  pendingMealDistribution: number;
}
export interface StaffDistributionReportRowDto {
  date: string;
  eligibleStaff: number;
  mealsDistributed: number;
  pendingMeals: number;
}
export interface QuantitySplitDto {
  planned: number;
  served: number;
  /** Planned minus served. Negative means the preparation target was exceeded. Serving is not blocked. */
  remaining: number;
}
export interface DashboardPeriodDto {
  id: string;
  name: string;
  isEnabled: boolean;
  vegPlanned: number;
  nonVegPlanned: number;
  vegServed: number;
  nonVegServed: number;
  remaining: number;
}
export interface RecentTransactionDto {
  id: string;
  servedAt: string;
  registrantCode: Record<string, unknown>;
  fullName: string;
  mealPeriod: string;
  mealPreference: 'VEG' | 'NON_VEG';
  operator: string;
}
export interface MealHistoryItemDto {
  date: string;
  mealPeriod: string;
  mealPreference: 'VEG' | 'NON_VEG';
  servedAt: string;
}
export interface ApiErrorDto {
  code: string;
  message: string;
}
