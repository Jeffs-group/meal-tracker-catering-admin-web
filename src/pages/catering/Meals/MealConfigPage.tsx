import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ChevronRight,
  Coffee,
  Utensils,
  ChefHat,
  Moon,
  AlertTriangle,
  CheckCircle2,
  Save,
  RotateCcw,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useMealConfig, useSaveMealConfig } from "@/hooks/useCatering";
import { ROUTES } from "@/constants/routes";
import { getTodayDateString } from "@/constants/catering";
import type { MealPeriodConfig } from "@/types/catering.types";
import { cn } from "@/utils/cn";

const DEFAULT_4_MEALS: MealPeriodConfig[] = [
  {
    key: "meal1",
    sortOrder: 1,
    sessionLabel: "SESSION 1",
    name: "Meal 1",
    label: "Meal 1",
    description: "First Service Session",
    subtitle: "First Service Session",
    enabled: true,
    isEnabled: true,
    status: "Active for Service",
    availability: "Open All Day",
    vegPlanned: 0,
    nonVegPlanned: 0,
    plannedVeg: 0,
    plannedNonVeg: 0,
    totalPlanned: 0,
    startTime: null,
    endTime: null,
  },
  {
    key: "meal2",
    sortOrder: 2,
    sessionLabel: "SESSION 2",
    name: "Meal 2",
    label: "Meal 2",
    description: "Second Service Session",
    subtitle: "Second Service Session",
    enabled: true,
    isEnabled: true,
    status: "Active for Service",
    availability: "Open All Day",
    vegPlanned: 0,
    nonVegPlanned: 0,
    plannedVeg: 0,
    plannedNonVeg: 0,
    totalPlanned: 0,
    startTime: null,
    endTime: null,
  },
  {
    key: "meal3",
    sortOrder: 3,
    sessionLabel: "SESSION 3",
    name: "Meal 3",
    label: "Meal 3",
    description: "Third Service Session",
    subtitle: "Third Service Session",
    enabled: true,
    isEnabled: true,
    status: "Active for Service",
    availability: "Open All Day",
    vegPlanned: 0,
    nonVegPlanned: 0,
    plannedVeg: 0,
    plannedNonVeg: 0,
    totalPlanned: 0,
    startTime: null,
    endTime: null,
  },
  {
    key: "meal4",
    sortOrder: 4,
    sessionLabel: "SESSION 4",
    name: "Meal 4",
    label: "Meal 4",
    description: "Fourth Service Session",
    subtitle: "Fourth Service Session",
    enabled: true,
    isEnabled: true,
    status: "Active for Service",
    availability: "Open All Day",
    vegPlanned: 0,
    nonVegPlanned: 0,
    plannedVeg: 0,
    plannedNonVeg: 0,
    totalPlanned: 0,
    startTime: null,
    endTime: null,
  },
];

export const MealConfigPage: React.FC = () => {
  const [operatingDate, setOperatingDate] = useState(getTodayDateString);
  const [periods, setPeriods] = useState<MealPeriodConfig[]>(DEFAULT_4_MEALS);
  const [isDirty, setIsDirty] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const { data: initialPeriods, isLoading } = useMealConfig(operatingDate);
  const saveMutation = useSaveMealConfig();

  useEffect(() => {
    if (initialPeriods && initialPeriods.length > 0) {
      setPeriods(JSON.parse(JSON.stringify(initialPeriods)));
    } else {
      setPeriods(JSON.parse(JSON.stringify(DEFAULT_4_MEALS)));
    }
    setIsDirty(false);
  }, [initialPeriods]);

  if (isLoading && periods.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center text-xs text-slate-500">
          Loading meal configurations…
        </div>
      </div>
    );
  }

  const enabledCount = periods.filter((p) => p.enabled ?? p.isEnabled).length;

  const handlePeriodChange = (
    key: string,
    field: keyof MealPeriodConfig,
    value: string | number | boolean,
  ) => {
    setPeriods((prev) =>
      prev.map((p) => {
        if (p.key !== key && p.id !== key) return p;
        const updated = {
          ...p,
          [field]: value,
        };

        if (field === "enabled") {
          const isEn = Boolean(value);
          updated.isEnabled = isEn;
          updated.status = isEn ? "Active for Service" : "Disabled";
          updated.availability = isEn ? (p.availability || "Open All Day") : "Inactive";
        }
        if (field === "isEnabled") {
          const isEn = Boolean(value);
          updated.enabled = isEn;
          updated.status = isEn ? "Active for Service" : "Disabled";
          updated.availability = isEn ? (p.availability || "Open All Day") : "Inactive";
        }
        if (field === "name") {
          updated.label = String(value);
        }
        if (field === "label") {
          updated.name = String(value);
        }
        if (field === "description") {
          updated.subtitle = String(value);
        }
        if (field === "subtitle") {
          updated.description = String(value);
        }
        if (field === "vegPlanned") {
          const val = Number(value) || 0;
          updated.plannedVeg = val;
          updated.vegPlanned = val;
          updated.totalPlanned = val + (updated.nonVegPlanned ?? updated.plannedNonVeg ?? 0);
        }
        if (field === "nonVegPlanned") {
          const val = Number(value) || 0;
          updated.plannedNonVeg = val;
          updated.nonVegPlanned = val;
          updated.totalPlanned = (updated.vegPlanned ?? updated.plannedVeg ?? 0) + val;
        }
        if (field === "startTime") {
          updated.start = String(value);
        }
        if (field === "endTime") {
          updated.end = String(value);
        }

        return updated;
      }),
    );
    setIsDirty(true);
    setSaveSuccess(false);
    setValidationError(null);
  };

  const handleSave = async () => {
    // Validation: At least one meal session must remain enabled
    if (!periods.some((p) => p.enabled ?? p.isEnabled)) {
      setValidationError("At least one meal session must remain enabled for service.");
      return;
    }

    setValidationError(null);
    try {
      await saveMutation.mutateAsync({
        date: operatingDate,
        periods,
      });
      setIsDirty(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setValidationError(err.message);
      }
    }
  };

  const getSessionIcon = (key: string, idx: number) => {
    if (key === "meal1" || key === "breakfast" || idx === 0) return <Coffee className="h-5 w-5" />;
    if (key === "meal2" || key === "lunch" || idx === 1) return <Utensils className="h-5 w-5" />;
    if (key === "meal3" || key === "dinner" || idx === 2) return <ChefHat className="h-5 w-5" />;
    return <Moon className="h-5 w-5" />;
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Top Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-500">
        <Link to={ROUTES.CATERING.MEALS} className="hover:text-slate-800 transition-colors">
          Manage Meals
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
        <span className="font-semibold text-slate-800">Meal Configuration</span>
      </nav>

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-1 border-b border-slate-200 gap-3">
        <div>
          <h1 className="text-[clamp(24px,2vw+16px,32px)] font-bold tracking-tight text-slate-900 leading-[1.25]">
            Meal Configuration
          </h1>
          <p className="mt-1 text-sm text-slate-600 leading-relaxed">
            Configure default meal service sessions (Meal 1 – Meal 4) and operational availability for the operating day.
          </p>
        </div>

        {/* Operating Date Selector */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 shadow-2xs text-xs">
            <Calendar className="h-4 w-4 text-[#C9A227]" />
            <span className="font-semibold text-slate-700">Operating Date:</span>
            <input
              type="date"
              value={operatingDate}
              onChange={(e) => setOperatingDate(e.target.value)}
              className="text-xs font-semibold text-slate-900 border-none outline-none cursor-pointer bg-transparent"
            />
          </div>
        </div>
      </div>

      {validationError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {saveSuccess && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>Meal service configuration saved and synchronized successfully!</span>
        </div>
      )}

      {/* 4 Meal Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {periods.map((period, index) => {
          const isEnabled = period.enabled ?? period.isEnabled ?? true;
          const sessionNum = period.sortOrder ?? (index + 1);
          const sessionLabel = period.sessionLabel || `SESSION ${sessionNum}`;
          const sessionName = period.name || period.label || `Meal ${sessionNum}`;
          const sessionDesc = period.description ?? period.subtitle ?? "";
          const statusText = period.status || (isEnabled ? "Active for Service" : "Disabled");
          const availabilityText = period.availability || (isEnabled ? "Open All Day" : "Inactive");

          return (
            <div
              key={period.id || period.key || `meal-${index}`}
              className={cn(
                "rounded-2xl border bg-white p-5 shadow-xs flex flex-col justify-between transition-all space-y-4",
                isEnabled
                  ? "border-slate-200 border-t-4 border-t-[#C9A227] hover:border-slate-300"
                  : "border-slate-200 border-t-4 border-t-slate-300 opacity-60",
              )}
            >
              <div className="space-y-4">
                {/* Header: Icon, Session Label, Toggle Switch */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex h-11 w-11 items-center justify-center rounded-xl border shrink-0 transition-colors",
                        isEnabled
                          ? "border-[#ECD59A] bg-[#FAF4E6] text-[#9B7415]"
                          : "border-slate-200 bg-slate-50 text-slate-400",
                      )}
                    >
                      {getSessionIcon(period.key, index)}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase block">
                        {sessionLabel}
                      </span>
                      <h3 className="font-bold text-slate-900 text-base leading-tight">
                        {sessionName}
                      </h3>
                    </div>
                  </div>

                  {/* Enable / Disable Toggle */}
                  <label
                    className="relative inline-flex items-center shrink-0 cursor-pointer"
                    title={isEnabled ? "Disable this meal session" : "Enable this meal session"}
                  >
                    <input
                      type="checkbox"
                      checked={isEnabled}
                      onChange={(e) =>
                        handlePeriodChange(period.key, "enabled", e.target.checked)
                      }
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#C9A227]"></div>
                  </label>
                </div>

                {/* State Chip */}
                <div>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
                      isEnabled
                        ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                        : "border-slate-200 bg-slate-100 text-slate-600",
                    )}
                  >
                    <span
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        isEnabled ? "bg-emerald-500" : "bg-slate-400",
                      )}
                    />
                    <span>{statusText}</span>
                  </span>
                </div>

                {/* Editable Session Details: Name and Description/Notes */}
                <div className="space-y-3 pt-2 border-t border-slate-100 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Session Name
                    </label>
                    <Input
                      type="text"
                      value={period.name ?? period.label ?? ""}
                      placeholder={`e.g. Meal ${sessionNum}`}
                      onChange={(e) =>
                        handlePeriodChange(period.key, "name", e.target.value)
                      }
                      className="text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Description / Service Notes
                    </label>
                    <Input
                      type="text"
                      value={sessionDesc}
                      placeholder="e.g. Service Session Notes"
                      onChange={(e) =>
                        handlePeriodChange(period.key, "description", e.target.value)
                      }
                      className="text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Card Footer: Operational Availability */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Availability:</span>
                <span className="font-semibold text-slate-800">
                  {availabilityText}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-white/95 px-4 sm:px-8 py-3.5 shadow-2xl backdrop-blur-md">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div>
              <span className="font-bold uppercase tracking-wider text-slate-400 block text-[10px]">
                CONFIGURED MEAL SESSIONS
              </span>
              <span className="font-bold text-slate-900 text-sm">
                {enabledCount} of {periods.length} sessions active for today
              </span>
            </div>
            <span className="text-slate-300">|</span>
            {isDirty ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-[11px] font-bold text-amber-800">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                Unsaved changes
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Configuration ready
              </span>
            )}
          </div>

          <div className="flex items-center justify-end gap-2.5 w-full sm:w-auto">
            <Button
              variant="outline"
              size="md"
              onClick={() => {
                if (initialPeriods) {
                  setPeriods(JSON.parse(JSON.stringify(initialPeriods)));
                  setIsDirty(false);
                  setValidationError(null);
                }
              }}
              disabled={!isDirty || saveMutation.isPending}
              className="rounded-xl text-xs flex-1 sm:flex-initial"
              leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
            >
              Revert
            </Button>

            <Button
              variant="primary"
              size="md"
              onClick={handleSave}
              disabled={saveMutation.isPending}
              isLoading={saveMutation.isPending}
              className="rounded-xl bg-[#C9A227] hover:bg-[#B8901E] text-white shadow-xs font-semibold px-5 flex-1 sm:flex-initial"
              leftIcon={<Save className="h-4 w-4" />}
            >
              Save Configuration
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MealConfigPage;
