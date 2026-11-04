import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ChevronRight,
  Store,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Coffee,
  Utensils,
  Moon,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { MealDistributionDialog } from "@/components/catering/MealDistributionDialog";
import {
  useRegistrantMealStatus,
  useProvideMeal,
  useMealConfig,
} from "@/hooks/useCatering";
import { useAuthStore } from "@/stores/authStore";
import { usePermissions } from "@/hooks/usePermissions";
import { formatTimestampIST, formatIST12h, getPeriodState, getNow } from "@/utils/cateringClock";
import { COUNTERS, DEFAULT_MEALS_CONFIG } from "@/constants/catering";
import { ROUTES, buildCateringTeamRoute, buildCateringRegistrantRoute } from "@/constants/routes";
import type { MealPeriodKey, VerificationMethod } from "@/types/catering.types";
import { cn } from "@/utils/cn";

export const MealDistributionPage: React.FC = () => {
  const { registrantId = "" } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { can } = usePermissions();

  const [selectedPeriodKey, setSelectedPeriodKey] = useState<MealPeriodKey>("");
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [verificationMethod] = useState<VerificationMethod>("qr");

  const currentCounter =
    COUNTERS.find((c) => c.id === user?.currentCounterId) ?? COUNTERS[0]!;

  const now = getNow();
  const { data: statusData, isLoading, error, refetch } = useRegistrantMealStatus(registrantId);
  const { data: rawConfig } = useMealConfig();
  const config = (rawConfig && rawConfig.length > 0) ? rawConfig : DEFAULT_MEALS_CONFIG;

  const provideMealMutation = useProvideMeal();

  React.useEffect(() => {
    if (
      statusData?.registrant?.code &&
      registrantId &&
      statusData.registrant.code !== registrantId
    ) {
      navigate(buildCateringRegistrantRoute(statusData.registrant.code), { replace: true });
    }
  }, [statusData?.registrant?.code, registrantId, navigate]);

  const periodsList = statusData?.periods;
  React.useEffect(() => {
    if (periodsList && periodsList.length > 0) {
      const activeOrDispensable =
        periodsList.find((p) => p.canDispense && !p.isProvided) ??
        periodsList.find((p) => !p.isProvided) ??
        periodsList[0];
      if (activeOrDispensable && (!selectedPeriodKey || !periodsList.some((p) => p.key === selectedPeriodKey))) {
        setSelectedPeriodKey(activeOrDispensable.key);
      }
    }
  }, [periodsList, selectedPeriodKey]);

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center text-xs text-slate-500">
          Loading meal distribution details…
        </div>
      </div>
    );
  }

  if (error || !statusData) {
    const apiError = error as { response?: { data?: { message?: string; code?: string } } };
    const errorMessage =
      apiError?.response?.data?.message ||
      (error as Error)?.message ||
      "Registrant ID was not found.";

    return (
      <div className="max-w-xl mx-auto my-12 p-8 rounded-2xl border border-red-200 bg-white shadow-xs space-y-4 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
          <AlertCircle className="h-8 w-8" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Registrant Not Found</h2>
          <p className="mt-1.5 text-sm text-slate-600">
            {errorMessage}
          </p>
          {registrantId && (
            <p className="mt-3 text-xs font-mono bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-slate-600 break-all inline-block">
              Registrant ID: {registrantId}
            </p>
          )}
        </div>
        <div className="flex items-center justify-center gap-3 pt-3">
          <Link to={ROUTES.CATERING.MEALS}>
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>
              Back to Manage Meals
            </Button>
          </Link>
          <Button variant="primary" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const { registrant, periods, nextEligiblePeriod } = statusData;

  const liveConfig = config.find((p) => getPeriodState(p, now) === "live");
  const selectedPeriod =
    periods.find((p) => p.key === selectedPeriodKey) ??
    periods.find((p) => p.canDispense && !p.isProvided) ??
    periods.find((p) => !p.isProvided) ??
    periods[0];

  if (!selectedPeriod) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 rounded-2xl border border-amber-200 bg-white shadow-xs space-y-4 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-600">
          <AlertCircle className="h-8 w-8" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">No Meal Periods Available</h2>
          <p className="mt-1.5 text-sm text-slate-600">
            No active meal windows are configured or available for this participant today.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3 pt-3">
          <Link to={ROUTES.CATERING.MEALS}>
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>
              Back to Manage Meals
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const isEligibleForService =
    registrant.isEligibleToday !== false &&
    periods.some((p) => p.canDispense || p.isProvided);

  const canDispense = selectedPeriod.canDispense && can("meals", "provide");

  const handleConfirmProvide = async (vars: {
    registrantCode: string;
    mealPeriodId: string;
    verificationCode: string;
    registrantId: string;
    periodKey: MealPeriodKey;
    counterId: string;
    operatorId: string;
    verificationMethod: VerificationMethod;
    idempotencyKey: string;
  }) => {
    return await provideMealMutation.mutateAsync(vars);
  };

  const getPeriodIcon = (key: MealPeriodKey) => {
    const k = (key || "").toLowerCase();
    if (k.includes("breakfast") || k.includes("meal1")) return <Coffee className="h-5 w-5" />;
    if (k.includes("lunch") || k.includes("meal2")) return <Utensils className="h-5 w-5" />;
    return <Moon className="h-5 w-5" />;
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-500">
        <Link to={ROUTES.CATERING.MEALS} className="hover:text-slate-800 transition-colors">
          Manage Meals
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
        <Link
          to={
            registrant.teamId
              ? buildCateringTeamRoute(registrant.teamId)
              : ROUTES.CATERING.MEALS_STAFF
          }
          className="hover:text-slate-800 transition-colors"
        >
          {registrant.teamName}
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
        <span className="font-semibold text-slate-800">{registrant.fullName}</span>
      </nav>

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-1 border-b border-slate-200 gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-[clamp(24px,2vw+16px,32px)] font-bold tracking-tight text-slate-900 leading-[1.25]">
              Meal Distribution
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
              <Store className="h-3.5 w-3.5 text-[#C9A227]" />
              <span>
                {currentCounter.name} • {currentCounter.terminal} • {currentCounter.gate}
              </span>
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-600 leading-relaxed">
            Select an active dining period below to dispense portions and record audit credentials.
          </p>
        </div>

        {/* Right card: Active Service Window */}
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs text-xs self-start sm:self-auto min-w-[220px]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
            Current Service Window
          </span>
          <p className="font-bold text-slate-900">
            {liveConfig ? `${liveConfig.label} Session` : "No Active Window"}
          </p>
          <p className="text-slate-500 text-[11px] mt-0.5">
            {liveConfig
              ? `${formatIST12h(liveConfig.start)} – ${formatIST12h(liveConfig.end)} IST`
              : "Next session will open as scheduled"}
          </p>
        </div>
      </div>

      {/* Registrant Profile Dossier Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white font-bold text-base select-none shrink-0 shadow-xs">
              {registrant.fullName.slice(0, 2).toUpperCase()}
              {isEligibleForService ? (
                <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white border-2 border-white">
                  <CheckCircle2 className="h-3 w-3 stroke-[3]" />
                </div>
              ) : (
                <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-white border-2 border-white">
                  <AlertCircle className="h-3 w-3 stroke-[3]" />
                </div>
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 leading-tight">
                  {registrant.fullName}
                </h3>
                <span className="rounded-md bg-slate-100 border border-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-700">
                  {registrant.type}
                </span>
                {registrant.isVip && (
                  <span className="rounded bg-[#FAF4E6] border border-[#ECD59A] text-[#9B7415] px-1.5 py-0.2 text-[10px] font-extrabold uppercase">
                    VIP
                  </span>
                )}
                {isEligibleForService ? (
                  <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                    QR Scanned
                  </span>
                ) : (
                  <span className="rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                    Ineligible
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 mt-1.5 text-xs text-slate-600">
                <span className="font-mono font-semibold text-slate-800">
                  ID: {registrant.code}
                </span>
                <span className="text-slate-300">•</span>
                <span>Delegation: <strong>{registrant.teamName}</strong></span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      "h-2 w-2 rounded-full",
                      registrant.dietaryPreference === "veg"
                        ? "bg-emerald-500"
                        : "bg-rose-500",
                    )}
                  />
                  <span>
                    Dietary:{" "}
                    <strong>
                      {registrant.dietaryPreference === "veg"
                        ? "Vegetarian (Veg)"
                        : "Non-Vegetarian (Non-Veg)"}
                    </strong>
                  </span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-center">
            {isEligibleForService ? (
              <span className="rounded-xl border border-emerald-200 bg-emerald-50/80 px-3 py-1.5 text-xs font-bold text-emerald-800">
                Verified Accreditation
              </span>
            ) : (
              <span className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800">
                Not Eligible for Meals Today
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Ineligibility Warning Banner */}
      {!isEligibleForService && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-900 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm text-amber-900">
              {registrant.ineligibilityReason || "Participant Not Eligible for Meal Service Today"}
            </h4>
            <p className="mt-0.5 text-amber-800 leading-relaxed">
              This attendee is not cleared for meal dispensation on today's matchday roster. Meal selection periods are locked.
            </p>
          </div>
        </div>
      )}

      {/* Available Dining Periods • Radio Group */}
      <div className="space-y-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 leading-tight">
            Available Dining Periods • Today's Schedule
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Portions are authorized strictly per matchday schedule. Only live active windows are selectable.
          </p>
        </div>

        <div
          className={cn(
            "grid gap-4",
            periods.length === 4
              ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
              : "grid-cols-1 md:grid-cols-3",
          )}
          role="radiogroup"
        >
          {periods.map((period) => {
            const isSelected = selectedPeriodKey === period.key;
            const isLive = period.state === "live";
            const isClickable = isLive && !period.isProvided;

            return (
              <div
                key={period.key}
                role="radio"
                aria-checked={isSelected}
                tabIndex={isClickable ? 0 : -1}
                onClick={() => {
                  if (isClickable) setSelectedPeriodKey(period.key);
                }}
                className={cn(
                  "relative rounded-2xl border p-5 transition-all select-none flex flex-col justify-between",
                  isClickable
                    ? "cursor-pointer hover:border-slate-400 bg-white"
                    : "cursor-not-allowed bg-slate-50/60 opacity-80",
                  isSelected
                    ? "border-[#C9A227] ring-2 ring-[#C9A227] bg-[#FAF4E6]/20 shadow-md"
                    : "border-slate-200",
                )}
              >
                {/* READY FOR DISPENSE ribbon on live non-provided card */}
                {isLive && !period.isProvided && (
                  <div className="absolute -top-3 left-4 rounded-full bg-[#C9A227] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-xs">
                    READY FOR DISPENSE
                  </div>
                )}

                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-xl border shrink-0",
                          isSelected
                            ? "border-[#ECD59A] bg-[#FAF4E6] text-[#9B7415]"
                            : "border-slate-200 bg-white text-slate-600",
                        )}
                      >
                        {getPeriodIcon(period.key)}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">
                          {period.label}
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {period.subtitle}
                        </p>
                      </div>
                    </div>

                    {period.isProvided ? (
                      <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-800 shrink-0">
                        Provided
                      </span>
                    ) : isLive ? (
                      <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-800 shrink-0">
                        Active Now
                      </span>
                    ) : period.state === "upcoming" ? (
                      <span className="rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-500 shrink-0">
                        Upcoming
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-100 text-slate-500 px-2 py-0.5 text-[10px] font-medium shrink-0">
                        Closed
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 mt-4 pt-3 border-t border-slate-100">
                    <div className="flex justify-between">
                      <span className="text-slate-400 text-[11px]">Time Window:</span>
                      <span className="font-semibold text-slate-800">
                        {formatIST12h(period.start)} – {formatIST12h(period.end)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 text-[11px]">Portion Status:</span>
                      <span
                        className={cn(
                          "font-medium",
                          period.isProvided
                            ? "text-emerald-700"
                            : isLive
                              ? "text-[#9B7415] font-bold"
                              : "text-slate-500",
                        )}
                      >
                        {period.reasonText}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="meal-period-select"
                      checked={isSelected}
                      disabled={!isClickable}
                      onChange={() => setSelectedPeriodKey(period.key)}
                      className="h-4 w-4 text-[#C9A227] focus:ring-[#C9A227] cursor-pointer"
                    />
                    <span className="font-semibold text-slate-700">
                      {isSelected ? "Current Selection" : isClickable ? "Select Period" : "Unavailable"}
                    </span>
                  </div>

                  {period.providedAt && (
                    <span className="text-[10px] text-slate-400 font-sans">
                      Logged {formatTimestampIST(period.providedAt)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="sticky bottom-4 z-20 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-bold uppercase tracking-wider text-slate-400">
            ACTIVE CHOICE:
          </span>
          <span className="font-semibold text-slate-800">
            {canDispense
              ? `Ready for distribution — Selected Meal: ${selectedPeriod.label} (${formatIST12h(
                  selectedPeriod.start,
                )} – ${formatIST12h(selectedPeriod.end)})`
              : selectedPeriod.isProvided
                ? `${selectedPeriod.label} already provided today`
                : "No live window currently open for dispensation"}
          </span>
        </div>

        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
          <Button
            variant="outline"
            size="md"
            onClick={() =>
              navigate(
                registrant.teamId
                  ? buildCateringTeamRoute(registrant.teamId)
                  : ROUTES.CATERING.MEALS_STAFF,
              )
            }
            className="rounded-xl text-xs w-full sm:w-auto justify-center"
            leftIcon={<ArrowLeft className="h-4 w-4" />}
          >
            Back to {registrant.teamName}
          </Button>

          <Button
            variant="primary"
            size="md"
            disabled={!canDispense}
            onClick={() => setIsConfirmDialogOpen(true)}
            className="rounded-xl bg-[#C9A227] hover:bg-[#B8901E] text-white shadow-xs font-semibold px-5 w-full sm:w-auto justify-center"
            rightIcon={<ArrowRight className="h-4 w-4" />}
          >
            Continue to Confirmation
          </Button>
        </div>
      </div>

      {/* Confirmation & Dispensation Dialog */}
      <MealDistributionDialog
        isOpen={isConfirmDialogOpen}
        onClose={() => setIsConfirmDialogOpen(false)}
        onSuccessNext={() => {
          setIsConfirmDialogOpen(false);
          navigate(ROUTES.CATERING.MEALS);
        }}
        onBackToTeam={() => {
          setIsConfirmDialogOpen(false);
          navigate(
            registrant.teamId
              ? buildCateringTeamRoute(registrant.teamId)
              : ROUTES.CATERING.MEALS_STAFF,
          );
        }}
        teamName={registrant.teamName}
        registrant={registrant}
        period={{
          id: selectedPeriod.id,
          key: selectedPeriod.key,
          label: selectedPeriod.label,
          subtitle: selectedPeriod.subtitle ?? "",
          start: selectedPeriod.start ?? "",
          end: selectedPeriod.end ?? "",
        }}
        nextEligiblePeriod={nextEligiblePeriod}
        counterId={currentCounter.id}
        operator={{
          id: user?.id || "usr-001",
          fullName: user?.firstName
            ? `${user.firstName} ${user.lastName}`
            : "Alex Morgan",
          roleLabel: user?.roleLabel || "Super Admin",
        }}
        verificationMethod={verificationMethod}
        onConfirmProvide={handleConfirmProvide}
      />
    </div>
  );
};

export default MealDistributionPage;
