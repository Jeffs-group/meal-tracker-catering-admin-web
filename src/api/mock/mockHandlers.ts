import {
  INITIAL_TEAMS,
  INITIAL_MEMBERS,
  INITIAL_STAFF,
  INITIAL_ORGANIZERS,
  INITIAL_AUDIT_LOGS,
  type RawTeam,
  type RawMember,
  type RawStaff,
  type RawOrganizer,
  type RawAuditEntry,
} from "./mockData";
import type {
  DashboardData,
  RecentRegistrationItem,
  TeamOverviewItem,
} from "@/types/dashboard.types";
import type {
  TeamRegistrationRow,
  StaffRegistrationRow,
  OrganizerRegistrationRow,
  RegistrantDetail,
  StaffStats,
} from "@/types/registration.types";
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
import { calculatePercentage } from "@/utils/formatPercent";
import type {
  ReportKey,
  ReportFilters,
  ExportFormat,
  ReportsHubSummary,
  RegistrationReportRow,
  RegistrationReportSummary,
  TeamReportRow,
  TeamReportSummary,
  StaffOrganizerReportRow,
  StaffOrganizerReportSummary,
  MealEligibilityReportRow,
  MealEligibilityReportSummary,
} from "@/types/reports.types";
import { formatRegistrantId } from "@/utils/formatRegistrantId";
import {
  getMealEligibilityReason,
  MEAL_REASON_META,
} from "@/utils/mealEligibility";
import { COMPLIANCE_THRESHOLD } from "@/constants/reports";

// Stateful in-memory stores
const teamsStore: RawTeam[] = [...INITIAL_TEAMS];
const membersStore: RawMember[] = [...INITIAL_MEMBERS];
const staffStore: RawStaff[] = [...INITIAL_STAFF];
const organizersStore: RawOrganizer[] = [...INITIAL_ORGANIZERS];
const auditLogsStore: RawAuditEntry[] = [...INITIAL_AUDIT_LOGS];

const simulateDelay = (ms = 350) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * 1. GET Dashboard Summary
 */
export async function mockGetDashboardSummary(): Promise<DashboardData> {
  await simulateDelay(350);

  // Compute all registrations across members + staff + organizers
  const allRegistrationsCount =
    membersStore.length + staffStore.length + organizersStore.length;

  const allApproved =
    membersStore.filter((m) => m.status === "APPROVED").length +
    staffStore.filter((s) => s.status === "APPROVED").length +
    organizersStore.filter((o) => o.status === "APPROVED").length;

  const allPending =
    membersStore.filter((m) => m.status === "PENDING").length +
    staffStore.filter((s) => s.status === "PENDING").length +
    organizersStore.filter((o) => o.status === "PENDING").length;

  const allRejected =
    membersStore.filter((m) => m.status === "REJECTED").length +
    staffStore.filter((s) => s.status === "REJECTED").length +
    organizersStore.filter((o) => o.status === "REJECTED").length;

  const activeTeamsCount = teamsStore.filter(
    (t) => t.status === "ACTIVE",
  ).length;
  const verifiedPercentage = calculatePercentage(
    activeTeamsCount,
    teamsStore.length,
  );

  // Donut chart percentages
  const approvedPercent = calculatePercentage(
    allApproved,
    allRegistrationsCount,
  );
  const pendingPercent = calculatePercentage(allPending, allRegistrationsCount);
  const rejectedPercent = calculatePercentage(
    allRejected,
    allRegistrationsCount,
  );

  // Breakdown metrics: tournament team quota (active teams vs league quota) & staff quota
  const tournamentTeamSlots = 24; // 12 KSPL + 12 ISCL league quota
  const activeTeamsQuota = activeTeamsCount > 0 ? activeTeamsCount : 18;
  const teamPercentage = calculatePercentage(
    activeTeamsQuota,
    tournamentTeamSlots,
  );
  const staffMaxCapTotal = 50; // Staff pool limit
  const staffRegistrationsCount = staffStore.length >= 20 ? staffStore.length : 38;
  const staffPercentage = calculatePercentage(
    staffRegistrationsCount,
    staffMaxCapTotal,
  );

  // Recent 5 registrations sorted by submitted date desc
  const allRecent: RecentRegistrationItem[] = [
    ...membersStore.map((m) => ({
      id: m.id,
      registrationId: m.registrationId,
      registrantName: m.fullName,
      avatarUrl: m.avatarUrl,
      registrantType: m.registrantType,
      teamName:
        teamsStore.find((t) => t.id === m.teamId)?.name || "Independent",
      memberType: m.memberType,
      submittedAt: m.submittedAt,
      status: m.status,
    })),
    ...staffStore.map((s) => ({
      id: s.id,
      registrationId: s.registrationId,
      registrantName: s.fullName,
      avatarUrl: s.avatarUrl,
      registrantType: "STAFF" as const,
      teamName: "ISCL Operations",
      memberType: "STAFF" as const,
      submittedAt: s.submittedAt,
      status: s.status,
    })),
    ...organizersStore.map((o) => ({
      id: o.id,
      registrationId: o.registrationId,
      registrantName: o.fullName,
      avatarUrl: o.avatarUrl,
      registrantType: "ORGANIZER" as const,
      teamName: o.organization,
      memberType: "ORGANIZER" as const,
      submittedAt: o.submittedAt,
      status: o.status,
    })),
  ]
    .sort(
      (a, b) =>
        new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
    )
    .slice(0, 5);

  // Team Overview Table
  const teamOverview: TeamOverviewItem[] = teamsStore.map((team) => {
    const teamMembers = membersStore.filter((m) => m.teamId === team.id);
    const approvedCount = teamMembers.filter(
      (m) => m.status === "APPROVED",
    ).length;
    const pendingCount = teamMembers.filter(
      (m) => m.status === "PENDING",
    ).length;
    const rejectedCount = teamMembers.filter(
      (m) => m.status === "REJECTED",
    ).length;

    return {
      id: team.id,
      teamId: team.id,
      name: team.name,
      code: team.code,
      league: team.league,
      totalRegistrations: teamMembers.length,
      approvedCount,
      pendingCount,
      rejectedCount,
      status: team.status,
    };
  });

  return {
    stats: {
      totalRegistrations: {
        count: allRegistrationsCount,
        trendPercentage: 12.4,
        isPositive: true,
      },
      pendingApprovals: {
        count: allPending,
        requiresActionText: "Requires Action",
      },
      approvedRegistrations: {
        count: allApproved,
        ratioPercentage: approvedPercent,
      },
      activeTeams: {
        count: activeTeamsCount,
        totalTeams: teamsStore.length,
        verifiedPercentage,
      },
    },
    overview: {
      approved: allApproved,
      approvedPercent,
      pending: allPending,
      pendingPercent,
      rejected: allRejected,
      rejectedPercent,
      total: allRegistrationsCount,
    },
    breakdown: {
      teamRegistrations: activeTeamsQuota,
      teamMaxCap: tournamentTeamSlots,
      teamPercentage,
      staffRegistrations: staffRegistrationsCount,
      staffMaxCap: staffMaxCapTotal,
      staffPercentage,
      dailyIntakeAvg: 14.8,
      verificationRate: approvedPercent,
    },
    recentRegistrations: allRecent,
    teamOverview,
  };
}

/**
 * 2. GET Teams list with computed counts
 */
export async function mockGetTeams(
  params: TableQueryParams = {},
): Promise<PaginatedResult<TeamRegistrationRow>> {
  await simulateDelay(350);

  const {
    search = "",
    league = "",
    status = "",
    page = 1,
    pageSize = 10,
  } = params;

  let filtered = teamsStore.map((team) => {
    const teamMembers = membersStore.filter((m) => m.teamId === team.id);
    return {
      id: team.id,
      teamId: team.id,
      name: team.name,
      code: team.code,
      league: team.league,
      totalRegistrations: teamMembers.length,
      approvedCount: teamMembers.filter((m) => m.status === "APPROVED").length,
      pendingCount: teamMembers.filter((m) => m.status === "PENDING").length,
      rejectedCount: teamMembers.filter((m) => m.status === "REJECTED").length,
      status: team.status,
    };
  });

  if (search.trim()) {
    const q = search.toLowerCase().trim();
    filtered = filtered.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.code.toLowerCase().includes(q) ||
        t.league.toLowerCase().includes(q),
    );
  }

  if (league) {
    filtered = filtered.filter((t) => t.league === league);
  }

  if (status) {
    filtered = filtered.filter((t) => t.status === status);
  }

  const total = filtered.length;
  const totalPages = Math.ceil(total / pageSize) || 1;
  const start = (page - 1) * pageSize;
  const data = filtered.slice(start, start + pageSize);

  return {
    data,
    pagination: {
      page,
      pageSize,
      total,
      totalPages,
    },
  };
}

/**
 * 3. GET Staff list
 */
export async function mockGetStaffs(params: TableQueryParams = {}): Promise<{
  result: PaginatedResult<StaffRegistrationRow>;
  stats: StaffStats;
}> {
  await simulateDelay(350);

  const {
    search = "",
    status = "",
    role = "",
    page = 1,
    pageSize = 10,
  } = params;

  // Compute overall staff stats
  const total = staffStore.length;
  const approved = staffStore.filter((s) => s.status === "APPROVED").length;
  const pending = staffStore.filter((s) => s.status === "PENDING").length;
  const rejected = staffStore.filter((s) => s.status === "REJECTED").length;

  const stats: StaffStats = {
    total,
    approvedMealEligible: approved,
    pending,
    rejected,
    approvedPercent: calculatePercentage(approved, total),
    pendingPercent: calculatePercentage(pending, total),
    rejectedPercent: calculatePercentage(rejected, total),
  };

  let filtered = staffStore.map((s) => ({
    id: s.id,
    registrationId: s.registrationId,
    name: s.fullName,
    avatarUrl: s.avatarUrl,
    role: s.role,
    department: s.department,
    contact: s.contactNumber,
    email: s.emailAddress,
    submittedAt: s.submittedAt,
    status: s.status,
    // Business rule: meal eligible only if approved
    mealEligible: s.status === "APPROVED" && s.mealEligible,
  }));

  if (search.trim()) {
    const q = search.toLowerCase().trim();
    filtered = filtered.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.registrationId.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.contact.toLowerCase().includes(q),
    );
  }

  if (status) {
    filtered = filtered.filter((s) => s.status === status);
  }

  if (role) {
    filtered = filtered.filter(
      (s) =>
        s.role.toLowerCase().includes(role.toLowerCase()) ||
        s.department.toLowerCase().includes(role.toLowerCase()),
    );
  }

  const filteredTotal = filtered.length;
  const totalPages = Math.ceil(filteredTotal / pageSize) || 1;
  const start = (page - 1) * pageSize;
  const data = filtered.slice(start, start + pageSize);

  return {
    result: {
      data,
      pagination: {
        page,
        pageSize,
        total: filteredTotal,
        totalPages,
      },
    },
    stats,
  };
}

/**
 * 4. GET Organizers list
 */
export async function mockGetOrganizers(
  params: TableQueryParams = {},
): Promise<{
  result: PaginatedResult<OrganizerRegistrationRow>;
  stats: StaffStats;
}> {
  await simulateDelay(350);

  const {
    search = "",
    status = "",
    role = "",
    page = 1,
    pageSize = 10,
  } = params;

  const total = organizersStore.length;
  const approved = organizersStore.filter(
    (o) => o.status === "APPROVED",
  ).length;
  const pending = organizersStore.filter((o) => o.status === "PENDING").length;
  const rejected = organizersStore.filter(
    (o) => o.status === "REJECTED",
  ).length;

  const stats: StaffStats = {
    total,
    approvedMealEligible: approved,
    pending,
    rejected,
    approvedPercent: calculatePercentage(approved, total),
    pendingPercent: calculatePercentage(pending, total),
    rejectedPercent: calculatePercentage(rejected, total),
  };

  let filtered = organizersStore.map((o) => ({
    id: o.id,
    registrationId: o.registrationId,
    name: o.fullName,
    avatarUrl: o.avatarUrl,
    role: o.role,
    organization: o.organization,
    contact: o.contactNumber,
    email: o.emailAddress,
    submittedAt: o.submittedAt,
    status: o.status,
    mealEligible: o.status === "APPROVED" && o.mealEligible,
  }));

  if (search.trim()) {
    const q = search.toLowerCase().trim();
    filtered = filtered.filter(
      (o) =>
        o.name.toLowerCase().includes(q) ||
        o.registrationId.toLowerCase().includes(q) ||
        o.email.toLowerCase().includes(q) ||
        o.contact.toLowerCase().includes(q),
    );
  }

  if (status) {
    filtered = filtered.filter((o) => o.status === status);
  }

  if (role) {
    filtered = filtered.filter(
      (o) =>
        o.role.toLowerCase().includes(role.toLowerCase()) ||
        o.organization.toLowerCase().includes(role.toLowerCase()),
    );
  }

  const filteredTotal = filtered.length;
  const totalPages = Math.ceil(filteredTotal / pageSize) || 1;
  const start = (page - 1) * pageSize;
  const data = filtered.slice(start, start + pageSize);

  return {
    result: {
      data,
      pagination: {
        page,
        pageSize,
        total: filteredTotal,
        totalPages,
      },
    },
    stats,
  };
}

/**
 * 5. GET Team Detail
 */
export async function mockGetTeamDetail(teamId: string): Promise<TeamDetail> {
  await simulateDelay(300);

  const team = teamsStore.find((t) => t.id === teamId) || teamsStore[0]!;
  const members = membersStore.filter((m) => m.teamId === team.id);

  const total = members.length;
  const approved = members.filter((m) => m.status === "APPROVED").length;
  const pending = members.filter((m) => m.status === "PENDING").length;
  const rejected = members.filter((m) => m.status === "REJECTED").length;

  return {
    id: team.id,
    name: team.name,
    code: team.code,
    teamCode: team.teamCode,
    league: team.league,
    franchiseId: team.franchiseId,
    status: team.status,
    licensed: team.licensed,
    updatedAt: team.updatedAt,
    updatedBy: team.updatedBy,
    stats: {
      total,
      maxCap: team.maxCap,
      approved,
      approvedPercentage: calculatePercentage(approved, total),
      pending,
      rejected,
      rejectedPercentage: calculatePercentage(rejected, total),
    },
    memberCountsByType: {
      ALL: total,
      PLAYER: members.filter((m) => m.memberType === "PLAYER").length,
      OWNER: members.filter((m) => m.memberType === "OWNER").length,
      COACH: members.filter((m) => m.memberType === "COACH").length,
      OTHERS: members.filter((m) => m.memberType === "OTHERS").length,
    },
  };
}

/**
 * 6. GET Team Members list
 */
export async function mockGetTeamMembers(
  teamId: string,
  params: TableQueryParams = {},
): Promise<PaginatedResult<TeamMemberRow>> {
  await simulateDelay(350);

  const team = teamsStore.find((t) => t.id === teamId);
  const teamIsActive = team?.status === "ACTIVE";

  const {
    search = "",
    status = "",
    memberType = "ALL",
    sortBy = "submittedAt",
    sortOrder = "desc",
    page = 1,
    pageSize = 10,
  } = params;

  let members = membersStore.filter((m) => m.teamId === teamId);

  // Filter by member type tab
  if (memberType && memberType !== "ALL") {
    members = members.filter((m) => m.memberType === memberType);
  }

  // Filter by search
  if (search.trim()) {
    const q = search.toLowerCase().trim();
    members = members.filter(
      (m) =>
        m.fullName.toLowerCase().includes(q) ||
        m.registrationId.toLowerCase().includes(q) ||
        m.emailAddress.toLowerCase().includes(q) ||
        m.contactNumber.toLowerCase().includes(q),
    );
  }

  // Filter by status
  if (status) {
    members = members.filter((m) => m.status === status);
  }

  // Sorting
  if (sortBy === "submittedAt") {
    members.sort((a, b) => {
      const diff =
        new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
      return sortOrder === "asc" ? -diff : diff;
    });
  } else if (sortBy === "name") {
    members.sort((a, b) =>
      sortOrder === "asc"
        ? a.fullName.localeCompare(b.fullName)
        : b.fullName.localeCompare(a.fullName),
    );
  }

  const total = members.length;
  const totalPages = Math.ceil(total / pageSize) || 1;
  const start = (page - 1) * pageSize;
  const paginatedMembers = members.slice(start, start + pageSize);

  const data: TeamMemberRow[] = paginatedMembers.map((m) => ({
    id: m.id,
    registrationId: m.registrationId,
    name: m.fullName,
    avatarUrl: m.avatarUrl,
    memberType: m.memberType,
    contact: m.contactNumber,
    email: m.emailAddress,
    submittedAt: m.submittedAt,
    status: m.status,
    // BUSINESS RULE: Meal eligibility = registrant Approved AND team Active
    mealEligible: teamIsActive && m.status === "APPROVED",
  }));

  return {
    data,
    pagination: {
      page,
      pageSize,
      total,
      totalPages,
    },
  };
}

/**
 * 7. GET Registrant Detail (for Review Modal)
 */
export async function mockGetRegistrantDetail(
  id: string,
): Promise<RegistrantDetail> {
  await simulateDelay(300);

  // Check in members
  const member = membersStore.find(
    (m) => m.id === id || m.registrationId === id,
  );
  if (member) {
    const team = teamsStore.find((t) => t.id === member.teamId);
    const regNum = member.registrationId.replace(/[^0-9]/g, "") || "099";
    const appId =
      member.id === "mem-101"
        ? "#REG-CK-099"
        : member.id === "mem-105"
          ? "#REG-CK-097"
          : `#REG-CK-${regNum}`;
    const regId = member.registrationId.startsWith("CK-")
      ? member.registrationId
      : `CK-2026-${regNum.padStart(3, "0")}`;

    const defaultPasscode = "VCD-8842-ISCL";
    const passcode = member.verificationPasscode || defaultPasscode;

    const accreditation = {
      registrantId: regId,
      verificationPasscode: passcode,
      sentTime: member.passcodeSentTime || "Today 14:31 IST",
      qrValue: `${regId}|${passcode}`,
      isActive: member.status === "APPROVED",
    };

    const rejectionInfo =
      member.status === "REJECTED"
        ? {
            primaryCategory:
              member.rejectionCategory ||
              "Incompatible / Blurry Photo Identification",
            adminRemarks:
              member.adminRemarks ||
              member.rejectionReason ||
              "Uploaded portrait does not comply with official accreditation criteria (photo resolution < 600px and face partially obscured). Government ID name does not match submitted name.",
          }
        : undefined;

    return {
      id: member.id,
      applicationId: appId,
      registrantId: regId,
      fullName: member.fullName,
      roleTitle: member.roleTitle,
      registrantType: member.registrantType,
      teamName: team?.name || "Chennai Kings",
      teamId: team?.id,
      teamStatus: team?.status,
      status: member.status,
      rejectionReason: member.rejectionReason,
      rejectionInfo,
      submittedAt: member.submittedAt,
      verifiedAt:
        member.verifiedAt ||
        (member.status === "APPROVED" ? "03 Nov 2026, 14:30 IST" : undefined),
      verifiedBy:
        member.verifiedBy ||
        (member.status === "APPROVED" ? "Alex Morgan" : undefined),
      mealCodeGenerated: member.mealCodeGenerated,
      photo: member.photo,
      attributes: {
        franchiseAndDivision: member.division,
        registrantTypeLabel:
          member.memberType === "PLAYER"
            ? "Player"
            : `Team Member (${member.memberType})`,
        contactNumber: member.contactNumber,
        emailAddress: member.emailAddress,
        mealPreference: member.mealPreference,
        dateOfBirth: member.dateOfBirth,
      },
      accreditation,
    };
  }

  // Check in staff
  const staff = staffStore.find((s) => s.id === id || s.registrationId === id);
  if (staff) {
    const regNum = staff.registrationId.replace(/[^0-9]/g, "") || "101";
    const regId = `STF-2026-${regNum.padStart(3, "0")}`;
    const passcode = "VCD-8842-ISCL";
    return {
      id: staff.id,
      applicationId: `#REG-STF-${regNum}`,
      registrantId: regId,
      fullName: staff.fullName,
      roleTitle: staff.role,
      registrantType: "STAFF",
      teamName: "ISCL Operations Staff",
      teamStatus: "ACTIVE",
      status: staff.status,
      rejectionReason: staff.rejectionReason,
      rejectionInfo:
        staff.status === "REJECTED"
          ? {
              primaryCategory: "Incompatible / Blurry Photo Identification",
              adminRemarks:
                staff.rejectionReason ||
                "Application rejected during administrative verification.",
            }
          : undefined,
      submittedAt: staff.submittedAt,
      verifiedAt:
        staff.status === "APPROVED" ? "03 Nov 2026, 14:30 IST" : undefined,
      verifiedBy: staff.status === "APPROVED" ? "Alex Morgan" : undefined,
      photo: staff.photo,
      attributes: {
        franchiseAndDivision: `Staff / ${staff.department}`,
        registrantTypeLabel: "Operational Staff",
        contactNumber: staff.contactNumber,
        emailAddress: staff.emailAddress,
        mealPreference: staff.mealPreference,
        dateOfBirth: staff.dateOfBirth,
      },
      accreditation: {
        registrantId: regId,
        verificationPasscode: passcode,
        sentTime: "Today 14:31 IST",
        qrValue: `${regId}|${passcode}`,
        isActive: staff.status === "APPROVED",
      },
    };
  }

  // Check in organizers
  const organizer = organizersStore.find(
    (o) => o.id === id || o.registrationId === id,
  );
  if (organizer) {
    const regNum = organizer.registrationId.replace(/[^0-9]/g, "") || "201";
    const regId = `ORG-2026-${regNum.padStart(3, "0")}`;
    const passcode = "VCD-8842-ISCL";
    return {
      id: organizer.id,
      applicationId: `#REG-ORG-${regNum}`,
      registrantId: regId,
      fullName: organizer.fullName,
      roleTitle: organizer.role,
      registrantType: "ORGANIZER",
      teamName: organizer.organization,
      teamStatus: "ACTIVE",
      status: organizer.status,
      rejectionReason: organizer.rejectionReason,
      rejectionInfo:
        organizer.status === "REJECTED"
          ? {
              primaryCategory: "Incompatible / Blurry Photo Identification",
              adminRemarks:
                organizer.rejectionReason ||
                "Application rejected during administrative verification.",
            }
          : undefined,
      submittedAt: organizer.submittedAt,
      verifiedAt:
        organizer.status === "APPROVED" ? "03 Nov 2026, 14:30 IST" : undefined,
      verifiedBy: organizer.status === "APPROVED" ? "Alex Morgan" : undefined,
      photo: organizer.photo,
      attributes: {
        franchiseAndDivision: `Organizing Committee / ${organizer.organization}`,
        registrantTypeLabel: "Event Organizer",
        contactNumber: organizer.contactNumber,
        emailAddress: organizer.emailAddress,
        mealPreference: organizer.mealPreference,
        dateOfBirth: organizer.dateOfBirth,
      },
      accreditation: {
        registrantId: regId,
        verificationPasscode: passcode,
        sentTime: "Today 14:31 IST",
        qrValue: `${regId}|${passcode}`,
        isActive: organizer.status === "APPROVED",
      },
    };
  }

  // Fallback
  const defaultMember = membersStore[0]!;
  return mockGetRegistrantDetail(defaultMember.id);
}

/**
 * 8. APPROVE Registrant Mutation
 */
export async function mockApproveRegistrant(
  id: string,
): Promise<RegistrantDetail> {
  await simulateDelay(400);

  const member = membersStore.find(
    (m) => m.id === id || m.registrationId === id,
  );
  if (member) {
    member.status = "APPROVED";
    member.rejectionReason = undefined;
    member.mealCodeGenerated = `MEAL-QR-${member.registrationId}-${Math.floor(1000 + Math.random() * 9000)}`;
    return mockGetRegistrantDetail(member.id);
  }

  const staff = staffStore.find((s) => s.id === id || s.registrationId === id);
  if (staff) {
    staff.status = "APPROVED";
    staff.rejectionReason = undefined;
    staff.mealEligible = true;
    return mockGetRegistrantDetail(staff.id);
  }

  const organizer = organizersStore.find(
    (o) => o.id === id || o.registrationId === id,
  );
  if (organizer) {
    organizer.status = "APPROVED";
    organizer.rejectionReason = undefined;
    organizer.mealEligible = true;
    return mockGetRegistrantDetail(organizer.id);
  }

  throw new Error(`Registrant with id ${id} not found.`);
}

/**
 * 9. REJECT Registrant Mutation
 */
export async function mockRejectRegistrant(
  id: string,
  reason: string,
): Promise<RegistrantDetail> {
  await simulateDelay(400);

  const member = membersStore.find(
    (m) => m.id === id || m.registrationId === id,
  );
  if (member) {
    member.status = "REJECTED";
    member.rejectionReason =
      reason || "Application rejected during administrative verification.";
    member.mealCodeGenerated = undefined;
    return mockGetRegistrantDetail(member.id);
  }

  const staff = staffStore.find((s) => s.id === id || s.registrationId === id);
  if (staff) {
    staff.status = "REJECTED";
    staff.rejectionReason = reason;
    staff.mealEligible = false;
    return mockGetRegistrantDetail(staff.id);
  }

  const organizer = organizersStore.find(
    (o) => o.id === id || o.registrationId === id,
  );
  if (organizer) {
    organizer.status = "REJECTED";
    organizer.rejectionReason = reason;
    organizer.mealEligible = false;
    return mockGetRegistrantDetail(organizer.id);
  }

  throw new Error(`Registrant with id ${id} not found.`);
}

/**
 * 10. TOGGLE Team Active/Inactive Mutation
 */
export async function mockToggleTeamStatus(teamId: string): Promise<RawTeam> {
  await simulateDelay(350);

  const team = teamsStore.find((t) => t.id === teamId);
  if (!team) throw new Error(`Team ${teamId} not found`);

  team.status = team.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
  return { ...team };
}

/**
 * 11. TOGGLE Staff/Organizer Meal Eligibility
 */
export async function mockToggleMealEligibility(id: string): Promise<boolean> {
  await simulateDelay(250);

  const staff = staffStore.find((s) => s.id === id || s.registrationId === id);
  if (staff) {
    if (staff.status !== "APPROVED") {
      throw new Error("Cannot enable meal eligibility for unapproved staff.");
    }
    staff.mealEligible = !staff.mealEligible;
    return staff.mealEligible;
  }

  const organizer = organizersStore.find(
    (o) => o.id === id || o.registrationId === id,
  );
  if (organizer) {
    if (organizer.status !== "APPROVED") {
      throw new Error(
        "Cannot enable meal eligibility for unapproved organizer.",
      );
    }
    organizer.mealEligible = !organizer.mealEligible;
    return organizer.mealEligible;
  }

  throw new Error(`Item ${id} not found.`);
}

/**
 * 12. REVOKE Approval / Deactivate Pass Mutation
 */
export async function mockRevokeApproval(
  id: string,
  reason: string = "Pass revoked by administrative override.",
): Promise<RegistrantDetail> {
  await simulateDelay(350);

  const member = membersStore.find(
    (m) => m.id === id || m.registrationId === id,
  );
  if (member) {
    member.status = "REJECTED";
    member.rejectionCategory = "Administrative Override / Deactivated";
    member.adminRemarks = reason;
    member.rejectionReason = reason;
    member.mealCodeGenerated = undefined;
    return mockGetRegistrantDetail(member.id);
  }

  const staff = staffStore.find((s) => s.id === id || s.registrationId === id);
  if (staff) {
    staff.status = "REJECTED";
    staff.rejectionReason = reason;
    staff.mealEligible = false;
    return mockGetRegistrantDetail(staff.id);
  }

  const organizer = organizersStore.find(
    (o) => o.id === id || o.registrationId === id,
  );
  if (organizer) {
    organizer.status = "REJECTED";
    organizer.rejectionReason = reason;
    organizer.mealEligible = false;
    return mockGetRegistrantDetail(organizer.id);
  }

  throw new Error(`Registrant with id ${id} not found.`);
}

/**
 * 13. RE-OPEN & Re-Verify Registrant Mutation
 */
export async function mockReopenVerification(
  id: string,
): Promise<RegistrantDetail> {
  await simulateDelay(350);

  const member = membersStore.find(
    (m) => m.id === id || m.registrationId === id,
  );
  if (member) {
    member.status = "PENDING";
    member.rejectionCategory = undefined;
    member.adminRemarks = undefined;
    member.rejectionReason = undefined;
    return mockGetRegistrantDetail(member.id);
  }

  const staff = staffStore.find((s) => s.id === id || s.registrationId === id);
  if (staff) {
    staff.status = "PENDING";
    staff.rejectionReason = undefined;
    return mockGetRegistrantDetail(staff.id);
  }

  const organizer = organizersStore.find(
    (o) => o.id === id || o.registrationId === id,
  );
  if (organizer) {
    organizer.status = "PENDING";
    organizer.rejectionReason = undefined;
    return mockGetRegistrantDetail(organizer.id);
  }

  throw new Error(`Registrant with id ${id} not found.`);
}

/**
 * 14. RESEND Passcode & Accreditation Email
 */
export async function mockResendPasscode(
  id: string,
): Promise<{ success: boolean; message: string }> {
  await simulateDelay(300);
  return {
    success: true,
    message: `Digital accreditation badge and meal token passcode resent successfully to registrant ${id}.`,
  };
}

// Helper: Initials for team tile (e.g. "Chennai Kings" -> "CK")
function getTeamInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2 && parts[0] && parts[1]) {
    return (parts[0][0]! + parts[1][0]!).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function mapRawToTeam(t: RawTeam): Team {
  return {
    id: t.id,
    teamCode: t.teamCode,
    name: t.name,
    league: t.league,
    status: t.status,
    licensed: t.licensed,
    registrationsTotal: t.registrationsTotal,
    approvedCount: t.approvedCount,
    pendingCount: t.pendingCount,
    rejectedCount: t.rejectedCount,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
    updatedBy: t.updatedBy,
    initials: getTeamInitials(t.name),
  };
}

/**
 * 15. MANAGE TEAMS - List, Search, Filter, Sort, Paginate & Stats
 */
export async function mockGetManageTeams(
  params: TeamListParams = {},
): Promise<TeamListResponse> {
  await simulateDelay(350);

  const {
    page = 1,
    pageSize = 6,
    search = "",
    league = "ALL",
    status = "ALL",
    sort = "name_asc",
  } = params;

  let filtered = [...teamsStore];

  // Search by team name or canonical code
  if (search.trim()) {
    const q = search.trim().toLowerCase();
    filtered = filtered.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.teamCode.toLowerCase().includes(q) ||
        t.code.toLowerCase().includes(q),
    );
  }

  // Filter by League (KSPL / ISCL)
  if (league && league !== "ALL") {
    filtered = filtered.filter((t) => t.league === league);
  }

  // Filter by Status (ACTIVE / INACTIVE)
  if (status && status !== "ALL") {
    filtered = filtered.filter((t) => t.status === status);
  }

  // Sort
  filtered.sort((a, b) => {
    switch (sort) {
      case "name_desc":
        return b.name.localeCompare(a.name);
      case "registrants_desc":
        return b.registrationsTotal - a.registrationsTotal;
      case "approved_desc":
        return b.approvedCount - a.approvedCount;
      case "updated_desc":
        return (
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      case "name_asc":
      default:
        return a.name.localeCompare(b.name);
    }
  });

  const total = filtered.length;
  const start = (page - 1) * pageSize;
  const paginated = filtered.slice(start, start + pageSize);

  // Compute live stats across all teams in teamsStore
  const stats = {
    total: teamsStore.length,
    kspl: teamsStore.filter((t) => t.league === "KSPL").length,
    iscl: teamsStore.filter((t) => t.league === "ISCL").length,
    active: teamsStore.filter((t) => t.status === "ACTIVE").length,
    inactive: teamsStore.filter((t) => t.status === "INACTIVE").length,
  };

  return {
    items: paginated.map(mapRawToTeam),
    total,
    stats,
  };
}

/**
 * 16. CREATE Team Mutation
 */
export async function mockCreateTeam(
  payload: CreateTeamPayload,
): Promise<Team> {
  await simulateDelay(400);

  const trimmedName = payload.name.trim();

  // Validate uniqueness case-insensitively within target league
  const exists = teamsStore.some(
    (t) =>
      t.league === payload.league &&
      t.name.toLowerCase() === trimmedName.toLowerCase(),
  );

  if (exists) {
    throw new Error(
      `A team with this name already exists in ${payload.league}.`,
    );
  }

  // Generate canonical ID: TM-<LEAGUE>-###
  const leagueCount =
    teamsStore.filter((t) => t.league === payload.league).length + 1;
  const teamCode = `TM-${payload.league}-${String(leagueCount).padStart(3, "0")}`;
  const slug = trimmedName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const id = `${slug}-${Date.now().toString().slice(-4)}`;

  const initials = getTeamInitials(trimmedName);
  const now = new Date();
  const dateStr = `${now.getDate()} ${now.toLocaleString("default", { month: "short" })} ${now.getFullYear()}`;

  const newTeam: RawTeam = {
    id,
    name: trimmedName,
    code: initials,
    teamCode,
    league: payload.league,
    franchiseId: `FRAN-${payload.league}-${initials}-${now.getFullYear()}`,
    status: "ACTIVE",
    licensed: true,
    maxCap: 30,
    registrationsTotal: 0,
    approvedCount: 0,
    pendingCount: 0,
    rejectedCount: 0,
    createdAt: now.toISOString(),
    updatedAt: `${dateStr} by Alex Morgan`,
    updatedBy: "Alex Morgan",
  };

  teamsStore.unshift(newTeam);

  auditLogsStore.unshift({
    id: `audit-${Date.now()}`,
    entityType: "TEAM",
    entityId: newTeam.id,
    action: "team_created",
    actor: "Alex Morgan",
    timestamp: now.toISOString(),
  });

  return mapRawToTeam(newTeam);
}

/**
 * 17. UPDATE Team Mutation
 */
export async function mockUpdateTeam(
  teamId: string,
  payload: UpdateTeamPayload,
): Promise<Team> {
  await simulateDelay(400);

  const team = teamsStore.find((t) => t.id === teamId);
  if (!team) {
    throw new Error(`Team with ID ${teamId} not found.`);
  }

  const trimmedName = payload.name.trim();

  // Validate uniqueness if name or league changed
  const exists = teamsStore.some(
    (t) =>
      t.id !== teamId &&
      t.league === payload.league &&
      t.name.toLowerCase() === trimmedName.toLowerCase(),
  );

  if (exists) {
    throw new Error(
      `A team with this name already exists in ${payload.league}.`,
    );
  }

  // NOTE: Team ID and teamCode are IMMUTABLE once created, even if the league changes!
  team.name = trimmedName;
  team.league = payload.league;
  team.code = getTeamInitials(trimmedName);

  const now = new Date();
  const dateStr = `${now.getDate()} ${now.toLocaleString("default", { month: "short" })} ${now.getFullYear()}`;
  team.updatedAt = `${dateStr} by Alex Morgan`;
  team.updatedBy = "Alex Morgan";

  auditLogsStore.unshift({
    id: `audit-${Date.now()}`,
    entityType: "TEAM",
    entityId: team.id,
    action: "team_updated",
    actor: "Alex Morgan",
    timestamp: now.toISOString(),
  });

  return mapRawToTeam(team);
}

/**
 * 18. DEACTIVATE Team Mutation
 */
export async function mockDeactivateTeam(
  teamId: string,
  payload: DeactivateTeamPayload,
): Promise<Team> {
  await simulateDelay(400);

  const team = teamsStore.find((t) => t.id === teamId);
  if (!team) {
    throw new Error(`Team with ID ${teamId} not found.`);
  }

  team.status = "INACTIVE";

  const now = new Date();
  const dateStr = `${now.getDate()} ${now.toLocaleString("default", { month: "short" })} ${now.getFullYear()}`;
  team.updatedAt = `${dateStr} by Alex Morgan`;
  team.updatedBy = "Alex Morgan";

  auditLogsStore.unshift({
    id: `audit-${Date.now()}`,
    entityType: "TEAM",
    entityId: team.id,
    action: "team_deactivated",
    actor: "Alex Morgan",
    reason: payload.reason,
    notes: payload.notes,
    timestamp: now.toISOString(),
  });

  return mapRawToTeam(team);
}

/**
 * 19. REACTIVATE Team Mutation
 */
export async function mockReactivateTeam(
  teamId: string,
  payload: ReactivateTeamPayload,
): Promise<Team> {
  await simulateDelay(400);

  const team = teamsStore.find((t) => t.id === teamId);
  if (!team) {
    throw new Error(`Team with ID ${teamId} not found.`);
  }

  team.status = "ACTIVE";

  const now = new Date();
  const dateStr = `${now.getDate()} ${now.toLocaleString("default", { month: "short" })} ${now.getFullYear()}`;
  team.updatedAt = `${dateStr} by Alex Morgan`;
  team.updatedBy = "Alex Morgan";

  auditLogsStore.unshift({
    id: `audit-${Date.now()}`,
    entityType: "TEAM",
    entityId: team.id,
    action: "team_reactivated",
    actor: "Alex Morgan",
    notes: payload.notes,
    timestamp: now.toISOString(),
  });

  return mapRawToTeam(team);
}

// ============================================================================
// REPORTS MODULE MOCK HANDLERS
// ============================================================================

/**
 * 20. GET Reports & Analytics Hub Summary
 */
export async function mockGetReportsHubSummary(): Promise<ReportsHubSummary> {
  await simulateDelay(300);

  const totalRegistrations =
    membersStore.length + staffStore.length + organizersStore.length;

  const ksplTeams = teamsStore.filter((t) => t.league === "KSPL");
  const isclTeams = teamsStore.filter((t) => t.league === "ISCL");
  const activeTeams = teamsStore.filter((t) => t.status === "ACTIVE");
  const inactiveTeams = teamsStore.filter((t) => t.status === "INACTIVE");

  const totalStaffOrg = staffStore.length + organizersStore.length;
  const approvedStaffOrg =
    staffStore.filter((s) => s.status === "APPROVED").length +
    organizersStore.filter((o) => o.status === "APPROVED").length;

  // Meal eligible count derived strictly via getMealEligibilityReason
  let eligibleCount = 0;

  membersStore.forEach((m) => {
    const team = teamsStore.find((t) => t.id === m.teamId);
    if (
      getMealEligibilityReason({
        status: m.status,
        teamStatus: team?.status,
        hasTeam: true,
      }) === "eligible"
    ) {
      eligibleCount++;
    }
  });

  staffStore.forEach((s) => {
    if (
      getMealEligibilityReason({
        status: s.status,
        hasTeam: false,
        mealEligibleToggle: s.mealEligible,
      }) === "eligible"
    ) {
      eligibleCount++;
    }
  });

  organizersStore.forEach((o) => {
    if (
      getMealEligibilityReason({
        status: o.status,
        hasTeam: false,
        mealEligibleToggle: o.mealEligible,
      }) === "eligible"
    ) {
      eligibleCount++;
    }
  });

  return {
    totalRegistrations,
    changePct: 8.4,
    teams: {
      total: teamsStore.length,
      kspl: ksplTeams.length,
      iscl: isclTeams.length,
      active: activeTeams.length,
      inactive: inactiveTeams.length,
    },
    staffOrganizers: {
      total: totalStaffOrg,
      approvedPct: calculatePercentage(approvedStaffOrg, totalStaffOrg),
    },
    mealEligible: {
      count: eligibleCount,
      gateSyncedAt: new Date().toISOString(),
      isDelayed: false,
    },
    generatedAt: new Date().toISOString(),
  };
}

// Helper: Filter unified candidate registrations
function getFilteredCandidateRegistrations(filters: ReportFilters = {}) {
  const {
    search = "",
    from,
    to,
    league,
    teamId,
    type,
    memberRole,
    status,
  } = filters;

  const rows: RegistrationReportRow[] = [
    ...membersStore.map((m) => {
      const team = teamsStore.find((t) => t.id === m.teamId);
      return {
        id: m.id,
        registrantId: m.registrationId,
        formattedId: formatRegistrantId(m.registrationId),
        name: m.fullName,
        avatarUrl: m.avatarUrl,
        designation: m.designation,
        isVip: m.isVip,
        type: "TEAM" as const,
        teamId: m.teamId,
        teamName: team?.name || "Independent",
        league: team?.league,
        role: m.roleTitle,
        phone: m.contactNumber,
        email: m.emailAddress,
        submittedAt: m.submittedAt,
        status: m.status,
      };
    }),
    ...staffStore.map((s) => ({
      id: s.id,
      registrantId: s.registrationId,
      formattedId: formatRegistrantId(s.registrationId),
      name: s.fullName,
      avatarUrl: s.avatarUrl,
      designation: s.designation,
      isVip: s.isVip,
      type: "STAFF" as const,
      teamId: undefined,
      teamName: "—",
      league: undefined,
      role: s.role,
      phone: s.contactNumber,
      email: s.emailAddress,
      submittedAt: s.submittedAt,
      status: s.status,
    })),
    ...organizersStore.map((o) => ({
      id: o.id,
      registrantId: o.registrationId,
      formattedId: formatRegistrantId(o.registrationId),
      name: o.fullName,
      avatarUrl: o.avatarUrl,
      designation: o.designation,
      isVip: o.isVip,
      type: "ORGANIZER" as const,
      teamId: undefined,
      teamName: "—",
      league: undefined,
      role: o.role,
      phone: o.contactNumber,
      email: o.emailAddress,
      submittedAt: o.submittedAt,
      status: o.status,
    })),
  ];

  return rows.filter((r) => {
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      const match =
        r.name.toLowerCase().includes(q) ||
        r.registrantId.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.phone.toLowerCase().includes(q) ||
        r.teamName.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (type && type !== "ALL" && r.type !== type) return false;
    if (league && league !== "ALL" && r.league !== league) return false;
    if (teamId && teamId !== "ALL" && r.teamId !== teamId) return false;
    if (memberRole && memberRole !== "ALL" && !r.role.toLowerCase().includes(memberRole.toLowerCase())) return false;
    if (status && status !== "ALL" && r.status !== status) return false;
    if (from && new Date(r.submittedAt) < new Date(`${from}T00:00:00`)) return false;
    if (to && new Date(r.submittedAt) > new Date(`${to}T23:59:59`)) return false;
    return true;
  });
}

/**
 * 21. GET Registration Report Summary
 */
export async function mockGetRegistrationReportSummary(
  filters: ReportFilters = {},
): Promise<RegistrationReportSummary> {
  await simulateDelay(250);
  const filtered = getFilteredCandidateRegistrations(filters);

  const totalSubmissions = filtered.length;
  const approvedCount = filtered.filter((r) => r.status === "APPROVED").length;
  const pendingCount = filtered.filter((r) => r.status === "PENDING").length;
  const rejectedCount = filtered.filter((r) => r.status === "REJECTED").length;

  return {
    totalSubmissions,
    periodChangePct: 12.5,
    approvedCount,
    approvedPct: calculatePercentage(approvedCount, totalSubmissions),
    pendingCount,
    rejectedCount,
    unresolvedPct: calculatePercentage(pendingCount + rejectedCount, totalSubmissions),
    generatedAt: new Date().toISOString(),
  };
}

/**
 * 22. GET Registration Report Rows
 */
export async function mockGetRegistrationReportRows(
  filters: ReportFilters = {},
): Promise<PaginatedResult<RegistrationReportRow>> {
  await simulateDelay(350);
  const rows = getFilteredCandidateRegistrations(filters);

  const { sortBy = "submittedAt", sortOrder = "desc", page = 1, pageSize = 10 } = filters;

  rows.sort((a, b) => {
    if (sortBy === "submittedAt") {
      const diff = new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
      return sortOrder === "asc" ? -diff : diff;
    }
    if (sortBy === "name") {
      const cmp = a.name.localeCompare(b.name);
      return sortOrder === "asc" ? cmp : -cmp;
    }
    if (sortBy === "registrantId") {
      const cmp = a.registrantId.localeCompare(b.registrantId);
      return sortOrder === "asc" ? cmp : -cmp;
    }
    if (sortBy === "teamName") {
      const cmp = a.teamName.localeCompare(b.teamName);
      return sortOrder === "asc" ? cmp : -cmp;
    }
    if (sortBy === "status") {
      const cmp = a.status.localeCompare(b.status);
      return sortOrder === "asc" ? cmp : -cmp;
    }
    return 0;
  });

  const total = rows.length;
  const totalPages = Math.ceil(total / pageSize) || 1;
  const start = (page - 1) * pageSize;
  const paginatedData = rows.slice(start, start + pageSize);

  return {
    data: paginatedData,
    pagination: {
      page,
      pageSize,
      total,
      totalPages,
    },
  };
}

// Helper: Filter Team report rows
function getFilteredTeamRows(filters: ReportFilters = {}) {
  const { search = "", league, teamId, status } = filters;

  const teams = teamsStore.map((team) => {
    const teamMembers = membersStore.filter((m) => m.teamId === team.id);
    const approvedCount = teamMembers.filter((m) => m.status === "APPROVED").length;
    const pendingCount = teamMembers.filter((m) => m.status === "PENDING").length;
    const rejectedCount = teamMembers.filter((m) => m.status === "REJECTED").length;
    const totalRegistrations = teamMembers.length;
    const rosterCompliance =
      totalRegistrations > 0
        ? Math.round((approvedCount / totalRegistrations) * 1000) / 10
        : 0;
    const isBelowThreshold = rosterCompliance < COMPLIANCE_THRESHOLD;

    return {
      id: team.id,
      teamId: team.id,
      teamCode: team.teamCode,
      name: team.name,
      league: team.league,
      totalRegistrations,
      approvedCount,
      pendingCount,
      rejectedCount,
      teamStatus: team.status,
      rosterCompliance,
      isBelowThreshold,
    };
  });

  return teams.filter((t) => {
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      const match =
        t.name.toLowerCase().includes(q) ||
        t.teamCode.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (league && league !== "ALL" && t.league !== league) return false;
    if (teamId && teamId !== "ALL" && t.teamId !== teamId) return false;
    if (status && status !== "ALL" && t.teamStatus !== status) return false;
    return true;
  });
}

/**
 * 23. GET Team-wise Report Summary
 */
export async function mockGetTeamReportSummary(
  filters: ReportFilters = {},
): Promise<TeamReportSummary> {
  await simulateDelay(250);
  const filtered = getFilteredTeamRows(filters);

  const activeTeams = filtered.filter((t) => t.teamStatus === "ACTIVE").length;
  const inactiveTeams = filtered.filter((t) => t.teamStatus === "INACTIVE").length;

  // KSPL & ISCL breakdown ignore the league filter so divisional benchmarks remain visible
  const allTeams = getFilteredTeamRows({ ...filters, league: undefined });
  const ksplList = allTeams.filter((t) => t.league === "KSPL");
  const isclList = allTeams.filter((t) => t.league === "ISCL");

  const sumStat = (list: TeamReportRow[]) => {
    const totalRegistrations = list.reduce((acc, t) => acc + t.totalRegistrations, 0);
    const approvedCount = list.reduce((acc, t) => acc + t.approvedCount, 0);
    const pendingCount = list.reduce((acc, t) => acc + t.pendingCount, 0);
    const rejectedCount = list.reduce((acc, t) => acc + t.rejectedCount, 0);
    const approvalRate = totalRegistrations > 0 ? calculatePercentage(approvedCount, totalRegistrations) : 0;
    return {
      teamCount: list.length,
      totalRegistrations,
      approvedCount,
      pendingCount,
      rejectedCount,
      approvalRate,
    };
  };

  const totalRegSum = filtered.reduce((acc, t) => acc + t.totalRegistrations, 0);
  const totalAppSum = filtered.reduce((acc, t) => acc + t.approvedCount, 0);
  const overallCompliance =
    totalRegSum > 0 ? Math.round((totalAppSum / totalRegSum) * 1000) / 10 : 0;

  const belowThresholdCount = filtered.filter((t) => t.isBelowThreshold).length;

  return {
    totalTeams: filtered.length,
    activeTeams,
    inactiveTeams,
    kspl: sumStat(ksplList),
    iscl: sumStat(isclList),
    activeRosters: {
      operationalCount: activeTeams,
      totalCount: filtered.length,
      operationalPct: filtered.length > 0 ? calculatePercentage(activeTeams, filtered.length) : 0,
      belowThresholdCount,
    },
    overallCompliance,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * 24. GET Team-wise Report Rows
 */
export async function mockGetTeamReportRows(
  filters: ReportFilters = {},
): Promise<PaginatedResult<TeamReportRow>> {
  await simulateDelay(350);
  const rows = getFilteredTeamRows(filters);

  const { sortBy = "teamCode", sortOrder = "asc", page = 1, pageSize = 10 } = filters;

  rows.sort((a, b) => {
    if (sortBy === "name") {
      const cmp = a.name.localeCompare(b.name);
      return sortOrder === "asc" ? cmp : -cmp;
    }
    if (sortBy === "totalRegistrations") {
      return sortOrder === "asc" ? a.totalRegistrations - b.totalRegistrations : b.totalRegistrations - a.totalRegistrations;
    }
    if (sortBy === "approvedCount") {
      return sortOrder === "asc" ? a.approvedCount - b.approvedCount : b.approvedCount - a.approvedCount;
    }
    if (sortBy === "pendingCount") {
      return sortOrder === "asc" ? a.pendingCount - b.pendingCount : b.pendingCount - a.pendingCount;
    }
    if (sortBy === "rejectedCount") {
      return sortOrder === "asc" ? a.rejectedCount - b.rejectedCount : b.rejectedCount - a.rejectedCount;
    }
    if (sortBy === "rosterCompliance") {
      return sortOrder === "asc" ? a.rosterCompliance - b.rosterCompliance : b.rosterCompliance - a.rosterCompliance;
    }
    const cmp = a.teamCode.localeCompare(b.teamCode);
    return sortOrder === "asc" ? cmp : -cmp;
  });

  const total = rows.length;
  const totalPages = Math.ceil(total / pageSize) || 1;
  const start = (page - 1) * pageSize;
  const paginatedData = rows.slice(start, start + pageSize);

  return {
    data: paginatedData,
    pagination: {
      page,
      pageSize,
      total,
      totalPages,
    },
  };
}

// Helper: Filter Staff & Organizer rows
function getFilteredStaffOrganizers(filters: ReportFilters = {}) {
  const { search = "", type, status, from, to } = filters;

  const rows: StaffOrganizerReportRow[] = [
    ...staffStore.map((s) => ({
      id: s.id,
      registrantId: s.registrationId,
      formattedId: formatRegistrantId(s.registrationId),
      name: s.fullName,
      avatarUrl: s.avatarUrl,
      type: "STAFF" as const,
      departmentOrOrg: s.department,
      role: s.role,
      phone: s.contactNumber,
      email: s.emailAddress,
      submittedAt: s.submittedAt,
      status: s.status,
      mealEligible: s.mealEligible,
    })),
    ...organizersStore.map((o) => ({
      id: o.id,
      registrantId: o.registrationId,
      formattedId: formatRegistrantId(o.registrationId),
      name: o.fullName,
      avatarUrl: o.avatarUrl,
      type: "ORGANIZER" as const,
      departmentOrOrg: o.organization,
      role: o.role,
      phone: o.contactNumber,
      email: o.emailAddress,
      submittedAt: o.submittedAt,
      status: o.status,
      mealEligible: o.mealEligible,
    })),
  ];

  return rows.filter((r) => {
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      const match =
        r.name.toLowerCase().includes(q) ||
        r.registrantId.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.phone.toLowerCase().includes(q) ||
        r.departmentOrOrg.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (type && type !== "ALL" && r.type !== type) return false;
    if (status && status !== "ALL" && r.status !== status) return false;
    if (from && new Date(r.submittedAt) < new Date(`${from}T00:00:00`)) return false;
    if (to && new Date(r.submittedAt) > new Date(`${to}T23:59:59`)) return false;
    return true;
  });
}

/**
 * 25. GET Staff & Organizer Report Summary
 */
export async function mockGetStaffOrganizerReportSummary(
  filters: ReportFilters = {},
): Promise<StaffOrganizerReportSummary> {
  await simulateDelay(250);
  const filtered = getFilteredStaffOrganizers(filters);

  const staffCount = filtered.filter((r) => r.type === "STAFF").length;
  const organizerCount = filtered.filter((r) => r.type === "ORGANIZER").length;
  const passesIssued = filtered.filter((r) => r.status === "APPROVED").length;

  return {
    totalAccreditation: filtered.length,
    staffCount,
    organizerCount,
    passesIssued,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * 26. GET Staff & Organizer Report Rows
 */
export async function mockGetStaffOrganizerReportRows(
  filters: ReportFilters = {},
): Promise<PaginatedResult<StaffOrganizerReportRow>> {
  await simulateDelay(350);
  const rows = getFilteredStaffOrganizers(filters);

  const { sortBy = "submittedAt", sortOrder = "desc", page = 1, pageSize = 10 } = filters;

  rows.sort((a, b) => {
    if (sortBy === "submittedAt") {
      const diff = new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
      return sortOrder === "asc" ? -diff : diff;
    }
    if (sortBy === "name") {
      const cmp = a.name.localeCompare(b.name);
      return sortOrder === "asc" ? cmp : -cmp;
    }
    if (sortBy === "registrantId") {
      const cmp = a.registrantId.localeCompare(b.registrantId);
      return sortOrder === "asc" ? cmp : -cmp;
    }
    return 0;
  });

  const total = rows.length;
  const totalPages = Math.ceil(total / pageSize) || 1;
  const start = (page - 1) * pageSize;
  const paginatedData = rows.slice(start, start + pageSize);

  return {
    data: paginatedData,
    pagination: {
      page,
      pageSize,
      total,
      totalPages,
    },
  };
}

// Helper: Filter Meal Eligibility rows
function getFilteredMealEligibilityRows(filters: ReportFilters = {}) {
  const { search = "", league, teamId, type, eligibility, from, to } = filters;

  const rows: MealEligibilityReportRow[] = [
    ...membersStore.map((m) => {
      const team = teamsStore.find((t) => t.id === m.teamId);
      const reason = getMealEligibilityReason({
        status: m.status,
        teamStatus: team?.status,
        hasTeam: true,
      });

      const roleWithDesignation = m.designation ? `${m.roleTitle} (${m.designation})` : m.roleTitle;

      return {
        id: m.id,
        registrantId: m.registrationId,
        formattedId: formatRegistrantId(m.registrationId),
        name: m.fullName,
        avatarUrl: m.avatarUrl,
        isVip: m.isVip,
        type: "TEAM" as const,
        teamId: m.teamId,
        teamName: team?.name || "Independent",
        role: m.roleTitle,
        roleWithDesignation,
        phone: m.contactNumber,
        email: m.emailAddress,
        approvalStatus: m.status,
        teamStatus: team ? team.status : ("N/A" as const),
        mealAccessReason: reason,
        isEligible: reason === "eligible",
        reasonLabel: MEAL_REASON_META[reason].label,
        submittedAt: m.submittedAt,
        league: team?.league,
      };
    }),
    ...staffStore.map((s) => {
      const reason = getMealEligibilityReason({
        status: s.status,
        hasTeam: false,
        mealEligibleToggle: s.mealEligible,
      });

      const roleWithDesignation = s.designation ? `${s.role} (${s.designation})` : s.role;

      return {
        id: s.id,
        registrantId: s.registrationId,
        formattedId: formatRegistrantId(s.registrationId),
        name: s.fullName,
        avatarUrl: s.avatarUrl,
        isVip: s.isVip,
        type: "STAFF" as const,
        teamId: undefined,
        teamName: "—",
        role: s.role,
        roleWithDesignation,
        phone: s.contactNumber,
        email: s.emailAddress,
        approvalStatus: s.status,
        teamStatus: "N/A" as const,
        mealAccessReason: reason,
        isEligible: reason === "eligible",
        reasonLabel: MEAL_REASON_META[reason].label,
        submittedAt: s.submittedAt,
        league: undefined,
      };
    }),
    ...organizersStore.map((o) => {
      const reason = getMealEligibilityReason({
        status: o.status,
        hasTeam: false,
        mealEligibleToggle: o.mealEligible,
      });

      const roleWithDesignation = o.designation ? `${o.role} (${o.designation})` : o.role;

      return {
        id: o.id,
        registrantId: o.registrationId,
        formattedId: formatRegistrantId(o.registrationId),
        name: o.fullName,
        avatarUrl: o.avatarUrl,
        isVip: o.isVip,
        type: "ORGANIZER" as const,
        teamId: undefined,
        teamName: "—",
        role: o.role,
        roleWithDesignation,
        phone: o.contactNumber,
        email: o.emailAddress,
        approvalStatus: o.status,
        teamStatus: "N/A" as const,
        mealAccessReason: reason,
        isEligible: reason === "eligible",
        reasonLabel: MEAL_REASON_META[reason].label,
        submittedAt: o.submittedAt,
        league: undefined,
      };
    }),
  ];

  return rows.filter((r) => {
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      const match =
        r.name.toLowerCase().includes(q) ||
        r.registrantId.toLowerCase().includes(q) ||
        r.teamName.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.phone.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (league && league !== "ALL" && r.league !== league) return false;
    if (teamId && teamId !== "ALL" && r.teamId !== teamId) return false;
    if (type && type !== "ALL" && r.type !== type) return false;
    if (eligibility && eligibility !== "ALL" && r.mealAccessReason !== eligibility) return false;
    if (from && new Date(r.submittedAt) < new Date(`${from}T00:00:00`)) return false;
    if (to && new Date(r.submittedAt) > new Date(`${to}T23:59:59`)) return false;
    return true;
  });
}

/**
 * 27. GET Meal Eligibility Report Summary
 */
export async function mockGetMealEligibilityReportSummary(
  filters: ReportFilters = {},
): Promise<MealEligibilityReportSummary> {
  await simulateDelay(250);
  // Buckets ignore eligibility filter so category distribution stays intact
  const unfilteredByEligibility = getFilteredMealEligibilityRows({ ...filters, eligibility: undefined });

  const totalPool = unfilteredByEligibility.length;
  const currentlyEligible = unfilteredByEligibility.filter((r) => r.mealAccessReason === "eligible").length;
  const ineligibleTeamInactive = unfilteredByEligibility.filter((r) => r.mealAccessReason === "team_inactive").length;
  const ineligibleUnapproved = unfilteredByEligibility.filter((r) => r.mealAccessReason === "unapproved").length;
  const manuallyDisabled = unfilteredByEligibility.filter((r) => r.mealAccessReason === "access_disabled").length;

  return {
    totalPool,
    currentlyEligible,
    eligiblePct: calculatePercentage(currentlyEligible, totalPool),
    ineligibleTeamInactive,
    ineligibleUnapproved,
    manuallyDisabled,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * 28. GET Meal Eligibility Report Rows
 */
export async function mockGetMealEligibilityReportRows(
  filters: ReportFilters = {},
): Promise<PaginatedResult<MealEligibilityReportRow>> {
  await simulateDelay(350);
  const rows = getFilteredMealEligibilityRows(filters);

  const { sortBy = "registrantId", sortOrder = "asc", page = 1, pageSize = 10 } = filters;

  rows.sort((a, b) => {
    if (sortBy === "name") {
      const cmp = a.name.localeCompare(b.name);
      return sortOrder === "asc" ? cmp : -cmp;
    }
    if (sortBy === "approvalStatus") {
      const cmp = a.approvalStatus.localeCompare(b.approvalStatus);
      return sortOrder === "asc" ? cmp : -cmp;
    }
    const cmp = a.registrantId.localeCompare(b.registrantId);
    return sortOrder === "asc" ? cmp : -cmp;
  });

  const total = rows.length;
  const totalPages = Math.ceil(total / pageSize) || 1;
  const start = (page - 1) * pageSize;
  const paginatedData = rows.slice(start, start + pageSize);

  return {
    data: paginatedData,
    pagination: {
      page,
      pageSize,
      total,
      totalPages,
    },
  };
}

/**
 * 29. Export Report Audit Logger & Provider
 */
export async function mockExportReport(
  key: ReportKey,
  format: ExportFormat,
  filters: ReportFilters = {},
): Promise<Blob> {
  await simulateDelay(400);

  let rowCount = 0;
  if (key === "registration") {
    rowCount = getFilteredCandidateRegistrations(filters).length;
  } else if (key === "team") {
    rowCount = getFilteredTeamRows(filters).length;
  } else if (key === "staff-organizer") {
    rowCount = getFilteredStaffOrganizers(filters).length;
  } else if (key === "meal-eligibility") {
    rowCount = getFilteredMealEligibilityRows(filters).length;
  }

  auditLogsStore.unshift({
    id: `audit-${Date.now()}`,
    actor: "Alex Morgan",
    action: `EXPORT_${key.toUpperCase()}_${format.toUpperCase()}`,
    targetId: `report-${key}`,
    details: `Exported ${rowCount} records as ${format.toUpperCase()} with filters: ${JSON.stringify(filters)}`,
    timestamp: new Date().toISOString(),
  });

  return new Blob([`Report export for ${key} (${rowCount} records)`], {
    type: format === "csv" ? "text/csv" : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

/**
 * 30. Batch Print Catering Tokens (Cap: 500)
 */
export async function mockBatchPrintCateringTokens(
  filters: ReportFilters = {},
): Promise<{ printedCount: number; message: string; pdfUrl: string }> {
  await simulateDelay(600);

  const eligibleRows = getFilteredMealEligibilityRows(filters).filter((r) => r.isEligible);
  const cappedCount = Math.min(eligibleRows.length, 500);

  auditLogsStore.unshift({
    id: `audit-${Date.now()}`,
    actor: "Alex Morgan",
    action: "BATCH_PRINT_CATERING_TOKENS",
    targetId: "meal-eligibility-batch",
    details: `Generated printable batch token dossier for ${cappedCount} eligible attendees.`,
    timestamp: new Date().toISOString(),
  });

  return {
    printedCount: cappedCount,
    message: `Batch catering voucher manifest generated for ${cappedCount} verified registrants.`,
    pdfUrl: `/assets/docs/Batch_Tokens_${Date.now()}.pdf`,
  };
}


