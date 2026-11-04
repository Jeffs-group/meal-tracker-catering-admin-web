import React from "react";
import { Tabs, type TabItem } from "@/components/ui/Tabs";

export interface MemberTypeTabsProps {
  activeType: string;
  onChange: (type: string) => void;
  counts: {
    ALL: number;
    PLAYER: number;
    OWNER: number;
    COACH: number;
    OTHERS: number;
  };
}

export const MemberTypeTabs: React.FC<MemberTypeTabsProps> = ({
  activeType,
  onChange,
  counts,
}) => {
  const tabs: TabItem[] = [
    { id: "ALL", label: "All", count: counts.ALL },
    { id: "PLAYER", label: "Player", count: counts.PLAYER },
    { id: "OWNER", label: "Owner", count: counts.OWNER },
    { id: "COACH", label: "Coach", count: counts.COACH },
    { id: "OTHERS", label: "Others", count: counts.OTHERS },
  ];

  return (
    <Tabs
      tabs={tabs}
      activeTab={activeType}
      onChange={onChange}
      variant="pills"
    />
  );
};

export default MemberTypeTabs;
