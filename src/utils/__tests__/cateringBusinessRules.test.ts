/**
 * Catering Super Admin - Business Rules Unit Tests (Part F)
 *
 * Test Suites:
 * 1. Duplicate distribution prevention (409 DUPLICATE_DISTRIBUTION)
 * 2. Live window & matchday activation eligibility gates
 * 3. Reconciliation invariants (team + staff = total, sum(periods) = total)
 * 4. Period state & countdown calculations at 13:22 IST
 * 5. Permission pure reducer (meals:provide requires verify requires view; meals:manage grants all)
 * 6. User safeguards (self-deactivation and last Super Admin demotion/deactivation blocked)
 */

import { evaluatePermission } from "../../hooks/usePermissions";
import {
  getPeriodState,
  formatCountdown,
  computeLedgerDigest,
} from "../cateringClock";
import { isMealEligible, getMealEligibilityReason } from "../mealEligibility";
import { isEventAdminUser } from "../authGuards";
import {
  CATERING_ROLES,
  DEFAULT_MEALS_CONFIG,
  DEFAULT_MEAL_PERIODS,
} from "../../constants/catering";
import { ROUTES } from "../../constants/routes";
import {
  TEST_OPERATING_DATE,
  TEST_ACTIVATED_TEAMS,
  TEST_STAFF_MEMBERS,
  TEST_USERS,
  TEST_LEDGER,
} from "./testFixtures";
import {
  GLOBAL_LEDGER,
  GLOBAL_USERS,
} from "../../api/mock/cateringMockData";
import {
  provideMeal,
  setUserStatus,
  updateUser,
  getMealConfig,
  saveMealConfig,
  CateringApiError,
} from "../../api/catering.api";
import type { MealPeriodConfig } from "../../types/catering.types";

export interface TestResult {
  suite: string;
  testName: string;
  passed: boolean;
  message?: string;
}

export async function runCateringBusinessRulesTests(): Promise<{
  passed: boolean;
  total: number;
  passedCount: number;
  failedCount: number;
  results: TestResult[];
}> {
  const results: TestResult[] = [];

  // Seed isolated in-memory test state for business rules validation
  GLOBAL_LEDGER.length = 0;
  GLOBAL_LEDGER.push(...TEST_LEDGER);
  GLOBAL_USERS.length = 0;
  GLOBAL_USERS.push(...TEST_USERS);

  function assert(suite: string, testName: string, condition: boolean, message?: string) {
    results.push({
      suite,
      testName,
      passed: condition,
      message: condition ? undefined : (message || "Assertion failed"),
    });
  }

  // =========================================================================
  // SUITE 1: Period State & Countdown Calculations (Frozen at 13:22 IST)
  // =========================================================================
  const mockNow = new Date(`${TEST_OPERATING_DATE}T13:22:00+05:30`);
  const breakfastConfig: MealPeriodConfig = DEFAULT_MEAL_PERIODS[0]!; // 08:00 - 11:00
  const lunchConfig: MealPeriodConfig = DEFAULT_MEAL_PERIODS[1]!;     // 12:00 - 15:00
  const dinnerConfig: MealPeriodConfig = DEFAULT_MEAL_PERIODS[2]!;    // 19:00 - 22:00

  // Breakfast should be closed
  const bState = getPeriodState(breakfastConfig, mockNow, TEST_OPERATING_DATE);
  assert("Period State & Schedule", "Breakfast (08:00–11:00) is closed at 13:22 IST", bState === "closed");

  // Lunch should be live
  const lState = getPeriodState(lunchConfig, mockNow, TEST_OPERATING_DATE);
  assert("Period State & Schedule", "Lunch (12:00–15:00) is live at 13:22 IST", lState === "live");

  // Dinner should be upcoming
  const dState = getPeriodState(dinnerConfig, mockNow, TEST_OPERATING_DATE);
  assert("Period State & Schedule", "Dinner (19:00–22:00) is upcoming at 13:22 IST", dState === "upcoming");

  // Countdown strings
  const bCountdown = formatCountdown(breakfastConfig, mockNow, TEST_OPERATING_DATE);
  assert("Period State & Schedule", "Breakfast closed countdown shows window closed at 10:00 AM", bCountdown.includes("10:00 AM"));

  const lCountdown = formatCountdown(lunchConfig, mockNow, TEST_OPERATING_DATE);
  assert("Period State & Schedule", "Lunch live countdown is exactly 'Closes in 1h 38m'", lCountdown === "Closes in 1h 38m");

  const dCountdown = formatCountdown(dinnerConfig, mockNow, TEST_OPERATING_DATE);
  assert("Period State & Schedule", "Dinner upcoming countdown is exactly 'Opens in 5h 38m'", dCountdown === "Opens in 5h 38m");

  // Disabled period check
  const disabledConfig: MealPeriodConfig = { ...dinnerConfig, enabled: false };
  assert("Period State & Schedule", "Disabled meal period returns 'disabled' state", getPeriodState(disabledConfig, mockNow, TEST_OPERATING_DATE) === "disabled");
  assert("Period State & Schedule", "Disabled period countdown is 'Not served today'", formatCountdown(disabledConfig, mockNow, TEST_OPERATING_DATE) === "Not served today");

  // =========================================================================
  // SUITE 2: Permission System Pure Reducer & Hierarchy
  // =========================================================================
  // 1. Super Admin has all permissions
  const superAdminRole = CATERING_ROLES.SUPER_ADMIN!;
  assert("Permission Reducer", "Super Admin has meals:view", evaluatePermission(superAdminRole.permissions, "meals", "view"));
  assert("Permission Reducer", "Super Admin has meals:verify", evaluatePermission(superAdminRole.permissions, "meals", "verify"));
  assert("Permission Reducer", "Super Admin has meals:provide", evaluatePermission(superAdminRole.permissions, "meals", "provide"));
  assert("Permission Reducer", "Super Admin has meals:manage", evaluatePermission(superAdminRole.permissions, "meals", "manage"));
  assert("Permission Reducer", "Super Admin has users:manage", evaluatePermission(superAdminRole.permissions, "users", "manage"));

  // 2. Meal Operator has view, verify, provide but NOT manage
  const mealOperatorRole = CATERING_ROLES.MEAL_OPERATOR!;
  assert("Permission Reducer", "Meal Operator has meals:view", evaluatePermission(mealOperatorRole.permissions, "meals", "view"));
  assert("Permission Reducer", "Meal Operator has meals:verify", evaluatePermission(mealOperatorRole.permissions, "meals", "verify"));
  assert("Permission Reducer", "Meal Operator has meals:provide", evaluatePermission(mealOperatorRole.permissions, "meals", "provide"));
  assert("Permission Reducer", "Meal Operator DOES NOT have meals:manage", !evaluatePermission(mealOperatorRole.permissions, "meals", "manage"));
  assert("Permission Reducer", "Meal Operator DOES NOT have users:view", !evaluatePermission(mealOperatorRole.permissions, "users", "view"));

  // 3. Reports Viewer has reports:view but NOT meals:provide
  const reportsViewerRole = CATERING_ROLES.REPORTS_VIEWER!;
  assert("Permission Reducer", "Reports Viewer has reports:view", evaluatePermission(reportsViewerRole.permissions, "reports", "view"));
  assert("Permission Reducer", "Reports Viewer DOES NOT have meals:provide", !evaluatePermission(reportsViewerRole.permissions, "meals", "provide"));
  assert("Permission Reducer", "Reports Viewer DOES NOT have meals:verify", !evaluatePermission(reportsViewerRole.permissions, "meals", "verify"));

  // 4. Hierarchy implication: provide requires verify requires view
  assert("Permission Reducer", "evaluatePermission with empty permissions returns false", !evaluatePermission([], "meals", "provide"));
  assert("Permission Reducer", "Rule: meals:provide requires verify and view", evaluatePermission(["meals:provide"], "meals", "view") && evaluatePermission(["meals:provide"], "meals", "verify"));
  assert("Permission Reducer", "Rule: meals:manage implies view, verify, provide", evaluatePermission(["meals:manage"], "meals", "provide") && evaluatePermission(["meals:manage"], "meals", "verify") && evaluatePermission(["meals:manage"], "meals", "view"));

  // =========================================================================
  // SUITE 3: Matchday Activation & Meal Eligibility Gates
  // =========================================================================
  const dummyMemberContext = {
    status: "APPROVED" as const,
    hasTeam: true,
    teamStatus: "ACTIVE" as const,
    teamActivatedToday: true,
  };

  assert("Eligibility Gates", "Approved member with activated team today is eligible", isMealEligible(dummyMemberContext) && getMealEligibilityReason(dummyMemberContext) === "eligible");

  const unactivatedContext = {
    ...dummyMemberContext,
    teamActivatedToday: false,
  };
  assert("Eligibility Gates", "Member with unactivated team today is ineligible with 'not_activated_today'", !isMealEligible(unactivatedContext) && getMealEligibilityReason(unactivatedContext) === "not_activated_today");

  const unapprovedContext = {
    ...dummyMemberContext,
    status: "PENDING" as const,
  };
  assert("Eligibility Gates", "Pending registration is ineligible with 'unapproved'", !isMealEligible(unapprovedContext) && getMealEligibilityReason(unapprovedContext) === "unapproved");

  const staffContextDisabled = {
    status: "APPROVED" as const,
    hasTeam: false,
    mealEligibleToggle: false,
  };
  assert("Eligibility Gates", "Staff with mealEligibleToggle: false is ineligible with 'access_disabled'", !isMealEligible(staffContextDisabled) && getMealEligibilityReason(staffContextDisabled) === "access_disabled");

  // =========================================================================
  // SUITE 4: Reconciliation Invariants & Mathematical Balance
  // =========================================================================
  // 1. Total pool = 125 team members + 6 staff members = 131
  const totalActivatedTeamMembers = TEST_ACTIVATED_TEAMS.reduce((acc, t) => acc + t.rosterCap, 0);
  assert("Reconciliation Invariants", "Total team members capacity equals exactly 125", totalActivatedTeamMembers === 125);
  assert("Reconciliation Invariants", "Total staff roster equals exactly 6", TEST_STAFF_MEMBERS.length === 6);
  assert("Reconciliation Invariants", "Total eligible today pool equals exactly 131", totalActivatedTeamMembers + TEST_STAFF_MEMBERS.length === 131);

  // 2. Initial ledger counts: 85 total = 81 team + 4 staff
  const initialDayLedger = GLOBAL_LEDGER.filter((r) => r.date === TEST_OPERATING_DATE);
  const initialTeamMeals = initialDayLedger.filter((r) => r.recipientType === "team_member").length;
  const initialStaffMeals = initialDayLedger.filter((r) => r.recipientType === "staff").length;
  assert("Reconciliation Invariants", "Initial ledger total is 85", initialDayLedger.length === 85);
  assert("Reconciliation Invariants", "Initial team distributions is 81", initialTeamMeals === 81);
  assert("Reconciliation Invariants", "Initial staff distributions is 4", initialStaffMeals === 4);
  assert("Reconciliation Invariants", "Total = Team + Staff (81 + 4 = 85)", initialTeamMeals + initialStaffMeals === 85);

  // 3. Period distribution sums: Breakfast (45) + Lunch (40) + Dinner (0) = 85
  const breakfastMeals = initialDayLedger.filter((r) => r.periodKey === "breakfast").length;
  const lunchMeals = initialDayLedger.filter((r) => r.periodKey === "lunch").length;
  const dinnerMeals = initialDayLedger.filter((r) => r.periodKey === "dinner").length;
  assert("Reconciliation Invariants", "Breakfast distribution count is 45", breakfastMeals === 45);
  assert("Reconciliation Invariants", "Lunch distribution count is 40", lunchMeals === 40);
  assert("Reconciliation Invariants", "Dinner distribution count is 0", dinnerMeals === 0);
  assert("Reconciliation Invariants", "Sum of period meals (45 + 40 + 0) equals total (85)", breakfastMeals + lunchMeals + dinnerMeals === initialDayLedger.length);

  // 4. SHA-256 Ledger Digest stability
  const digest = await computeLedgerDigest(initialDayLedger);
  assert("Reconciliation Invariants", "Ledger digest is non-empty 8-character hex string", typeof digest === "string" && digest.length === 8 && /^[0-9A-Fa-f]{8}$/.test(digest));

  // =========================================================================
  // SUITE 5: Duplicate Distribution Prevention (409 Conflict)
  // =========================================================================
  // Lunch is live at 13:22 IST. First dispensation to Arun Kumar (mem-chennai-kings-1) succeeds.
  const testIdempotencyKey = "test-idempotent-key-001";
  const firstDispense = await provideMeal({
    registrantId: "mem-chennai-kings-1",
    periodKey: "lunch",
    verificationMethod: "passcode",
    counterId: "counter-01",
    operatorId: "usr-001",
    idempotencyKey: testIdempotencyKey,
  });

  // Attempting second dispensation to the same registrant for the same period must throw DUPLICATE_DISTRIBUTION (409)
  let duplicateThrown = false;
  let duplicateDetails: Record<string, unknown> | undefined = undefined;
  try {
    await provideMeal({
      registrantId: "mem-chennai-kings-1",
      periodKey: "lunch",
      verificationMethod: "qr",
      counterId: "counter-01",
      operatorId: "usr-001",
    });
  } catch (err) {
    if (err instanceof CateringApiError && err.code === "DUPLICATE_DISTRIBUTION") {
      duplicateThrown = true;
      duplicateDetails = err.data;
    }
  }
  assert("Duplicate Prevention", "Dispensing duplicate meal returns DUPLICATE_DISTRIBUTION (409)", duplicateThrown);
  assert("Duplicate Prevention", "Duplicate error contains originalClaim details", duplicateDetails?.originalClaim !== undefined);

  // Window closed validation: Attempting Dinner dispensation before window opens returns WINDOW_CLOSED
  let windowClosedThrown = false;
  try {
    await provideMeal({
      registrantId: "mem-chennai-kings-1",
      periodKey: "dinner",
      verificationMethod: "qr",
      counterId: "counter-01",
      operatorId: "usr-001",
    });
  } catch (err) {
    if (err instanceof CateringApiError && err.code === "WINDOW_CLOSED") {
      windowClosedThrown = true;
    }
  }
  assert("Duplicate Prevention", "Dispensing meal during closed/upcoming window returns WINDOW_CLOSED", windowClosedThrown);

  // Idempotency: Duplicate calls with identical idempotencyKey return the same record without creating duplicates
  const secondDispense = await provideMeal({
    registrantId: "mem-chennai-kings-1",
    periodKey: "lunch",
    verificationMethod: "passcode",
    counterId: "counter-01",
    operatorId: "usr-001",
    idempotencyKey: testIdempotencyKey,
  });
  assert("Duplicate Prevention", "Identical idempotencyKey returns existing record without duplicating", firstDispense.id === secondDispense.id);

  // =========================================================================
  // SUITE 6: User Safeguards (Self-deactivation & Last Admin Protection)
  // =========================================================================
  // 1. Self deactivation blocked
  let selfDeactivateBlocked = false;
  try {
    await setUserStatus("usr-001", "inactive");
  } catch (err) {
    if (err instanceof CateringApiError && err.code === "FORBIDDEN") {
      selfDeactivateBlocked = true;
    }
  }
  assert("User Safeguards", "Self-deactivation of current user (usr-001) is blocked with FORBIDDEN", selfDeactivateBlocked);

  // 2. Demoting own Super Admin role is blocked
  let selfDemoteBlocked = false;
  try {
    await updateUser("usr-001", { roleId: "MEAL_OPERATOR" });
  } catch (err) {
    if (err instanceof CateringApiError && err.code === "FORBIDDEN") {
      selfDemoteBlocked = true;
    }
  }
  assert("User Safeguards", "Demoting own Super Admin role is blocked with FORBIDDEN", selfDemoteBlocked);

  // 3. Last active Super Admin protection
  const activeSuperAdmins = GLOBAL_USERS.filter((u) => u.roleId === "SUPER_ADMIN" && u.status === "active");
  assert("User Safeguards", "System identifies exactly one active Super Admin initially", activeSuperAdmins.length === 1);

  // -------------------------------------------------------------
  // SUITE 7: Authentication & Login Gateway (Figma Node 66-479)
  // -------------------------------------------------------------
  assert(
    "Authentication & Login",
    "ROUTES.LOGIN constant is defined as '/login'",
    ROUTES.LOGIN === "/login",
  );
  assert(
    "Authentication & Login",
    "Super Admin default user exists with Alex Morgan credentials",
    GLOBAL_USERS.some(
      (u) =>
        u.email === "alex.morgan@jeffscatering.com" &&
        u.roleId === "SUPER_ADMIN" &&
        u.status === "active",
    ),
  );
  assert(
    "Authentication & Login",
    "Catering Super Admin role is locked and cannot be demoted",
    CATERING_ROLES.SUPER_ADMIN?.isLocked === true,
  );
  assert(
    "Authentication & Login",
    "Event Admin with portal: 'EVENT' is identified and barred from Super Admin portal",
    isEventAdminUser({ portal: "EVENT", role: "Event Admin" }) === true,
  );
  assert(
    "Authentication & Login",
    "Event Admin role object with portal: 'EVENT' is barred from Super Admin portal",
    isEventAdminUser({ portal: "EVENT", role: { name: "Event Admin", code: "SYS-EVENT-01", portal: "EVENT" } }) === true,
  );
  assert(
    "Authentication & Login",
    "Super Admin user with portal: 'SUPER' is permitted to log in",
    isEventAdminUser({ portal: "SUPER", role: "Super Admin" }) === false,
  );

  // =========================================================================
  // SUITE 8: Meal Configuration Defaults (Meal 1 to Meal 4 without times/targets)
  // =========================================================================
  assert(
    "Meal Configuration",
    "DEFAULT_MEALS_CONFIG defines exactly 4 default sessions",
    DEFAULT_MEALS_CONFIG.length === 4,
  );

  const configPeriods = await getMealConfig(TEST_OPERATING_DATE);
  assert(
    "Meal Configuration",
    "Meal config defaults to 4 sessions (Meal 1 to Meal 4)",
    configPeriods.length === 4 &&
      configPeriods[0]?.key === "meal1" &&
      configPeriods[1]?.key === "meal2" &&
      configPeriods[2]?.key === "meal3" &&
      configPeriods[3]?.key === "meal4",
  );

  assert(
    "Meal Configuration",
    "Meal config has no start time or end time configured",
    configPeriods.every((p) => p.start === undefined && p.end === undefined),
  );

  assert(
    "Meal Configuration",
    "Meal config has no planned veg or planned non-veg portions",
    configPeriods.every((p) => p.plannedVeg === undefined && p.plannedNonVeg === undefined),
  );

  // Validation: attempting to save with all sessions disabled throws validation error
  let disableAllThrown = false;
  try {
    await saveMealConfig(
      TEST_OPERATING_DATE,
      configPeriods.map((p) => ({ ...p, enabled: false })),
    );
  } catch (err) {
    if (err instanceof CateringApiError && err.code === "VALIDATION_ERROR") {
      disableAllThrown = true;
    }
  }
  assert(
    "Meal Configuration",
    "Saving configuration with all sessions disabled throws VALIDATION_ERROR",
    disableAllThrown,
  );

  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.filter((r) => !r.passed).length;

  return {
    passed: failedCount === 0,
    total: results.length,
    passedCount,
    failedCount,
    results,
  };
}

// Self-executing runner when executed directly via node or test runner
if (typeof process !== "undefined" && process.env.NODE_ENV !== "production") {
  runCateringBusinessRulesTests().then((res) => {
    console.log(`\n========================================================`);
    console.log(`CATERING SUPER ADMIN - BUSINESS RULES UNIT TESTS SUMMARY`);
    console.log(`========================================================`);
    console.log(`Total Assertions: ${res.total}`);
    console.log(`Passed: ${res.passedCount} ✅`);
    console.log(`Failed: ${res.failedCount} ${res.failedCount === 0 ? "🎉" : "❌"}`);
    console.log(`Overall Result: ${res.passed ? "ALL TESTS PASSED" : "TEST FAILURES DETECTED"}`);
    console.log(`========================================================\n`);

    res.results.forEach((r) => {
      const statusSymbol = r.passed ? "✓" : "✗";
      console.log(`  ${statusSymbol} [${r.suite}] ${r.testName}`);
      if (!r.passed && r.message) {
        console.log(`     Error: ${r.message}`);
      }
    });
    console.log(`\n`);
  }).catch((err) => {
    console.error("Test execution failed:", err);
  });
}
