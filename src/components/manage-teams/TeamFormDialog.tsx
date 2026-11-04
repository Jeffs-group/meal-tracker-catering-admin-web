import React, { useState, useEffect, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  X,
  Shield,
  CreditCard,
  AlertTriangle,
  Info,
  Check,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { StatusPill } from "@/components/ui/StatusPill";
import { LeagueOptionCard } from "./LeagueOptionCard";
import {
  teamFormSchema,
  type TeamFormValues,
} from "@/validations/team.validation";
import type { Team, League } from "@/types/team.types";
import { cn } from "@/utils/cn";

export interface TeamFormDialogProps {
  isOpen: boolean;
  mode: "create" | "edit";
  initialTeam?: Team | null;
  onClose: () => void;
  onSubmit: (values: TeamFormValues) => Promise<void>;
  isSubmitting?: boolean;
}

export const TeamFormDialog: React.FC<TeamFormDialogProps> = ({
  isOpen,
  mode,
  initialTeam,
  onClose,
  onSubmit,
  isSubmitting = false,
}) => {
  const [apiError, setApiError] = useState<string | null>(null);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isDirty, isValid },
  } = useForm<TeamFormValues>({
    resolver: zodResolver(teamFormSchema),
    defaultValues: {
      name: "",
      league: "KSPL",
    },
    mode: "onChange",
  });

  const selectedLeague = watch("league");
  const currentName = watch("name");

  // Sync form state when dialog opens or initialTeam changes
  useEffect(() => {
    if (isOpen) {
      setApiError(null);
      setShowDiscardConfirm(false);
      if (mode === "edit" && initialTeam) {
        reset({
          name: initialTeam.name,
          league: initialTeam.league,
        });
      } else {
        reset({
          name: "",
          league: "KSPL",
        });
      }

      // Auto-focus first input on open
      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, mode, initialTeam, reset]);

  const handleAttemptClose = useCallback(() => {
    if (isSubmitting) return;
    if (isDirty) {
      setShowDiscardConfirm(true);
    } else {
      onClose();
    }
  }, [isSubmitting, isDirty, onClose]);

  // Keyboard navigation & Esc / scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isSubmitting) {
        handleAttemptClose();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isSubmitting, handleAttemptClose]);

  if (!isOpen) return null;

  const handleConfirmDiscard = () => {
    setShowDiscardConfirm(false);
    onClose();
  };

  const onFormSubmit = async (values: TeamFormValues) => {
    try {
      setApiError(null);
      await onSubmit(values);
    } catch (err) {
      if (err instanceof Error) {
        setApiError(err.message);
      } else {
        setApiError("An unexpected error occurred while saving the team.");
      }
    }
  };

  const hasRegistrantConflict =
    mode === "edit" &&
    initialTeam &&
    initialTeam.league !== selectedLeague &&
    initialTeam.registrationsTotal > 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="team-dialog-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={handleAttemptClose}
        aria-hidden="true"
      />

      {/* Dialog container: centered on desktop, bottom sheet on mobile */}
      <div
        ref={modalRef}
        className={cn(
          "relative w-full max-h-[92vh] sm:max-h-[90vh] flex flex-col rounded-t-2xl sm:rounded-2xl bg-white shadow-2xl transition-all overflow-hidden border border-slate-200 my-0 sm:my-auto max-w-full sm:max-w-[560px]",
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-200 px-5 sm:px-6 py-4 bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-3">
            {mode === "edit" ? (
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FAF4E6] border border-[#ECD59A] text-[#9B7415] shrink-0">
                <Shield className="h-5 w-5" />
              </div>
            ) : null}
            <div>
              <h3
                id="team-dialog-title"
                className="text-base sm:text-lg font-bold text-slate-900 leading-tight"
              >
                {mode === "create" ? "Create New Team" : "Edit Team"}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {mode === "create"
                  ? "Add a team to the KSPL or ISCL league."
                  : "Update team details and league assignment."}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleAttemptClose}
            disabled={isSubmitting}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer shrink-0"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form
          id="team-form"
          onSubmit={handleSubmit(onFormSubmit)}
          className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4"
        >
          {/* API Error Message Alert */}
          {apiError && (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 animate-in fade-in"
            >
              <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{apiError}</div>
            </div>
          )}

          {/* EDIT MODE: Read-only Operational Status & Immutable Team ID Strip */}
          {mode === "edit" && initialTeam && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-600 text-[11px]">
                  Current Operational Status:
                </span>
                <StatusPill status={initialTeam.status} size="sm" />
              </div>

              <div className="flex items-center gap-1.5 font-mono text-[11px]">
                <span className="text-slate-500 font-sans font-semibold text-[10px] uppercase tracking-wider">
                  TEAM ID:
                </span>
                {/* NOTE: Team ID is IMMUTABLE once created, even if the league changes */}
                <span className="rounded bg-white px-2 py-0.5 font-bold text-slate-800 border border-slate-200 shadow-2xs">
                  #{initialTeam.teamCode}
                </span>
              </div>
            </div>
          )}

          {/* Team Name Input */}
          <div>
            <label
              htmlFor="team-name-input"
              className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1.5"
            >
              Team Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <CreditCard className="h-4 w-4" />
              </div>
              <input
                id="team-name-input"
                type="text"
                disabled={isSubmitting}
                {...register("name")}
                ref={(e) => {
                  register("name").ref(e);
                  nameInputRef.current = e;
                }}
                placeholder="e.g. Tirunelveli Tigers"
                aria-invalid={!!errors.name}
                aria-describedby={
                  errors.name ? "team-name-error" : "team-name-helper"
                }
                className={cn(
                  "w-full rounded-xl border bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 placeholder-slate-400 shadow-2xs outline-none transition-all",
                  errors.name
                    ? "border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
                    : "border-slate-300 focus:border-[#C9A227] focus:ring-2 focus:ring-[#FAF4E6]",
                  isSubmitting && "bg-slate-50 opacity-60 cursor-not-allowed",
                )}
              />
            </div>
            {errors.name ? (
              <p
                id="team-name-error"
                className="mt-1.5 text-xs text-rose-600 font-medium"
              >
                {errors.name.message}
              </p>
            ) : (
              <p
                id="team-name-helper"
                className="mt-1.5 text-[11px] text-slate-500"
              >
                Appears on live scorecards, match graphics, and official
                standings.
              </p>
            )}
          </div>

          {/* Select League Radio Cards */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">
              Select League <span className="text-rose-500">*</span>
            </label>
            <div
              role="radiogroup"
              aria-label="Tournament League Selection"
              className="grid grid-cols-1 gap-2.5"
            >
              <LeagueOptionCard
                league="KSPL"
                selected={selectedLeague === "KSPL"}
                onSelect={(lg: League) =>
                  setValue("league", lg, {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
                disabled={isSubmitting}
              />
              <LeagueOptionCard
                league="ISCL"
                selected={selectedLeague === "ISCL"}
                onSelect={(lg: League) =>
                  setValue("league", lg, {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
                disabled={isSubmitting}
              />
            </div>
            {errors.league && (
              <p className="mt-1.5 text-xs text-rose-600 font-medium">
                {errors.league.message}
              </p>
            )}
          </div>

          {/* Warning if league changed in Edit Mode with existing registrants */}
          {hasRegistrantConflict && (
            <div className="flex items-start gap-2.5 rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 animate-in fade-in">
              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <span className="font-bold">League Migration Notice:</span>{" "}
                Changing the league affects{" "}
                <strong>{initialTeam.registrationsTotal}</strong> existing
                registrations. Team ID ({initialTeam.teamCode}) will remain
                unchanged for historical audit integrity.
              </div>
            </div>
          )}

          {/* CREATE MODE: Default Active Notice Info Box */}
          {mode === "create" && (
            <div className="flex items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs text-slate-600">
              <Info className="h-4 w-4 text-[#C9A227] shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                New teams are created in{" "}
                <strong className="text-slate-900 font-semibold">Active</strong>{" "}
                status by default. Approved members will be automatically
                eligible for match-day catering access.
              </p>
            </div>
          )}

          {/* EDIT MODE: Metadata row */}
          {mode === "edit" && initialTeam && (
            <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] text-slate-500">
              <span>
                Last modified:{" "}
                <strong className="font-semibold text-slate-700">
                  {initialTeam.updatedAt || "14 Feb 2026 by Alex Morgan"}
                </strong>
              </span>

              {initialTeam.licensed && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
                  <Award className="h-3 w-3 text-emerald-600" />
                  <span>Licensed Roster</span>
                </span>
              )}
            </div>
          )}
        </form>

        {/* Unsaved Changes Confirmation Banner */}
        {showDiscardConfirm && (
          <div className="border-t border-amber-200 bg-amber-50 px-5 py-3 text-xs flex items-center justify-between animate-in slide-in-from-bottom-2">
            <div className="flex items-center gap-2 text-amber-900 font-medium">
              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
              <span>You have unsaved changes. Discard them?</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowDiscardConfirm(false)}
                className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Keep Editing
              </button>
              <button
                type="button"
                onClick={handleConfirmDiscard}
                className="rounded-md bg-amber-600 px-3 py-1 text-xs font-semibold text-white hover:bg-amber-700"
              >
                Discard
              </button>
            </div>
          </div>
        )}

        {/* Modal Footer: Full-width divider spanning 100% of the modal */}
        <div className="w-full flex items-center justify-end gap-2.5 border-t border-slate-200 px-5 sm:px-6 py-3.5 bg-slate-50/50 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAttemptClose}
            disabled={isSubmitting}
            className="h-9 px-4 text-xs font-semibold text-slate-700 border-slate-300 hover:bg-slate-100 rounded-xl"
          >
            Cancel
          </Button>

          <Button
            type="submit"
            form="team-form"
            variant="primary"
            size="sm"
            isLoading={isSubmitting}
            disabled={
              isSubmitting ||
              !isValid ||
              (mode === "edit" && !isDirty) ||
              !currentName?.trim()
            }
            className="h-9 px-5 text-xs font-semibold rounded-xl shadow-xs"
            leftIcon={
              mode === "edit" ? <Check className="h-4 w-4" /> : undefined
            }
          >
            {mode === "create" ? "Create Team" : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TeamFormDialog;
