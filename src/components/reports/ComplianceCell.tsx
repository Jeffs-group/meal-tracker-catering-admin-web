import React from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { cn } from "@/utils/cn";
import { COMPLIANCE_THRESHOLD } from "@/constants/reports";

export interface ComplianceCellProps {
  compliancePct: number;
  isBelowThreshold: boolean;
  className?: string;
}

export const ComplianceCell: React.FC<ComplianceCellProps> = ({
  compliancePct,
  isBelowThreshold,
  className,
}) => {
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <span
        className={cn(
          "font-bold font-mono text-xs",
          isBelowThreshold ? "text-amber-700" : "text-slate-900",
        )}
      >
        {compliancePct}%
      </span>

      {isBelowThreshold ? (
        <span
          className="inline-flex items-center text-amber-600"
          title={`Below operational compliance threshold (${COMPLIANCE_THRESHOLD}% minimum approved roster required)`}
        >
          <AlertTriangle className="h-3.5 w-3.5 text-amber-500" aria-label="Below compliance threshold" />
        </span>
      ) : (
        <span
          className="inline-flex items-center text-emerald-600"
          title={`Meets compliance threshold (≥${COMPLIANCE_THRESHOLD}%)`}
        >
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" aria-label="Compliant" />
        </span>
      )}
    </div>
  );
};

