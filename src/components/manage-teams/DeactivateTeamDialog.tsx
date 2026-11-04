import React, { useState, useEffect, useRef } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Ban,
  CheckCircle2,
  X,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { StatusPill } from "@/components/ui/StatusPill";
import { DEACTIVATION_REASONS } from "@/constants/leagues";
import type { Team } from "@/types/team.types";
import { cn } from "@/utils/cn";

export interface DeactivateTeamDialogProps {
  isOpen: boolean;
  mode: "deactivate" | "reactivate";
  team: Team | null;
  onClose: () => void;
  onConfirmDeactivate: (reason: string, notes?: string) => Promise<void>;
  onConfirmReactivate: (notes?: string) => Promise<void>;
  isSubmitting?: boolean;
}

export const DeactivateTeamDialog: React.FC<DeactivateTeamDialogProps> = ({
  isOpen,
  mode,
  team,
  onClose,
  onConfirmDeactivate,
  onConfirmReactivate,
  isSubmitting = false,
}) => {
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [apiError, setApiError] = useState<string | null>(null);
  const cancelButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setReason("");
      setNotes("");
      setApiError(null);
      // Safe default: initial focus to Cancel
      setTimeout(() => {
        cancelButtonRef.current?.focus();
      }, 80);
    }
  }, [isOpen, mode]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isSubmitting) {
        onClose();
      }
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen || !team) return null;

  const isDeactivate = mode === "deactivate";

  const handleConfirm = async () => {
    if (isDeactivate && !reason) return;
    if (isDeactivate && reason === "Other" && !notes.trim()) return;

    try {
      setApiError(null);
      if (isDeactivate) {
        await onConfirmDeactivate(reason, notes.trim() || undefined);
      } else {
        await onConfirmReactivate(notes.trim() || undefined);
      }
      onClose();
    } catch (err) {
      if (err instanceof Error) {
        setApiError(err.message);
      } else {
        setApiError("An unexpected error occurred.");
      }
    }
  };

  const reasonOptions = [
    { value: "", label: "Select an audited reason…" },
    ...DEACTIVATION_REASONS.map((r) => ({
      value: r.value,
      label: r.label,
    })),
  ];

  const isDeactivateDisabled =
    !reason || (reason === "Other" && !notes.trim()) || isSubmitting;

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="deactivate-dialog-title"
      aria-describedby="deactivate-dialog-description"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={() => !isSubmitting && onClose()}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div className="relative w-full max-h-[92vh] sm:max-h-[90vh] flex flex-col rounded-t-2xl sm:rounded-2xl bg-white shadow-2xl transition-all overflow-hidden border border-slate-200 my-0 sm:my-auto max-w-full sm:max-w-[520px]">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-200 px-5 sm:px-6 py-4 bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-xl border shrink-0",
                isDeactivate
                  ? "border-rose-200 bg-rose-50 text-rose-700"
                  : "border-emerald-200 bg-emerald-50 text-emerald-700",
              )}
            >
              {isDeactivate ? (
                <ShieldAlert className="h-5 w-5" />
              ) : (
                <ShieldCheck className="h-5 w-5" />
              )}
            </div>
            <div>
              <h3
                id="deactivate-dialog-title"
                className="text-base sm:text-lg font-bold text-slate-900 leading-tight"
              >
                {isDeactivate ? "Deactivate Team?" : "Reactivate Team?"}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {isDeactivate
                  ? "Suspend catering access and roster operations."
                  : "Restore catering gate access and active tournament standing."}
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
          {apiError && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800"
            >
              <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{apiError}</span>
            </div>
          )}

          {/* Team Summary Card */}
          <div className="rounded-xl border border-slate-200 bg-[#F8F9FA] p-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white font-bold text-xs shrink-0 shadow-2xs">
                {team.initials || team.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-slate-900 truncate">
                  {team.name}
                </h4>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {team.league} •{" "}
                  <strong className="text-slate-700">
                    {team.approvedCount} Approved Members
                  </strong>
                </p>
              </div>
            </div>

            <StatusPill status={team.status} size="sm" />
          </div>

          {/* Warning text banner */}
          <div
            id="deactivate-dialog-description"
            className={cn(
              "rounded-xl border p-3.5 text-xs leading-relaxed",
              isDeactivate
                ? "border-amber-200 bg-amber-50/80 text-amber-900"
                : "border-emerald-200 bg-emerald-50/80 text-emerald-900",
            )}
          >
            <div className="flex items-start gap-2.5">
              {isDeactivate ? (
                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              )}
              <div>
                {isDeactivate ? (
                  <>
                    <strong className="font-semibold block mb-0.5">
                      Operational Effect:
                    </strong>
                    Deactivating this team will make its approved members
                    temporarily ineligible for meals. Their individual
                    registration approval status will remain unchanged.
                  </>
                ) : (
                  <>
                    <strong className="font-semibold block mb-0.5">
                      Reactivation Notice:
                    </strong>
                    Approved members will regain meal eligibility immediately
                    across all turnstiles and catering terminals.
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Reason Select (Deactivate Mode) */}
          {isDeactivate && (
            <div>
              <label
                htmlFor="deactivate-reason-select"
                className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1.5"
              >
                Reason for Deactivation <span className="text-rose-500">*</span>
              </label>
              <Select
                id="deactivate-reason-select"
                fullWidth
                value={reason}
                options={reasonOptions}
                onChange={(e) => setReason(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          )}

          {/* Audit & Security Notes */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="audit-notes"
                className="text-xs font-bold uppercase tracking-wider text-slate-800"
              >
                Internal Audit & Security Notes{" "}
                {isDeactivate && reason === "Other" ? (
                  <span className="text-rose-500">* (Required for Other)</span>
                ) : (
                  <span className="text-slate-400 font-normal">(optional)</span>
                )}
              </label>
              <span className="inline-flex items-center gap-1 font-mono text-[10px] text-slate-400 uppercase tracking-wider">
                <Lock className="h-2.5 w-2.5" />
                Encrypted HQ Log
              </span>
            </div>
            <textarea
              id="audit-notes"
              rows={3}
              maxLength={500}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isSubmitting}
              placeholder="Specify incident ticket ID, executive authorization contact, or badge reassignment notes…"
              className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 placeholder-slate-400 shadow-2xs outline-none transition-all focus:border-[#C9A227] focus:ring-2 focus:ring-[#FAF4E6]"
            />
            <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400 font-mono">
              <span>Audited by Alex Morgan</span>
              <span>{notes.length} / 500 chars</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-2.5 border-t border-slate-200 px-5 sm:px-6 py-3.5 bg-slate-50/50 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            ref={cancelButtonRef}
            onClick={onClose}
            disabled={isSubmitting}
            className="h-9 px-4 text-xs font-semibold text-slate-700 border-slate-300 hover:bg-slate-100 rounded-xl"
          >
            Cancel
          </Button>

          {isDeactivate ? (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleConfirm}
              isLoading={isSubmitting}
              disabled={isDeactivateDisabled}
              className="h-9 px-4 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-xs"
              leftIcon={<Ban className="h-4 w-4" />}
            >
              Deactivate Team
            </Button>
          ) : (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleConfirm}
              isLoading={isSubmitting}
              disabled={isSubmitting}
              className="h-9 px-4 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
              leftIcon={<CheckCircle2 className="h-4 w-4" />}
            >
              Reactivate Team
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeactivateTeamDialog;

