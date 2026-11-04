import React from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Tabs, type TabItem } from "@/components/ui/Tabs";
import { Button } from "@/components/ui/Button";
import { TeamsTab } from "./tabs/TeamsTab";
import { StaffsTab } from "./tabs/StaffsTab";
import { OrganizersTab } from "./tabs/OrganizersTab";
import { useTableFilters } from "@/hooks/useTableFilters";
import { useTeams, useStaffs, useOrganizers } from "@/hooks/useRegistrations";
import { Download, Users, Briefcase, Award } from "lucide-react";

export const RegistrationsPage: React.FC = () => {
  const { tab, setTab } = useTableFilters({ tab: "teams" });

  // Get total counts for tab badges
  const { data: teamsData } = useTeams({ pageSize: 1 });
  const { data: staffsData } = useStaffs({ pageSize: 1 });
  const { data: organizersData } = useOrganizers({ pageSize: 1 });

  const tabs: TabItem[] = [
    {
      id: "teams",
      label: "Teams",
      count: teamsData?.pagination.total ?? 5,
      icon: <Users className="h-4 w-4" />,
    },
    {
      id: "staffs",
      label: "Staffs",
      count: staffsData?.result.pagination.total ?? 5,
      icon: <Briefcase className="h-4 w-4" />,
    },
    {
      id: "organizers",
      label: "Organizers",
      count: organizersData?.result.pagination.total ?? 4,
      icon: <Award className="h-4 w-4" />,
    },
  ];

  const handleExportCurrentTab = () => {
    alert(`Exporting ${tab.toUpperCase()} roster dataset.`);
  };

  return (
    <div>
      <PageHeader
        title="Registrations & Access Allocation"
        description="Review tournament franchise delegations, operational staff members, and organizer credentials."
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Registrations" },
        ]}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCurrentTab}
            leftIcon={<Download className="h-4 w-4" />}
          >
            Export CSV
          </Button>
        }
      />

      {/* Tabs Navigation */}
      <div className="mb-6">
        <Tabs tabs={tabs} activeTab={tab} onChange={setTab} />
      </div>

      {/* Tab Panels */}
      <div>
        {tab === "teams" && <TeamsTab />}
        {tab === "staffs" && <StaffsTab />}
        {tab === "organizers" && <OrganizersTab />}
      </div>
    </div>
  );
};

export default RegistrationsPage;
