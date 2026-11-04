import React from "react";
import { Toggle } from "@/components/ui/Toggle";
import type { RegistrationStatus } from "@/types/common.types";

export interface MealEligibilityToggleProps {
  checked: boolean;
  status: RegistrationStatus;
  teamActive?: boolean;
  onToggle: () => void;
  isLoading?: boolean;
}

export const MealEligibilityToggle: React.FC<MealEligibilityToggleProps> = ({
  checked,
  status,
  teamActive = true,
  onToggle,
  isLoading = false,
}) => {
  const isApproved = status === "APPROVED";

  // Determine disable reason
  let disabledReason = "";
  let isDisabled = false;

  if (!isApproved) {
    isDisabled = true;
    disabledReason =
      "Meal eligibility requires an Approved registration status.";
  } else if (!teamActive) {
    isDisabled = true;
    disabledReason =
      "Meal access is suspended because the franchise team is Inactive.";
  }

  return (
    <div className="flex items-center gap-2">
      <Toggle
        size="sm"
        checked={checked && isApproved && teamActive}
        onChange={onToggle}
        disabled={isDisabled || isLoading}
        tooltip={
          disabledReason || (checked ? "Active meal allocation" : "Inactive")
        }
      />
      <span
        className={`text-xs font-medium ${
          checked && isApproved && teamActive
            ? "text-emerald-700"
            : "text-slate-400"
        }`}
      >
        {checked && isApproved && teamActive ? "Active" : "Inactive"}
      </span>
    </div>
  );
};

export default MealEligibilityToggle;
