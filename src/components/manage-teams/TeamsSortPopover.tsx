import React, { useState, useRef, useEffect } from "react";
import { SlidersHorizontal, Check } from "lucide-react";
import { SORT_OPTIONS } from "@/constants/leagues";
import { cn } from "@/utils/cn";

export interface TeamsSortPopoverProps {
  currentSort: string;
  onSelectSort: (sort: string) => void;
}

export const TeamsSortPopover: React.FC<TeamsSortPopoverProps> = ({
  currentSort,
  onSelectSort,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <div className="relative inline-block text-left">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label="Sort options"
        title="Sort options"
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          "inline-flex h-9 w-9 items-center justify-center rounded-xl border transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#C9A227]",
          isOpen
            ? "border-[#C9A227] bg-[#FAF4E6] text-[#9B7415]"
            : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900",
        )}
      >
        <SlidersHorizontal className="h-4 w-4" />
      </button>

      {isOpen && (
        <div
          ref={popoverRef}
          role="dialog"
          aria-label="Sort options"
          className="absolute right-0 z-40 mt-1.5 w-48 origin-top-right rounded-xl border border-slate-200 bg-white py-1.5 shadow-lg shadow-black/5 animate-in fade-in zoom-in-95 outline-none"
        >
          <div className="px-3 py-1.5 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Sort Teams By
          </div>
          <div className="py-1">
            {SORT_OPTIONS.map((opt) => {
              const isSelected = currentSort === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onSelectSort(opt.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors text-left",
                    isSelected && "text-[#9B7415] bg-[#FAF4E6]/50",
                  )}
                >
                  <span>{opt.label}</span>
                  {isSelected && (
                    <Check className="h-3.5 w-3.5 text-[#C9A227]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamsSortPopover;
