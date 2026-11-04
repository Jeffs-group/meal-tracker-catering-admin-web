import React from "react";
import { Drawer } from "@/components/ui/Drawer";
import { Button } from "@/components/ui/Button";
import { CheckCircle2, Lock } from "lucide-react";
import { formatTimestampIST, formatDateTimeIST } from "@/utils/cateringClock";
import type { DistributionDetail } from "@/types/catering.types";

export interface DistributionDetailDrawerProps {
  record: DistributionDetail | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DistributionDetailDrawer: React.FC<DistributionDetailDrawerProps> = ({
  record,
  isOpen,
  onClose,
}) => {
  if (!record) return null;

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Audit Dossier • Distribution Receipt"
      subtitle={`Receipt #${record.receiptCode}`}
      headerIndicator={
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
          <CheckCircle2 className="h-4 w-4" />
        </div>
      }
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
            <Lock className="h-3.5 w-3.5 text-slate-400" />
            <span>Append-Only Ledger Record</span>
          </div>
          <Button variant="outline" size="sm" onClick={onClose} className="rounded-xl">
            Close Dossier
          </Button>
        </div>
      }
    >
      <div className="space-y-4 pt-1 text-xs">
        {/* Recipient summary */}
        <div className="rounded-xl border border-slate-200 bg-[#F8F9FA] p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white font-bold text-xs select-none">
              {record.recipientName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">
                {record.recipientName}
              </h4>
              <p className="text-slate-500 mt-0.5">
                {record.registrantId} • {record.recipientDesignation}
              </p>
            </div>
          </div>
          <span className="rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 font-semibold text-slate-700">
            {record.recipientType === "staff" ? "Operational Staff" : "Team Member"}
          </span>
        </div>

        {/* Operational details */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
              Meal Period & Type
            </span>
            <p className="font-bold text-slate-900 capitalize">
              {record.periodKey} Service
            </p>
            <p className="text-slate-500 text-[11px] mt-0.5 capitalize">
              {record.mealType === "veg" ? "Vegetarian (Veg)" : "Non-Vegetarian (Non-Veg)"}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
              Dispatched Time
            </span>
            <p className="font-semibold text-slate-900">
              {formatDateTimeIST(record.providedAt)} IST
            </p>
            <p className="text-slate-500 text-[11px] mt-0.5">
              Method: {record.verificationMethod.toUpperCase()}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
              Dispensed Counter
            </span>
            <p className="font-semibold text-slate-900 truncate">
              {record.counterName}
            </p>
            <p className="text-slate-500 text-[11px] mt-0.5 truncate">
              {record.counterTerminal} • {record.counterGate}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
              Dispensing Host
            </span>
            <p className="font-semibold text-slate-900 truncate">
              {record.operatorName}
            </p>
            <p className="text-slate-500 text-[11px] mt-0.5">
              Role: {record.operatorRole}
            </p>
          </div>
        </div>

        {/* Audit trail */}
        <div className="pt-2">
          <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">
            Ledger Audit Trail
          </h4>
          <div className="space-y-2">
            {record.auditTrail?.map((evt, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 flex items-start gap-2.5"
              >
                <div className="h-2 w-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-slate-800">{evt.event}</p>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {formatTimestampIST(evt.timestamp)}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Actor: {evt.actor} • {evt.details}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Drawer>
  );
};

export default DistributionDetailDrawer;
