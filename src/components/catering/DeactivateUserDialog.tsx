import React, { useState, useEffect, useRef } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Lock,
  UserCheck,
  X,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/utils/cn";
import type { CateringUser } from "@/types/catering.types";
import { COUNTERS, CATERING_ROLES } from "@/constants/catering";

export interface DeactivateUserDialogProps {
  isOpen: boolean;
  mode: "deactivate" | "activate";
  user: CateringUser | null;
  currentUserId?: string;
  totalActiveSuperAdmins?: number;
  onClose: () => void;
  onConfirm: (notes?: string) => Promise<void>;
}

export const DeactivateUserDialog: React.FC<DeactivateUserDialogProps> = ({
  isOpen,
  mode,
  user,
  currentUserId = "usr-001",
  totalActiveSuperAdmins = 1,
  onClose,
  onConfirm,
}) => {
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const cancelBtnRef = useRef<HTMLButtonElement | null>(null);

  const isDeactivate = mode === "deactivate";

  useEffect(() => {
    if (isOpen) {
      setNotes("");
      setIsSubmitting(false);
      setErrorMessage(null);
      setTimeout(() => {
        cancelBtnRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen || !user) return null;

  // Safeguard guards
  const isSelf = user.id === currentUserId;
  const isLastSuperAdmin =
    isDeactivate && user.roleId === "SUPER_ADMIN" && totalActiveSuperAdmins <= 1;

  let guardBlockReason: string | null = null;
  if (isDeactivate && isSelf) {
    guardBlockReason = "Security safeguard: You cannot deactivate your own active session.";
  } else if (isDeactivate && isLastSuperAdmin) {
    guardBlockReason = "Security safeguard: Cannot deactivate the tournament's sole active Super Admin.";
  }

  const roleDef = CATERING_ROLES[user.roleId] ?? CATERING_ROLES.MEAL_OPERATOR!;
  const counterObj =
    COUNTERS.find((c) => c.id === user.currentCounterId) ?? COUNTERS[0]!;

  const handleAction = async () => {
    if (guardBlockReason || isSubmitting) return;

    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      await onConfirm(notes.trim() || undefined);
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Action failed.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="alertdialog"
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
      <div className="relative w-full max-h-[92vh] sm:max-h-[90vh] flex flex-col rounded-t-2xl sm:rounded-2xl bg-white shadow-2xl transition-all overflow-hidden border border-slate-200 my-0 sm:my-auto max-w-full sm:max-w-[480px]">
        {/* Top Accent Bar */}
        <div
          className={cn(
            "h-1.5 w-full shrink-0",
            isDeactivate ? "bg-rose-600" : "bg-emerald-600",
          )}
        />

        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 px-5 sm:px-6 py-4 bg-slate-50/50 shrink-0">
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
              <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                {isDeactivate ? "Deactivate User Account?" : "Activate User Account?"}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {isDeactivate
                  ? "This user will immediately lose access to the Jeff's Catering portal across all active matchday terminals."
                  : "They will regain access with their assigned operational role."}
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
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs">
          {guardBlockReason && (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-rose-800"
            >
              <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <strong>Action Prohibited:</strong> {guardBlockReason}
              </div>
            </div>
          )}

          {errorMessage && (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-rose-800"
            >
              <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* User Dossier Card */}
          <div className="rounded-xl border border-slate-200 bg-[#F8F9FA] p-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white font-bold text-xs shrink-0 select-none">
                {user.fullName.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-slate-900 truncate">
                  {user.fullName}
                </h4>
                <p className="text-slate-500 font-normal truncate mt-0.5 font-sans">
                  {user.email}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1 shrink-0">
              <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">
                {user.status === "active" ? "Active" : "Inactive"}
              </span>
              <span className="text-[11px] font-semibold text-slate-600">
                {roleDef.label}
              </span>
            </div>
          </div>

          {/* Terminal & Session Info */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">
                Active Station Access
              </span>
              <p className="font-semibold text-slate-900 truncate">
                {counterObj.name}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                {counterObj.terminal} • {counterObj.gate}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">
                Last Activity Session
              </span>
              <p className="font-semibold text-slate-900">
                Today, 11:20 AM IST
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Firefox • Bangalore
              </p>
            </div>
          </div>

          {/* Operational Consequences List */}
          {isDeactivate && (
            <div>
              <p className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-2">
                Security & Operational Consequences
              </p>
              <ul className="space-y-1.5 text-slate-600 pl-1">
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                  <span>Active sessions and terminal pairings will end immediately.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                  <span>Distribution dispensing access is revoked at all counters.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                  <span>Account history and ledger dispensation entries are fully preserved.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                  <span>The account can be reactivated at any time by Super Admins.</span>
                </li>
              </ul>
            </div>
          )}

          {/* Optional Audit Notes Field */}
          <div>
            <label
              htmlFor="deactivate-note"
              className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1"
            >
              Add an Audit Note <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <textarea
              id="deactivate-note"
              rows={2}
              maxLength={500}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isSubmitting || !!guardBlockReason}
              placeholder="Specify justification, authorization ticket, or security reason…"
              className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#C9A227]"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 sm:gap-2.5 border-t border-slate-200 px-5 sm:px-6 py-3.5 bg-slate-50/50 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            ref={cancelBtnRef}
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-xl w-full sm:w-auto justify-center"
          >
            Cancel
          </Button>

          {isDeactivate ? (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleAction}
              disabled={isSubmitting || !!guardBlockReason}
              className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold shadow-xs w-full sm:w-auto justify-center"
              leftIcon={
                isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Lock className="h-4 w-4" />
                )
              }
            >
              {isSubmitting ? "Deactivating…" : "Deactivate User"}
            </Button>
          ) : (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleAction}
              disabled={isSubmitting || !!guardBlockReason}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs w-full sm:w-auto justify-center"
              leftIcon={
                isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <UserCheck className="h-4 w-4" />
                )
              }
            >
              {isSubmitting ? "Activating…" : "Activate User"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeactivateUserDialog;
