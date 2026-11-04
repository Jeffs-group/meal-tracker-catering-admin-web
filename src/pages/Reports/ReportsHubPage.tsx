import React from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { ErrorDisplay } from "@/components/ui/ErrorDisplay";
import { ReportCard } from "@/components/reports/ReportCard";
import { useReportsHub } from "@/hooks/useReports";
import { REPORTS_CONFIG } from "@/constants/reports";
import { exportReportToCsv, exportReportToExcel } from "@/utils/exportReport";
import { reportsApi } from "@/api/reports.api";
import {
  Users,
  Shield,
  Briefcase,
  UtensilsCrossed,
} from "lucide-react";
import type {
  ReportKey,
  ExportFormat,
  RegistrationReportRow,
  TeamReportRow,
  StaffOrganizerReportRow,
  MealEligibilityReportRow,
} from "@/types/reports.types";

export const ReportsHubPage: React.FC = () => {
  const { data, isLoading, isError, error, refetch } = useReportsHub();
  const [exportingKey, setExportingKey] = React.useState<string | null>(null);

  const handleHubCardExport = async (key: ReportKey, format: ExportFormat) => {
    try {
      setExportingKey(`${key}-${format}`);
      const slug = REPORTS_CONFIG[key].exportSlug;

      if (key === "registration") {
        const res = await reportsApi.getRegistrationRows({ pageSize: 5000 });
        const cols = [
          { header: "Registrant ID", key: "registrantId", accessor: (r: RegistrationReportRow) => r.formattedId },
          { header: "Name", key: "name", accessor: (r: RegistrationReportRow) => r.name },
          { header: "Type", key: "type", accessor: (r: RegistrationReportRow) => r.type },
          { header: "Team", key: "teamName", accessor: (r: RegistrationReportRow) => r.teamName },
          { header: "Role", key: "role", accessor: (r: RegistrationReportRow) => r.role },
          { header: "Phone", key: "phone", accessor: (r: RegistrationReportRow) => r.phone },
          { header: "Email", key: "email", accessor: (r: RegistrationReportRow) => r.email },
          { header: "Submitted On", key: "submittedAt", accessor: (r: RegistrationReportRow) => r.submittedAt },
          { header: "Status", key: "status", accessor: (r: RegistrationReportRow) => r.status },
        ];
        if (format === "csv") exportReportToCsv(slug, res.data, cols);
        else await exportReportToExcel(slug, "Registration Directory", res.data, cols, { filter: "Default Roster" });
      } else if (key === "team") {
        const res = await reportsApi.getTeamRows({ pageSize: 5000 });
        const cols = [
          { header: "Team Code", key: "teamCode", accessor: (r: TeamReportRow) => r.teamCode },
          { header: "Team Name", key: "name", accessor: (r: TeamReportRow) => r.name },
          { header: "League", key: "league", accessor: (r: TeamReportRow) => r.league },
          { header: "Total Registrations", key: "totalRegistrations", accessor: (r: TeamReportRow) => r.totalRegistrations },
          { header: "Approved", key: "approvedCount", accessor: (r: TeamReportRow) => r.approvedCount },
          { header: "Pending", key: "pendingCount", accessor: (r: TeamReportRow) => r.pendingCount },
          { header: "Rejected", key: "rejectedCount", accessor: (r: TeamReportRow) => r.rejectedCount },
          { header: "Status", key: "teamStatus", accessor: (r: TeamReportRow) => r.teamStatus },
          { header: "Compliance (%)", key: "rosterCompliance", accessor: (r: TeamReportRow) => `${r.rosterCompliance}%` },
        ];
        if (format === "csv") exportReportToCsv(slug, res.data, cols);
        else await exportReportToExcel(slug, "Team Roster Compliance", res.data, cols, { filter: "Default Roster" });
      } else if (key === "staff-organizer") {
        const res = await reportsApi.getStaffOrganizerRows({ pageSize: 5000 });
        const cols = [
          { header: "Registrant ID", key: "registrantId", accessor: (r: StaffOrganizerReportRow) => r.formattedId },
          { header: "Name", key: "name", accessor: (r: StaffOrganizerReportRow) => r.name },
          { header: "Type", key: "type", accessor: (r: StaffOrganizerReportRow) => r.type },
          { header: "Department / Org", key: "departmentOrOrg", accessor: (r: StaffOrganizerReportRow) => r.departmentOrOrg },
          { header: "Role", key: "role", accessor: (r: StaffOrganizerReportRow) => r.role },
          { header: "Phone", key: "phone", accessor: (r: StaffOrganizerReportRow) => r.phone },
          { header: "Email", key: "email", accessor: (r: StaffOrganizerReportRow) => r.email },
          { header: "Submitted On", key: "submittedAt", accessor: (r: StaffOrganizerReportRow) => r.submittedAt },
          { header: "Status", key: "status", accessor: (r: StaffOrganizerReportRow) => r.status },
        ];
        if (format === "csv") exportReportToCsv(slug, res.data, cols);
        else await exportReportToExcel(slug, "Staff & Organizers", res.data, cols, { filter: "Default Roster" });
      } else if (key === "meal-eligibility") {
        const res = await reportsApi.getMealEligibilityRows({ pageSize: 5000 });
        const cols = [
          { header: "Registrant ID", key: "registrantId", accessor: (r: MealEligibilityReportRow) => r.formattedId },
          { header: "Name", key: "name", accessor: (r: MealEligibilityReportRow) => r.name },
          { header: "Type", key: "type", accessor: (r: MealEligibilityReportRow) => r.type },
          { header: "Team", key: "teamName", accessor: (r: MealEligibilityReportRow) => r.teamName },
          { header: "Role", key: "role", accessor: (r: MealEligibilityReportRow) => r.roleWithDesignation },
          { header: "Phone", key: "phone", accessor: (r: MealEligibilityReportRow) => r.phone },
          { header: "Approval Status", key: "approvalStatus", accessor: (r: MealEligibilityReportRow) => r.approvalStatus },
          { header: "Team Status", key: "teamStatus", accessor: (r: MealEligibilityReportRow) => r.teamStatus },
          { header: "Meal Access", key: "mealAccess", accessor: (r: MealEligibilityReportRow) => r.reasonLabel },
        ];
        if (format === "csv") exportReportToCsv(slug, res.data, cols);
        else await exportReportToExcel(slug, "Meal Eligibility Manifest", res.data, cols, { filter: "Default Roster" });
      }
    } catch (err) {
      console.error(err);
      alert("Failed to export report. Please try again.");
    } finally {
      setExportingKey(null);
    }
  };

  if (isError) {
    return (
      <div className="py-12">
        <ErrorDisplay
          title="Failed to Load Reports Summary"
          message={error instanceof Error ? error.message : "An unexpected error occurred."}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports & Analytics Hub"
        description="Access real-time registration dossiers, league-wide team participation quotas, and dining gate accreditation matrices."
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Reports" },
        ]}
      />

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Registrations"
          value={isLoading ? "..." : (data?.totalRegistrations ?? 0)}
          trend={{ value: `+${data?.changePct ?? 8.4}%`, isPositive: true }}
          subtitle="Across all streams"
          icon={<Users className="h-5 w-5 text-slate-400" />}
        />

        <StatCard
          title="Total Teams"
          value={isLoading ? "..." : (data?.teams.total ?? 24)}
          badgeText={`${data?.teams.active ?? 18} active · ${data?.teams.inactive ?? 6} inactive`}
          badgeVariant="neutral"
          subtitle={`${data?.teams.kspl ?? 14} KSPL / ${data?.teams.iscl ?? 10} ISCL`}
          icon={<Shield className="h-5 w-5 text-[#C9A227]" />}
        />

        <StatCard
          title="Staff & Organizers"
          value={isLoading ? "..." : (data?.staffOrganizers.total ?? 302)}
          badgeText={`${data?.staffOrganizers.approvedPct ?? 78.8}% approved`}
          badgeVariant="success"
          subtitle="Verified Personnel"
          icon={<Briefcase className="h-5 w-5 text-slate-400" />}
        />

        <StatCard
          title="Meal Eligibility"
          value={isLoading ? "..." : (data?.mealEligible.count ?? 514)}
          badgeText={data?.mealEligible.isDelayed ? "Sync delayed" : "Gate Synced"}
          badgeVariant={data?.mealEligible.isDelayed ? "warning" : "success"}
          subtitle="Active accreditations"
          icon={<UtensilsCrossed className="h-5 w-5 text-emerald-600" />}
        />
      </div>

      {/* 4 Reports Navigation Grid (2x2) */}
      <div>
        <div className="border-b border-slate-200 pb-3 mb-5">
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Operational Dossiers & Audit Reports
          </h2>
          <p className="text-xs text-slate-500">
            Select an operational report to inspect filtered datasets, examine compliance ratios, or export files.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ReportCard
            config={REPORTS_CONFIG.registration}
            icon={<Users className="h-5 w-5" />}
            onExport={(fmt) => handleHubCardExport("registration", fmt)}
            isExporting={exportingKey?.startsWith("registration-")}
          />

          <ReportCard
            config={REPORTS_CONFIG.team}
            icon={<Shield className="h-5 w-5" />}
            onExport={(fmt) => handleHubCardExport("team", fmt)}
            isExporting={exportingKey?.startsWith("team-")}
          />

          <ReportCard
            config={REPORTS_CONFIG["staff-organizer"]}
            icon={<Briefcase className="h-5 w-5" />}
            onExport={(fmt) => handleHubCardExport("staff-organizer", fmt)}
            isExporting={exportingKey?.startsWith("staff-organizer-")}
          />

          <ReportCard
            config={REPORTS_CONFIG["meal-eligibility"]}
            icon={<UtensilsCrossed className="h-5 w-5" />}
            onExport={(fmt) => handleHubCardExport("meal-eligibility", fmt)}
            isExporting={exportingKey?.startsWith("meal-eligibility-")}
          />
        </div>
      </div>
    </div>
  );
};

export default ReportsHubPage;

