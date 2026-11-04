import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import {
  ShieldAlert,
  AlertTriangle,
  QrCode,
  Utensils,
  MinusCircle,
  Check,
} from "lucide-react";
import type { RegistrantDetail } from "@/types/registration.types";

export interface RevokePassModalProps {
  isOpen: boolean;
  onClose: () => void;
  registrant: RegistrantDetail | null;
  onConfirmRevoke: (reason: string, notes: string) => Promise<void>;
  isSubmitting?: boolean;
}

const REVOCATION_REASONS = [
  {
    value: "",
    label: "Select an audited revocation reason...",
  },
  {
    value: "Accreditation Misuse / Pass Sharing",
    label: "Accreditation Misuse / Pass Sharing",
  },
  {
    value: "Disciplinary Suspension / Venue Ejection",
    label: "Disciplinary Suspension / Venue Ejection",
  },
  {
    value: "Tournament Roster Replacement",
    label: "Tournament Roster Replacement",
  },
  {
    value: "Administrative Request / Security Hold",
    label: "Administrative Request / Security Hold",
  },
  {
    value: "Lost / Compromised Accreditation Badge",
    label: "Lost / Compromised Accreditation Badge",
  },
];

export const RevokePassModal: React.FC<RevokePassModalProps> = ({
  isOpen,
  onClose,
  registrant,
  onConfirmRevoke,
  isSubmitting = false,
}) => {
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  if (!isOpen || !registrant) return null;

  const registrantDisplayId =
    registrant.accreditation?.registrantId || registrant.registrantId;

  const handleConfirm = async () => {
    if (!confirmed || !reason) return;
    await onConfirmRevoke(reason, notes);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      className="p-0 overflow-hidden"
    >
      <div className="p-4 sm:p-5 space-y-3.5">
        {/* Header with Red Shield Icon */}
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-50 border border-rose-200 text-rose-700 shrink-0 mt-0.5">
            <ShieldAlert className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
              Revoke Accreditation & Meal Pass
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-normal">
              This action immediately deactivates digital credentials and
              catering gate access.
            </p>
          </div>
        </div>

        {/* Registrant Profile Summary Card */}
        <div className="rounded-lg border border-slate-100 bg-[#F8F9FA] p-3">
          <div className="flex items-center gap-2.5">
            <div className="relative h-9 w-9 rounded-full overflow-hidden border border-slate-200 shrink-0 bg-white">
              <img
                src={registrant.photo.previewUrl}
                alt={registrant.fullName}
                className="h-full w-full object-cover"
              />
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-rose-600 border-2 border-white" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-bold text-slate-900 truncate">
                  {registrant.fullName}
                </span>
                <span className="bg-[#FAF4E6] text-[#9B7415] text-[10px] font-semibold px-1.5 py-0.5 rounded">
                  {registrant.roleTitle || "Player XI"}
                </span>
              </div>
              <p className="text-[11px] font-mono text-slate-600 mt-0.5">
                ID: <span className="font-bold">{registrantDisplayId}</span>
              </p>
            </div>
          </div>

          {/* Tokens status inner row */}
          <div className="mt-2.5 rounded-md border border-slate-200/70 bg-white p-2 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5 font-medium text-slate-700">
              <QrCode className="h-3 w-3 text-[#C9A227]" />
              <span>Active QR Code</span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-slate-600 font-medium">
                <Utensils className="h-3 w-3 text-[#C9A227]" />
                <span>3 Used / 12 Meals Remaining</span>
              </div>
              <div className="w-10 h-1.5 rounded-full bg-slate-200 overflow-hidden shrink-0">
                <div
                  className="h-full bg-[#C9A227] rounded-full"
                  style={{ width: "25%" }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Immediate Operational Effects Banner */}
        <div className="rounded-lg border border-rose-100 bg-rose-50/70 p-3 text-[11px] space-y-1.5">
          <div className="flex items-center gap-1.5 text-rose-700 font-bold uppercase tracking-wider text-[10px]">
            <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
            <span>IMMEDIATE OPERATIONAL EFFECTS</span>
          </div>

          <ul className="space-y-1 text-slate-700 pl-0.5">
            <li className="flex items-start gap-1.5 leading-relaxed">
              <span className="text-rose-500 font-bold">•</span>
              <span>
                The registrant&apos;s{" "}
                <strong className="font-bold text-slate-900">
                  active QR code and catering credentials
                </strong>{" "}
                will be invalidated instantly across all turnstiles and catering
                terminal scanners.
              </span>
            </li>
            <li className="flex items-start gap-1.5 leading-relaxed">
              <span className="text-rose-500 font-bold">•</span>
              <span>
                Digital wallet pass access will display a real-time{" "}
                <strong className="font-bold text-rose-700">Revoked</strong>{" "}
                watermark.
              </span>
            </li>
            <li className="flex items-start gap-1.5 leading-relaxed">
              <span className="text-rose-500 font-bold">•</span>
              <span>
                Status will revert to{" "}
                <code className="rounded bg-slate-200/80 px-1 py-0.5 text-[10px] font-mono text-slate-800">
                  Inactive / Revoked
                </code>
                .
              </span>
            </li>
          </ul>
        </div>

        {/* Reason for Revocation Dropdown */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-900 mb-1">
            REASON FOR REVOCATION <span className="text-rose-500">*</span>
          </label>
          <Select
            fullWidth
            options={REVOCATION_REASONS}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>

        {/* Internal Audit & Security Notes */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-900">
              INTERNAL AUDIT & SECURITY NOTES{" "}
              <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider">
              Encrypted HQ Log
            </span>
          </div>

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs text-slate-700 leading-relaxed shadow-2xs focus:border-[#C9A227] focus:outline-none focus:ring-1 focus:ring-[#C9A227]"
            placeholder="Specify incident ticket ID, authorization contact, or badge reassignment notes..."
          />
        </div>

        {/* Confirmation Checkbox Card */}
        <div className="rounded-lg border border-slate-200/80 bg-[#F8F9FA] p-2.5 flex items-start gap-2.5">
          <button
            type="button"
            onClick={() => setConfirmed((prev) => !prev)}
            className={`flex h-3.5 w-3.5 items-center justify-center rounded border transition-colors mt-0.5 cursor-pointer shrink-0 ${
              confirmed
                ? "border-rose-600 bg-rose-600 text-white"
                : "border-slate-300 bg-white text-transparent"
            }`}
          >
            <Check className="h-2.5 w-2.5 stroke-[3]" />
          </button>

          <p
            onClick={() => setConfirmed((prev) => !prev)}
            className="text-[11px] font-medium text-slate-800 cursor-pointer select-none leading-relaxed"
          >
            I confirm that I want to revoke accreditation for{" "}
            <strong className="font-bold text-slate-900">
              {registrant.fullName}
            </strong>{" "}
            and immediately disable tournament catering access across all gates
            and POS points.
          </p>
        </div>

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
            className="h-8 px-3.5 text-xs font-semibold text-slate-700 border-slate-200 hover:bg-slate-50 rounded-lg"
          >
            Cancel
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={handleConfirm}
            isLoading={isSubmitting}
            disabled={!confirmed || !reason}
            className={`h-8 px-3.5 text-xs font-semibold rounded-lg transition-all ${
              confirmed && reason
                ? "bg-[#BE123C] hover:bg-[#9F1239] text-white shadow-xs cursor-pointer"
                : "bg-[#E5A8A8] text-white opacity-70 cursor-not-allowed"
            }`}
            leftIcon={<MinusCircle className="h-3.5 w-3.5" />}
          >
            Revoke Approval
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default RevokePassModal;
