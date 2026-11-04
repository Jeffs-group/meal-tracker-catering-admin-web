import React, { useState, useRef, useEffect } from "react";
import { Calendar as CalendarIcon, ChevronDown, Check } from "lucide-react";
import { cn } from "@/utils/cn";
import { DATE_RANGE_PRESETS, type DateRangePresetId } from "@/constants/reports";

export interface DateRangePickerProps {
  from?: string; // YYYY-MM-DD
  to?: string; // YYYY-MM-DD
  onChange: (from: string, to: string) => void;
  className?: string;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  from = "2026-01-01",
  to = "2026-11-03",
  onChange,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activePreset, setActivePreset] = useState<DateRangePresetId>("season_to_date");
  const [customFrom, setCustomFrom] = useState(from);
  const [customTo, setCustomTo] = useState(to);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectPreset = (presetId: DateRangePresetId) => {
    setActivePreset(presetId);
    const today = new Date("2026-11-03T18:00:00Z"); // Benchmark tournament time
    const todayStr = "2026-11-03";

    if (presetId === "season_to_date") {
      onChange("2026-01-01", todayStr);
      setIsOpen(false);
    } else if (presetId === "last_7_days") {
      const d7 = new Date(today);
      d7.setDate(d7.getDate() - 7);
      const fStr = d7.toISOString().slice(0, 10);
      onChange(fStr, todayStr);
      setIsOpen(false);
    } else if (presetId === "last_30_days") {
      const d30 = new Date(today);
      d30.setDate(d30.getDate() - 30);
      const fStr = d30.toISOString().slice(0, 10);
      onChange(fStr, todayStr);
      setIsOpen(false);
    }
  };

  const handleApplyCustom = () => {
    if (customTo < customFrom) {
      alert("End date cannot precede start date.");
      return;
    }
    onChange(customFrom, customTo);
    setIsOpen(false);
  };

  const displayLabel =
    activePreset === "season_to_date"
      ? "Season to date"
      : activePreset === "last_7_days"
        ? "Last 7 days"
        : activePreset === "last_30_days"
          ? "Last 30 days"
          : `${from} → ${to}`;

  return (
    <div className={cn("relative inline-block", className)} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-[#C9A227] cursor-pointer whitespace-nowrap"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <CalendarIcon className="h-3.5 w-3.5 text-slate-500 shrink-0" />
        <span className="truncate max-w-[170px] sm:max-w-none">{displayLabel}</span>
        <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0 ml-1" />
      </button>

      {isOpen && (
        <div className="absolute left-0 sm:right-0 sm:left-auto z-50 mt-1.5 w-72 rounded-xl border border-slate-200 bg-white p-3 shadow-xl animate-in fade-in zoom-in-95">
          <p className="px-2 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Date Range Filter
          </p>
          <div className="space-y-1">
            {DATE_RANGE_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset.id)}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors cursor-pointer",
                  activePreset === preset.id
                    ? "bg-[#FAF4E6] text-[#7D5C13] font-bold"
                    : "text-slate-700 hover:bg-slate-100",
                )}
              >
                <span>{preset.label}</span>
                {activePreset === preset.id && (
                  <Check className="h-3.5 w-3.5 text-[#C9A227]" />
                )}
              </button>
            ))}
          </div>

          {activePreset === "custom" && (
            <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                  From:
                </label>
                <input
                  type="date"
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#C9A227]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                  To:
                </label>
                <input
                  type="date"
                  value={customTo}
                  min={customFrom}
                  onChange={(e) => setCustomTo(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#C9A227]"
                />
              </div>
              <button
                type="button"
                onClick={handleApplyCustom}
                className="w-full mt-2 rounded-lg bg-[#C9A227] px-3 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-[#B8901E] cursor-pointer"
              >
                Apply Custom Range
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

