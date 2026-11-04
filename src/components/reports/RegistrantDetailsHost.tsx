import React from "react";
import { useSearchParams } from "react-router-dom";
import { RegistrantReviewModal } from "@/components/registrations/RegistrantReviewModal";
import { usePermissions } from "@/hooks/usePermissions";

export const RegistrantDetailsHost: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const registrantId = searchParams.get("registrant");
  const { can } = usePermissions();

  const handleClose = () => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete("registrant");
        return next;
      },
      { replace: true },
    );
  };

  // Only open modal if authorized to view registrations
  if (!registrantId || !can("registrations", "view")) {
    return null;
  }

  return (
    <RegistrantReviewModal
      registrantId={registrantId}
      isOpen={!!registrantId}
      onClose={handleClose}
    />
  );
};

