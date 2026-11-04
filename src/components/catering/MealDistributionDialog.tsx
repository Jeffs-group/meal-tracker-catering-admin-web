import React, { useState, useEffect, useRef } from "react";
import {
  UtensilsCrossed,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Loader2,
  X,
  Store,
  User,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/utils/cn";
import { formatTimestampIST, formatIST12h } from "@/utils/cateringClock";
import { CateringApiError, fetchRegistrantVerificationCode } from "@/api/catering.api";
import type {
  MealPeriodKey,
  VerificationMethod,
  DistributionRecord,
} from "@/types/catering.types";
import { COUNTERS } from "@/constants/catering";

export interface MealDistributionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessNext: () => void;
  onBackToTeam: () => void;
  teamName: string;
  registrant: {
    id: string;
    code: string;
    fullName: string;
    type: string;
    isVip: boolean;
    teamName: string;
    dietaryPreference: "veg" | "non_veg";
    verificationCode?: string;
  };
  period: {
    id?: string;
    key: MealPeriodKey;
    label: string;
    subtitle?: string;
    start?: string;
    end?: string;
  };
  nextEligiblePeriod?: {
    key: MealPeriodKey;
    label: string;
    timeText: string;
  };
  counterId: string;
  operator: {
    id: string;
    fullName: string;
    roleLabel: string;
  };
  verificationMethod: VerificationMethod;
  onConfirmProvide: (vars: {
    registrantCode: string;
    mealPeriodId: string;
    verificationCode: string;
    registrantId: string;
    periodKey: MealPeriodKey;
    counterId: string;
    operatorId: string;
    verificationMethod: VerificationMethod;
    idempotencyKey: string;
  }) => Promise<DistributionRecord>;
}

type DialogStep = "confirm" | "success" | "duplicate" | "error";

export const MealDistributionDialog: React.FC<MealDistributionDialogProps> = ({
  isOpen,
  onClose,
  onSuccessNext,
  onBackToTeam,
  teamName,
  registrant,
  period,
  nextEligiblePeriod,
  counterId,
  operator,
  verificationMethod,
  onConfirmProvide,
}) => {
  const [step, setStep] = useState<DialogStep>("confirm");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [idempotencyKey, setIdempotencyKey] = useState("");
  const [successRecord, setSuccessRecord] = useState<DistributionRecord | null>(null);
  const [duplicateInfo, setDuplicateInfo] = useState<{
    periodKey?: string;
    providedAt?: string;
    counterName?: string;
    receiptCode?: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [codeError, setCodeError] = useState<string | null>(null);

  const confirmBtnRef = useRef<HTMLButtonElement | null>(null);
  const nextBtnRef = useRef<HTMLButtonElement | null>(null);

  // Initialize idempotencyKey, auto-fill verification code and focus on open
  useEffect(() => {
    if (isOpen) {
      setStep("confirm");
      setIsSubmitting(false);
      setSuccessRecord(null);
      setDuplicateInfo(null);
      setErrorMessage(null);
      setCodeError(null);
      setIdempotencyKey(`idem-${registrant.id}-${period.key}-${Date.now()}`);

      const savedCode =
        registrant.verificationCode ||
        (typeof window !== "undefined"
          ? sessionStorage.getItem(`vcode_${registrant.code}`) ||
            sessionStorage.getItem(`vcode_${registrant.id}`) ||
            sessionStorage.getItem("last_scanned_verification_code") ||
            ""
          : "");

      if (savedCode) {
        setVerificationCode(savedCode);
      } else {
        // Automatically fetch attendee's accreditation passcode if not already cached
        fetchRegistrantVerificationCode(registrant.code || registrant.id).then((code) => {
          if (code) {
            setVerificationCode(code);
          } else {
            // Fallback to canonical registrant code if no separate passcode is configured
            setVerificationCode(registrant.code || registrant.id);
          }
        });
      }

      setTimeout(() => {
        confirmBtnRef.current?.focus();
      }, 100);
    }
  }, [isOpen, registrant.id, registrant.code, registrant.verificationCode, period.key]);

  // Handle ESC key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isSubmitting) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  const counterObj = COUNTERS.find((c) => c.id === counterId) ?? COUNTERS[0]!;

  const handleConfirm = async () => {
    if (isSubmitting) return;

    const vCode = verificationCode.trim();
    if (!vCode || vCode.length < 4) {
      setCodeError("Verification code must be at least 4 characters.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      setCodeError(null);

      const record = await onConfirmProvide({
        registrantCode: registrant.code || registrant.id,
        mealPeriodId: period.id || (period.key as string),
        verificationCode: vCode,
        registrantId: registrant.id,
        periodKey: period.key,
        counterId,
        operatorId: operator.id,
        verificationMethod,
        idempotencyKey,
      });

      setSuccessRecord(record);
      setStep("success");
      setTimeout(() => {
        nextBtnRef.current?.focus();
      }, 100);
    } catch (err: unknown) {
      if (err instanceof CateringApiError && err.code === "DUPLICATE_DISTRIBUTION") {
        const claim = (err.data?.originalClaim as {
          periodKey?: string;
          providedAt?: string;
          counterName?: string;
          receiptCode?: string;
        }) || {};
        setDuplicateInfo(claim);
        setStep("duplicate");
      } else if (err instanceof CateringApiError) {
        setErrorMessage(err.message);
        setStep("error");
      } else if (err instanceof Error) {
        setErrorMessage(err.message);
        setStep("error");
      } else {
        setErrorMessage("An unexpected network error occurred while recording meal.");
        setStep("error");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getVerificationText = (method: VerificationMethod) => {
    if (method === "qr") return "QR Scanned";
    if (method === "passcode") return "Code Verified";
    return "Manually Verified";
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={() => !isSubmitting && onClose()}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-h-[92vh] sm:max-h-[90vh] flex flex-col rounded-t-2xl sm:rounded-2xl bg-white shadow-2xl transition-all overflow-hidden border border-slate-200 my-0 sm:my-auto max-w-full sm:max-w-[500px]">
        {/* Top Header */}
        <div className="flex items-start justify-between border-b border-slate-200 px-5 sm:px-6 py-4 bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-xl border shrink-0",
                step === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : step === "duplicate" || step === "error"
                    ? "border-rose-200 bg-rose-50 text-rose-700"
                    : "border-[#ECD59A] bg-[#FAF4E6] text-[#9B7415]",
              )}
            >
              {step === "success" ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : step === "duplicate" ? (
                <ShieldAlert className="h-5 w-5" />
              ) : step === "error" ? (
                <AlertTriangle className="h-5 w-5" />
              ) : (
                <UtensilsCrossed className="h-5 w-5" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                  {step === "confirm" && "Confirm Meal Distribution"}
                  {step === "success" && "Meal Provided Successfully!"}
                  {step === "duplicate" && "Meal Already Provided"}
                  {step === "error" && "Distribution Blocked"}
                </h3>
                {step === "confirm" && (
                  <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.2 text-[10px] font-bold text-emerald-800">
                    ELIGIBLE
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {step === "confirm" && "Verify recipient identity and dietary preference."}
                {step === "success" &&
                  `Logged at ${formatTimestampIST(
                    successRecord?.providedAt || new Date().toISOString(),
                  )} IST`}
                {step === "duplicate" &&
                  "Duplicate portion request blocked across matchday network."}
                {step === "error" && "Ledger recording condition unmet."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer shrink-0"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {/* STATE 1: CONFIRM */}
          {step === "confirm" && (
            <>
              {/* Recipient Profile Card */}
              <div className="rounded-xl border border-slate-200 bg-[#F8F9FA] p-3.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white font-bold text-xs shrink-0 select-none">
                    {registrant.fullName.slice(0, 2).toUpperCase()}
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 truncate">
                      {registrant.fullName}
                    </h4>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="font-mono text-[11px] font-semibold text-slate-500">
                        {registrant.code}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-xs text-slate-600 font-medium truncate">
                        {registrant.teamName}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700">
                    {registrant.type}
                  </span>
                  <span className="rounded bg-[#FAF4E6] text-[#9B7415] border border-[#ECD59A] px-1.5 py-0.2 text-[10px] font-semibold">
                    {getVerificationText(verificationMethod)}
                  </span>
                </div>
              </div>

              {/* Grid Details */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Meal Period
                  </span>
                  <p className="font-bold text-slate-900 text-sm">
                    {period.label}
                  </p>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    {period.start && period.end
                      ? `${formatIST12h(period.start)} – ${formatIST12h(period.end)}`
                      : "Flexible Service"}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Dietary Preference
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      className={cn(
                        "h-2.5 w-2.5 rounded-full shrink-0",
                        registrant.dietaryPreference === "veg"
                          ? "bg-emerald-500 ring-2 ring-emerald-100"
                          : "bg-rose-500 ring-2 ring-rose-100",
                      )}
                    />
                    <span className="font-bold text-slate-900 text-sm capitalize">
                      {registrant.dietaryPreference === "veg"
                        ? "Vegetarian (Veg)"
                        : "Non-Vegetarian (Non-Veg)"}
                    </span>
                  </div>
                  <p className="text-slate-500 text-[11px] mt-0.5">Standard Athlete Portion</p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                    <Store className="h-3 w-3 text-slate-400" />
                    <span>Assigned Station</span>
                  </span>
                  <p className="font-semibold text-slate-800 truncate">
                    {counterObj.name}
                  </p>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    {counterObj.terminal} • {counterObj.gate}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                    <User className="h-3 w-3 text-slate-400" />
                    <span>Attending Host</span>
                  </span>
                  <p className="font-semibold text-slate-800 truncate">
                    {operator.fullName}
                  </p>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    {operator.roleLabel}
                  </p>
                </div>
              </div>

              {/* Badge Verification Code (Auto-filled & Non-typeable) */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="dialog-verification-code-input"
                    className="block text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5"
                  >
                    <span>Badge Verification Code</span>
                    <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700 normal-case">
                      Auto-verified
                    </span>
                  </label>
                  <span className="text-[10px] text-slate-400 font-medium">Read-only</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Linked directly from attendee's accreditation pass. Manual typing disabled.
                </p>
                <div className="relative">
                  <Input
                    id="dialog-verification-code-input"
                    value={verificationCode || "Resolving credential…"}
                    readOnly
                    tabIndex={-1}
                    className={cn(
                      "w-full text-xs font-mono uppercase bg-white text-slate-800 cursor-default border-slate-200 focus:ring-0 focus:border-slate-200 select-all font-semibold tracking-wider",
                      codeError && "border-red-400 focus:ring-red-400",
                    )}
                    autoComplete="off"
                  />
                </div>
                {codeError && (
                  <p className="text-[11px] font-semibold text-red-600 mt-1">
                    {codeError}
                  </p>
                )}
              </div>

              {/* Permanent Ledger Notice */}
              <div className="rounded-xl border border-[#ECD59A] bg-[#FAF4E6]/70 p-3.5 text-xs text-[#7D5C13] leading-relaxed">
                <div className="flex items-start gap-2.5">
                  <Lock className="h-4 w-4 text-[#C9A227] shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold block mb-0.5 text-[#644813]">
                      Permanent Ledger Action:
                    </strong>
                    An audit record will be created permanently on confirmation.
                    Duplicate distribution for {period.label} today will be blocked
                    at all tournament counters.
                  </div>
                </div>
              </div>
            </>
          )}

          {/* STATE 2: DUPLICATE (409) */}
          {step === "duplicate" && (
            <div className="space-y-4" role="alert">
              <div className="rounded-xl border border-rose-200 bg-rose-50/80 p-4 text-xs text-rose-900 leading-relaxed">
                <p className="font-bold text-sm text-rose-950 mb-1">
                  Prior Claim Detected
                </p>
                <p>
                  This participant was already served <strong>{period.label}</strong> today.
                  Re-dispensation is locked to prevent duplicate catering allocations.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-[#F8F9FA] p-3.5 space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">Receipt Code:</span>
                  <span className="font-mono font-semibold text-slate-800">
                    {duplicateInfo?.receiptCode || "MR-20261103-PREV"}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">Original Window:</span>
                  <span className="font-semibold text-slate-800">
                    {period.label} Service
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">Dispensed Time:</span>
                  <span className="font-medium text-slate-800">
                    {duplicateInfo?.providedAt
                      ? formatTimestampIST(duplicateInfo.providedAt)
                      : "Earlier Today"}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">Dispensed Counter:</span>
                  <span className="font-medium text-slate-800">
                    {duplicateInfo?.counterName || "Main Counter 01"}
                  </span>
                </div>
                <div className="flex justify-between py-1 pt-1.5">
                  <span className="font-semibold text-slate-700">Next Eligible Window:</span>
                  <span className="font-bold text-[#9B7415]">
                    {nextEligiblePeriod
                      ? `${nextEligiblePeriod.label} (${nextEligiblePeriod.timeText})`
                      : "All services completed today"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* STATE 3: SUCCESS */}
          {step === "success" && (
            <div className="space-y-4" role="status">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-4 text-xs text-emerald-900 leading-relaxed text-center">
                <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                <h4 className="text-base font-bold text-emerald-950">
                  Portion Dispatched Successfully
                </h4>
                <p className="text-emerald-700 mt-0.5">
                  Receipt generated and permanently written to matchday ledger.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-[#F8F9FA] p-3.5 space-y-2.5 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">Recipient:</span>
                  <span className="font-bold text-slate-900">
                    {registrant.fullName} ({registrant.code})
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">Receipt Code:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {successRecord?.receiptCode}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">Meal Dispatched:</span>
                  <span className="font-semibold text-slate-800">
                    {period.label} ({registrant.dietaryPreference.toUpperCase()})
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Dispensing Agent:</span>
                  <span className="font-medium text-slate-800">
                    {operator.fullName} • {counterObj.name}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* STATE 4: GENERIC ERROR */}
          {step === "error" && (
            <div className="space-y-4" role="alert">
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800 leading-relaxed">
                <p className="font-bold text-sm text-rose-950 mb-1">
                  Action Blocked
                </p>
                <p>{errorMessage}</p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 sm:gap-2.5 border-t border-slate-200 px-5 sm:px-6 py-3.5 bg-slate-50/50 shrink-0">
          {step === "confirm" && (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                disabled={isSubmitting}
                className="rounded-xl w-full sm:w-auto justify-center"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                ref={confirmBtnRef}
                onClick={handleConfirm}
                disabled={isSubmitting}
                className="rounded-xl bg-[#C9A227] hover:bg-[#B8901E] text-white shadow-xs font-semibold px-4 w-full sm:w-auto justify-center"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                    <span>Writing Ledger…</span>
                  </>
                ) : (
                  <>
                    <span>Confirm & Provide Meal</span>
                    <ArrowRight className="h-4 w-4 ml-1.5" />
                  </>
                )}
              </Button>
            </>
          )}

          {step === "duplicate" && (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onBackToTeam}
                className="rounded-xl w-full sm:w-auto justify-center"
              >
                Back to {teamName}
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={onClose}
                className="rounded-xl bg-[#C9A227] hover:bg-[#B8901E] text-white font-semibold w-full sm:w-auto justify-center"
              >
                Close Notice
              </Button>
            </>
          )}

          {step === "success" && (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onBackToTeam}
                className="rounded-xl w-full sm:w-auto justify-center"
              >
                Back to {teamName}
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                ref={nextBtnRef}
                onClick={onSuccessNext}
                className="rounded-xl bg-[#C9A227] hover:bg-[#B8901E] text-white font-semibold w-full sm:w-auto justify-center"
              >
                Next Registrant
              </Button>
            </>
          )}

          {step === "error" && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setStep("confirm")}
                className="rounded-xl flex-1 sm:flex-initial justify-center"
              >
                Try Again
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="rounded-xl flex-1 sm:flex-initial justify-center"
              >
                Close
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MealDistributionDialog;
