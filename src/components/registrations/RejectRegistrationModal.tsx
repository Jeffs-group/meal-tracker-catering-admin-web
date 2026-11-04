import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { AlertCircle, Lock, CircleSlash, Check } from "lucide-react";
import type { RegistrantDetail } from "@/types/registration.types";

export interface RejectRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  registrant: RegistrantDetail | null;
  onConfirmReject: (
    category: string,
    remarks: string,
    sendEmail: boolean,
  ) => Promise<void>;
  isSubmitting?: boolean;
}

const REJECTION_CATEGORIES = [
  {
    value: "Incompatible / Blurry Photo Identification",
    label: "Incompatible / Blurry Photo Identification",
  },
  {
    value: "Mismatched Government ID Credential",
    label: "Mismatched Government ID Credential",
  },
  {
    value: "Unverified Age / Proof of Date of Birth",
    label: "Unverified Age / Proof of Date of Birth",
  },
  {
    value: "Duplicate Tournament Roster Registration",
    label: "Duplicate Tournament Roster Registration",
  },
  {
    value: "Unauthorized Franchise Designation",
    label: "Unauthorized Franchise Designation",
  },
  {
    value: "Disciplinary / Tournament Blacklist",
    label: "Disciplinary / Tournament Blacklist",
  },
];

export const RejectRegistrationModal: React.FC<
  RejectRegistrationModalProps
> = ({ isOpen, onClose, registrant, onConfirmReject, isSubmitting = false }) => {
  const [category, setCategory] = useState(
    "Incompatible / Blurry Photo Identification",
  );
  const [remarks, setRemarks] = useState(
    "Uploaded portrait does not comply with official accreditation criteria (photo resolution < 600px and face partially obscured). Government ID name does not match submitted name.",
  );
  const [sendEmail, setSendEmail] = useState(true);

  if (!isOpen || !registrant) return null;

  const initials = registrant.fullName
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleConfirm = async () => {
    if (!remarks.trim()) return;
    await onConfirmReject(category, remarks.trim(), sendEmail);
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
        {/* Header with Red Exclamation Circle */}
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#DC2626] text-white shrink-0 shadow-xs mt-0.5">
            <AlertCircle className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
              Reject Registration Application
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-normal">
              Application will be flagged as rejected and the applicant notified
              immediately.
            </p>
          </div>
        </div>

        {/* Applicant Summary Card */}
        <div className="rounded-lg border border-slate-100 bg-[#F8F9FA] p-2.5 flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-slate-700 font-bold text-[11px] shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-slate-900 truncate">
                {registrant.fullName}
              </span>
              <span className="font-mono text-[10px] font-semibold bg-slate-200/90 text-slate-700 px-1.5 py-0.5 rounded">
                {registrant.applicationId || registrant.registrantId}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 truncate mt-0.5">
              {registrant.teamName || registrant.attributes.franchiseAndDivision}
            </p>
          </div>
        </div>

        {/* Primary Reason Category Dropdown */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-900">
              PRIMARY REASON CATEGORY <span className="text-rose-500">*</span>
            </label>
            <span className="text-[10px] text-slate-400 font-normal">
              Mandatory compliance
            </span>
          </div>

          <Select
            fullWidth
            options={REJECTION_CATEGORIES}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
        </div>

        {/* Admin Findings & Rejection Remarks Textarea */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-900">
              ADMIN FINDINGS & REJECTION REMARKS{" "}
              <span className="text-rose-500">*</span>
            </label>
            <span className="font-mono text-[10px] text-slate-400">
              {remarks.length} / 500
            </span>
          </div>

          <textarea
            value={remarks}
            maxLength={500}
            onChange={(e) => setRemarks(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-700 leading-relaxed shadow-2xs focus:border-[#C9A227] focus:outline-none focus:ring-1 focus:ring-[#C9A227]"
            placeholder="Specify reason for application rejection..."
          />

          <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-500">
            <Lock className="h-3 w-3 text-slate-400 shrink-0" />
            <span>Injected verbatim into the official email notification.</span>
          </div>
        </div>

        {/* Email Rejection Notice Checkbox Card */}
        <div className="rounded-lg border border-slate-100 bg-[#F8F9FA] p-2.5 flex items-start gap-2.5">
          <button
            type="button"
            onClick={() => setSendEmail((prev) => !prev)}
            className={`flex h-3.5 w-3.5 items-center justify-center rounded border transition-colors mt-0.5 cursor-pointer shrink-0 ${
              sendEmail
                ? "border-[#C9A227] bg-[#C9A227] text-white"
                : "border-slate-300 bg-white text-transparent"
            }`}
          >
            <Check className="h-2.5 w-2.5 stroke-[3]" />
          </button>

          <div className="flex-1 text-[11px]">
            <p
              onClick={() => setSendEmail((prev) => !prev)}
              className="font-bold text-slate-900 cursor-pointer select-none"
            >
              Send rejection notice and document re-submission link via email
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5 leading-normal">
              Dispatches template notice to{" "}
              <strong className="font-semibold text-slate-700">
                {registrant.attributes.emailAddress}
              </strong>
              .
            </p>
          </div>
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
            Cancel / Keep Reviewing
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleConfirm}
            isLoading={isSubmitting}
            disabled={!remarks.trim()}
            className="h-8 px-3.5 text-xs font-semibold bg-[#B91C1C] hover:bg-[#991B1B] text-white shadow-2xs rounded-lg"
            leftIcon={<CircleSlash className="h-3.5 w-3.5" />}
          >
            Confirm Rejection
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default RejectRegistrationModal;
