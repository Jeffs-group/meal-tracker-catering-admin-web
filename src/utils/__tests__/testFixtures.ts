import type {
  MatchdayActivation,
  DistributionRecord,
  CateringUser,
  TeamMemberMealRosterItem,
  StaffMealRosterItem,
} from "@/types/catering.types";
import { OPERATING_DATE_DEFAULT } from "@/constants/catering";

export const TEST_OPERATING_DATE = OPERATING_DATE_DEFAULT;

export const TEST_ACTIVATED_TEAMS = [
  { id: "chennai-kings", name: "Chennai Kings", letterCode: "A", rosterCap: 25 },
  { id: "madurai-warriors", name: "Madurai Warriors", letterCode: "B", rosterCap: 22 },
  { id: "salem-strikers", name: "Salem Strikers", letterCode: "C", rosterCap: 28 },
  { id: "trichy-panthers", name: "Trichy Panthers", letterCode: "D", rosterCap: 25 },
  { id: "erode-titans", name: "Erode Titans", letterCode: "E", rosterCap: 25 },
];

export const TEST_MATCHDAY_ACTIVATIONS: MatchdayActivation[] = [
  ...TEST_ACTIVATED_TEAMS.map((t) => ({
    date: TEST_OPERATING_DATE,
    subjectType: "team" as const,
    subjectId: t.id,
    activatedBy: "Alex Morgan (Event Admin)",
  })),
  {
    date: TEST_OPERATING_DATE,
    subjectType: "staff",
    subjectId: "operational-staff-roster",
    activatedBy: "Alex Morgan (Event Admin)",
  },
];

export const TEST_USERS: CateringUser[] = [
  {
    id: "usr-001",
    userCode: "USR-2026-001",
    fullName: "Alex Morgan",
    email: "alex.morgan@jeffscatering.com",
    phone: "+91 98401 23456",
    roleId: "SUPER_ADMIN",
    status: "active",
    currentCounterId: "counter-01",
    invitation: {
      status: "accepted",
      sentAt: "2026-01-01T08:00:00Z",
      expiresAt: "2026-01-04T08:00:00Z",
      acceptedAt: "2026-01-01T09:30:00Z",
    },
    lastLogin: {
      at: "2026-11-03T11:20:00+05:30",
      browser: "Chrome • Chennai",
      city: "Chennai",
    },
    lastSeen: "2026-11-03T13:21:00+05:30",
    createdAt: "2026-01-01T08:00:00Z",
  },
  {
    id: "usr-002",
    userCode: "USR-2026-002",
    fullName: "Rahul Kumar",
    email: "rahul.kumar@jeffscatering.com",
    phone: "+91 98402 34567",
    roleId: "MEAL_OPERATOR",
    status: "active",
    currentCounterId: "counter-01",
    invitation: {
      status: "accepted",
      sentAt: "2026-01-10T09:00:00Z",
      expiresAt: "2026-01-13T09:00:00Z",
      acceptedAt: "2026-01-10T10:15:00Z",
    },
    lastLogin: {
      at: "2026-11-03T12:45:00+05:30",
      browser: "Chrome • Chennai",
      city: "Chennai",
    },
    lastSeen: "2026-11-03T13:18:00+05:30",
    createdAt: "2026-01-10T09:00:00Z",
  },
];

export const TEST_STAFF_MEMBERS: StaffMealRosterItem[] = [
  {
    id: "staff-01",
    registrantId: "mem-staff-01",
    registrantCode: "STAFF-001",
    fullName: "Suresh Raina (Liaison)",
    designation: "Team Liaison Officer",
    department: "Tournament Operations",
    contactNumber: "+91 98400 11001",
    mealPreference: "veg",
    isEligibleToday: true,
    meals: {
      breakfast: { state: "provided", providedAt: `${TEST_OPERATING_DATE}T08:15:00+05:30` },
      lunch: { state: "provided", providedAt: `${TEST_OPERATING_DATE}T12:30:00+05:30` },
      dinner: { state: "pending" },
    },
    totalMealsProvided: 2,
  },
  {
    id: "staff-02",
    registrantId: "mem-staff-02",
    registrantCode: "STAFF-002",
    fullName: "Pooja Venkatesh (Medical)",
    designation: "Lead Sports Physiotherapist",
    department: "Medical",
    contactNumber: "+91 98400 11002",
    mealPreference: "veg",
    isEligibleToday: true,
    meals: {
      breakfast: { state: "provided", providedAt: `${TEST_OPERATING_DATE}T08:22:00+05:30` },
      lunch: { state: "provided", providedAt: `${TEST_OPERATING_DATE}T12:45:00+05:30` },
      dinner: { state: "pending" },
    },
    totalMealsProvided: 2,
  },
  {
    id: "staff-03",
    registrantId: "mem-staff-03",
    registrantCode: "STAFF-003",
    fullName: "Anand Mahindra (Security)",
    designation: "Venue Security Marshall",
    department: "Security",
    contactNumber: "+91 98400 11003",
    mealPreference: "non_veg",
    isEligibleToday: true,
    meals: {
      breakfast: { state: "not_collected" },
      lunch: { state: "pending" },
      dinner: { state: "pending" },
    },
    totalMealsProvided: 0,
  },
  {
    id: "staff-04",
    registrantId: "mem-staff-04",
    registrantCode: "STAFF-004",
    fullName: "Devika Rani (Hospitality)",
    designation: "VIP Protocol Steward",
    department: "Hospitality",
    contactNumber: "+91 98400 11004",
    mealPreference: "veg",
    isEligibleToday: true,
    meals: {
      breakfast: { state: "not_collected" },
      lunch: { state: "pending" },
      dinner: { state: "pending" },
    },
    totalMealsProvided: 0,
  },
  {
    id: "staff-05",
    registrantId: "mem-staff-05",
    registrantCode: "STAFF-005",
    fullName: "Girish Karnad (Media)",
    designation: "Broadcast Production Crew",
    department: "Media",
    contactNumber: "+91 98400 11005",
    mealPreference: "non_veg",
    isEligibleToday: false,
    meals: {
      breakfast: { state: "not_collected" },
      lunch: { state: "pending" },
      dinner: { state: "pending" },
    },
    totalMealsProvided: 0,
  },
  {
    id: "staff-06",
    registrantId: "mem-staff-06",
    registrantCode: "STAFF-006",
    fullName: "Manoj Bajpayee (Logistics)",
    designation: "Equipment & Kit Manager",
    department: "Logistics",
    contactNumber: "+91 98400 11006",
    mealPreference: "non_veg",
    isEligibleToday: true,
    meals: {
      breakfast: { state: "not_collected" },
      lunch: { state: "pending" },
      dinner: { state: "pending" },
    },
    totalMealsProvided: 0,
  },
];

const FIRST_NAMES = [
  "Arun", "Karthik", "Vijay", "Senthil", "Praveen", "Dinesh", "Muthu", "Saravanan",
  "Bala", "Manikandan", "Vignesh", "Ramesh", "Suresh", "Ganesh", "Mahesh", "Rajesh",
  "Naveen", "Deepak", "Aravind", "Ashok", "Sanjay", "Prabhu", "Murugan", "Shankar",
  "Hari", "Mohan", "Gopal", "Sundar", "Raghu", "Siva", "Kishore", "Anand",
];

const LAST_NAMES = [
  "Kumar", "Rajan", "Sundaram", "Krishnan", "Natarajan", "Subramanian", "Balaji",
  "Iyer", "Mudaliar", "Pillai", "Chettiar", "Gounder", "Naidu", "Reddy", "Patel",
  "Sharma", "Verma", "Menon", "Nair", "Warrier", "Acharya", "Bhatt", "Rao",
];

export function buildTestTeamRoster(teamId: string, letter: string, cap: number): TeamMemberMealRosterItem[] {
  const items: TeamMemberMealRosterItem[] = [];
  const bCounts: Record<string, number> = { A: 10, B: 8, C: 12, D: 8, E: 5 };
  const lCounts: Record<string, number> = { A: 9, B: 8, C: 11, D: 7, E: 3 };

  const targetB = bCounts[letter] || 8;
  const targetL = lCounts[letter] || 7;

  for (let i = 1; i <= cap; i++) {
    const fn = FIRST_NAMES[(i * 7 + letter.charCodeAt(0)) % FIRST_NAMES.length];
    const ln = LAST_NAMES[(i * 11 + letter.charCodeAt(0)) % LAST_NAMES.length];
    const fullName = `${fn} ${ln}`;
    const isVip = i <= 2;
    const isCaptain = i === 1;
    const isVice = i === 2;
    const role = isCaptain ? "Captain" : isVice ? "Vice Captain" : i <= 15 ? "Player" : "Support Staff";
    const mealPref: "veg" | "non_veg" = i % 3 === 0 ? "veg" : "non_veg";

    const hasB = i <= targetB;
    const hasL = i !== 1 && i <= targetL + 1;

    const bMin = String(10 + (i * 3) % 45).padStart(2, "0");
    const lMin = String(15 + (i * 4) % 40).padStart(2, "0");
    const bTime = `08:${bMin}`;
    const lTime = `12:${lMin}`;

    items.push({
      id: `${teamId}-${i}`,
      registrantId: `mem-${teamId}-${i}`,
      registrantCode: `JCC${(100000 + letter.charCodeAt(0) * 1000 + i).toString()}`,
      fullName,
      designation: role,
      memberType: role,
      isVip,
      contactNumber: `+91 9840${letter.charCodeAt(0) % 10} ${String(10000 + i).slice(1)}`,
      mealPreference: mealPref,
      isEligibleToday: true,
      meals: {
        breakfast: hasB
          ? { state: "provided", providedAt: `${TEST_OPERATING_DATE}T${bTime}:00+05:30` }
          : { state: "not_collected" },
        lunch: hasL
          ? { state: "provided", providedAt: `${TEST_OPERATING_DATE}T${lTime}:00+05:30` }
          : { state: "pending" },
        dinner: { state: "pending" },
      },
      totalMealsProvided: (hasB ? 1 : 0) + (hasL ? 1 : 0),
    });
  }

  return items;
}

export const TEST_TEAM_ROSTERS: Record<string, TeamMemberMealRosterItem[]> = {
  "chennai-kings": buildTestTeamRoster("chennai-kings", "A", 25),
  "madurai-warriors": buildTestTeamRoster("madurai-warriors", "B", 22),
  "salem-strikers": buildTestTeamRoster("salem-strikers", "C", 28),
  "trichy-panthers": buildTestTeamRoster("trichy-panthers", "D", 25),
  "erode-titans": buildTestTeamRoster("erode-titans", "E", 25),
};

export function generateTestLedger(): DistributionRecord[] {
  const records: DistributionRecord[] = [];
  let receiptNum = 1001;

  Object.entries(TEST_TEAM_ROSTERS).forEach(([teamId, roster]) => {
    roster.forEach((member) => {
      if (member.meals.breakfast.state === "provided" && member.meals.breakfast.providedAt) {
        records.push({
          id: `dist-${receiptNum}`,
          receiptCode: `MR-20261103-${receiptNum}`,
          registrantId: member.registrantId,
          recipientType: "team_member",
          teamId,
          date: TEST_OPERATING_DATE,
          periodKey: "breakfast",
          providedAt: member.meals.breakfast.providedAt,
          counterId: "counter-01",
          operatorId: "usr-002",
          verificationMethod: member.isVip ? "qr" : "passcode",
          mealType: member.mealPreference,
          idempotencyKey: `idem-${member.registrantId}-breakfast`,
        });
        receiptNum++;
      }

      if (member.meals.lunch.state === "provided" && member.meals.lunch.providedAt) {
        records.push({
          id: `dist-${receiptNum}`,
          receiptCode: `MR-20261103-${receiptNum}`,
          registrantId: member.registrantId,
          recipientType: "team_member",
          teamId,
          date: TEST_OPERATING_DATE,
          periodKey: "lunch",
          providedAt: member.meals.lunch.providedAt,
          counterId: "counter-01",
          operatorId: "usr-002",
          verificationMethod: "qr",
          mealType: member.mealPreference,
          idempotencyKey: `idem-${member.registrantId}-lunch`,
        });
        receiptNum++;
      }
    });
  });

  TEST_STAFF_MEMBERS.forEach((staff) => {
    if (staff.meals.breakfast.state === "provided" && staff.meals.breakfast.providedAt) {
      records.push({
        id: `dist-${receiptNum}`,
        receiptCode: `MR-20261103-${receiptNum}`,
        registrantId: staff.registrantId,
        recipientType: "staff",
        date: TEST_OPERATING_DATE,
        periodKey: "breakfast",
        providedAt: staff.meals.breakfast.providedAt,
        counterId: "counter-04",
        operatorId: "usr-003",
        verificationMethod: "qr",
        mealType: staff.mealPreference,
        idempotencyKey: `idem-${staff.registrantId}-breakfast`,
      });
      receiptNum++;
    }

    if (staff.meals.lunch.state === "provided" && staff.meals.lunch.providedAt) {
      records.push({
        id: `dist-${receiptNum}`,
        receiptCode: `MR-20261103-${receiptNum}`,
        registrantId: staff.registrantId,
        recipientType: "staff",
        date: TEST_OPERATING_DATE,
        periodKey: "lunch",
        providedAt: staff.meals.lunch.providedAt,
        counterId: "counter-04",
        operatorId: "usr-003",
        verificationMethod: "qr",
        mealType: staff.mealPreference,
        idempotencyKey: `idem-${staff.registrantId}-lunch`,
      });
      receiptNum++;
    }
  });

  return records;
}

export const TEST_LEDGER: DistributionRecord[] = generateTestLedger();
