import React from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { ShieldCheck, CheckCircle2 } from "lucide-react";
import { CATERING_RULES } from "@/constants/catering";

export interface ProtocolDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProtocolDialog: React.FC<ProtocolDialogProps> = ({
  isOpen,
  onClose,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Catering Ledger & Integrity Protocol"
      subtitle="Operational rules, duplicate prevention architecture, and matchday standards."
      maxWidth="lg"
      footer={
        <Button variant="primary" size="sm" onClick={onClose} className="rounded-xl">
          Understood & Acknowledged
        </Button>
      }
    >
      <div className="p-5 space-y-4">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5 flex items-center gap-3">
          <ShieldCheck className="h-6 w-6 text-emerald-600 shrink-0" />
          <div className="text-xs text-emerald-900 leading-relaxed">
            <strong>System Reconciliation Status: Reconciled & Synchronized</strong>
            <p className="text-emerald-700 mt-0.5">
              Operating rules are enforced at database and server tier across all matchday counters.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {CATERING_RULES.map((rule, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs text-xs"
            >
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="h-4 w-4 text-[#C9A227] shrink-0" />
                <h4 className="font-bold text-slate-900">{rule.title}</h4>
              </div>
              <p className="text-slate-600 leading-relaxed pl-6">{rule.description}</p>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
};

export default ProtocolDialog;

