/**
 * Unit Tests: Reports Mathematical Reconciliation & Consistency Matrix
 * Asserting rules:
 * 1. approved = eligible + team_inactive + access_disabled
 * 2. total = approved + pending + rejected
 * 3. eligible + team_inactive + unapproved + access_disabled = total pool
 * 4. team report totals = sum of team rows
 * 5. hub numbers = report summary numbers
 */

import {
  INITIAL_TEAMS,
  INITIAL_MEMBERS,
  INITIAL_STAFF,
  INITIAL_ORGANIZERS,
} from "@/api/mock/mockData";
import {
  mockGetReportsHubSummary,
  mockGetRegistrationReportSummary,
  mockGetTeamReportSummary,
  mockGetStaffOrganizerReportSummary,
  mockGetMealEligibilityReportSummary,
  mockGetTeamReportRows,
} from "@/api/mock/mockHandlers";

export async function runReportsReconciliationTests(): Promise<{
  passed: boolean;
  results: { testName: string; passed: boolean; details?: string }[];
}> {
  const results: { testName: string; passed: boolean; details?: string }[] = [];

  // Fetch summaries from handlers
  const hub = await mockGetReportsHubSummary();
  const regSummary = await mockGetRegistrationReportSummary();
  const teamSummary = await mockGetTeamReportSummary();
  const staffOrgSummary = await mockGetStaffOrganizerReportSummary();
  const mealSummary = await mockGetMealEligibilityReportSummary();
  const teamRows = await mockGetTeamReportRows({ pageSize: 100 });

  // 1. Total Registrations Reconciliation
  const calculatedTotal =
    INITIAL_MEMBERS.length + INITIAL_STAFF.length + INITIAL_ORGANIZERS.length;
  const t1 =
    hub.totalRegistrations === calculatedTotal &&
    regSummary.totalSubmissions === calculatedTotal &&
    mealSummary.totalPool === calculatedTotal;
  results.push({
    testName: "Total Registrations equality across Hub, Registration, and Meal reports",
    passed: t1,
    details: `Hub=${hub.totalRegistrations}, Reg=${regSummary.totalSubmissions}, Meal=${mealSummary.totalPool}, Expected=${calculatedTotal}`,
  });

  // 2. Rule: total = approved + pending + rejected
  const t2 =
    regSummary.totalSubmissions ===
    regSummary.approvedCount + regSummary.pendingCount + regSummary.rejectedCount;
  results.push({
    testName: "Total equals Approved + Pending + Rejected",
    passed: t2,
    details: `${regSummary.totalSubmissions} === ${regSummary.approvedCount} + ${regSummary.pendingCount} + ${regSummary.rejectedCount}`,
  });

  // 3. Rule: approved = eligible + team_inactive + access_disabled
  const t3 =
    regSummary.approvedCount ===
    mealSummary.currentlyEligible +
      mealSummary.ineligibleTeamInactive +
      mealSummary.manuallyDisabled;
  results.push({
    testName: "Approved equals Eligible + Team Inactive + Access Disabled",
    passed: t3,
    details: `${regSummary.approvedCount} === ${mealSummary.currentlyEligible} + ${mealSummary.ineligibleTeamInactive} + ${mealSummary.manuallyDisabled}`,
  });

  // 4. Rule: eligible + team_inactive + unapproved + access_disabled = total pool
  const t4 =
    mealSummary.totalPool ===
    mealSummary.currentlyEligible +
      mealSummary.ineligibleTeamInactive +
      mealSummary.ineligibleUnapproved +
      mealSummary.manuallyDisabled;
  results.push({
    testName: "Total pool equals Eligible + Team Inactive + Unapproved + Access Disabled",
    passed: t4,
    details: `${mealSummary.totalPool} === ${mealSummary.currentlyEligible} + ${mealSummary.ineligibleTeamInactive} + ${mealSummary.ineligibleUnapproved} + ${mealSummary.manuallyDisabled}`,
  });

  // 5. Rule: team report totals = sum of team rows
  const sumTeamRegistrations = teamRows.data.reduce(
    (acc, t) => acc + t.totalRegistrations,
    0,
  );
  const sumTeamApproved = teamRows.data.reduce((acc, t) => acc + t.approvedCount, 0);
  const sumTeamPending = teamRows.data.reduce((acc, t) => acc + t.pendingCount, 0);
  const sumTeamRejected = teamRows.data.reduce((acc, t) => acc + t.rejectedCount, 0);

  const t5 =
    teamSummary.totalTeams === INITIAL_TEAMS.length &&
    teamSummary.kspl.totalRegistrations + teamSummary.iscl.totalRegistrations ===
      sumTeamRegistrations &&
    teamSummary.kspl.approvedCount + teamSummary.iscl.approvedCount ===
      sumTeamApproved &&
    teamSummary.kspl.pendingCount + teamSummary.iscl.pendingCount ===
      sumTeamPending &&
    teamSummary.kspl.rejectedCount + teamSummary.iscl.rejectedCount ===
      sumTeamRejected;
  results.push({
    testName: "Team report totals equal the sum of individual team rows",
    passed: t5,
    details: `Teams=${teamSummary.totalTeams}, TotalReg=${sumTeamRegistrations}, Approved=${sumTeamApproved}`,
  });

  // 6. Hub numbers = report summary numbers
  const t6 =
    hub.teams.total === teamSummary.totalTeams &&
    hub.teams.active === teamSummary.activeTeams &&
    hub.teams.inactive === teamSummary.inactiveTeams &&
    hub.staffOrganizers.total === staffOrgSummary.totalAccreditation &&
    hub.mealEligible.count === mealSummary.currentlyEligible;
  results.push({
    testName: "Hub summary numbers strictly equal dedicated report summary numbers",
    passed: t6,
    details: `HubTeams=${hub.teams.total}, HubStaffOrg=${hub.staffOrganizers.total}, HubMeal=${hub.mealEligible.count}`,
  });

  const allPassed = results.every((r) => r.passed);
  return { passed: allPassed, results };
}

