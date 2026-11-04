import React, { useState, useRef, useEffect, forwardRef } from "react";
import { ChevronsUpDown, Check } from "lucide-react";
import { cn } from "@/utils/cn";

export interface SelectOption {
  value: string;
  label: string;
  badge?: string;
  icon?: React.ReactNode;
}

export interface SelectProps extends Omit<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  "size"
> {
  options: SelectOption[];
  icon?: React.ReactNode;
  placeholder?: string;
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      options,
      icon,
      disabled,
      value,
      onChange,
      placeholder = "Select an option...",
      label,
      error,
      fullWidth = false,
      ...props
    },
    ref,
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const hiddenSelectRef = useRef<HTMLSelectElement | null>(null);

    // Selected option object
    const selectedOption = options.find((opt) => opt.value === String(value));

    // Handle click outside to close dropdown
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
        }
      };

      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          setIsOpen(false);
        }
      };

      if (isOpen) {
        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleEscape);
      }

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("keydown", handleEscape);
      };
    }, [isOpen]);

    const handleSelectOption = (optValue: string) => {
      if (disabled) return;
      setIsOpen(false);

      // Trigger synthetic change event on the hidden select
      if (onChange) {
        const syntheticEvent = {
          target: {
            value: optValue,
            name: props.name || "",
          },
        } as React.ChangeEvent<HTMLSelectElement>;
        onChange(syntheticEvent);
      }
    };

    return (
      <div
        ref={containerRef}
        className={cn(
          "relative",
          fullWidth ? "w-full" : "inline-block min-w-[160px]",
        )}
      >
        {label && (
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
            {label}
          </label>
        )}

        {/* Hidden native select for form integration / ref passing */}
        <select
          ref={(node) => {
            hiddenSelectRef.current = node;
            if (typeof ref === "function") ref(node);
            else if (ref) ref.current = node;
          }}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className="sr-only pointer-events-none"
          tabIndex={-1}
          aria-hidden="true"
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Custom styled trigger button */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setIsOpen((prev) => !prev)}
          className={cn(
            "flex w-full items-center justify-between rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-medium text-slate-800 shadow-2xs transition-all duration-150 cursor-pointer select-none",
            "hover:border-slate-400 hover:bg-slate-50/50",
            "focus:border-[#C9A227] focus:outline-none focus:ring-1 focus:ring-[#C9A227]",
            isOpen && "border-[#C9A227] ring-1 ring-[#C9A227] bg-white",
            disabled &&
              "cursor-not-allowed bg-slate-50 text-slate-400 border-slate-200 opacity-60",
            error &&
              "border-rose-400 focus:border-rose-500 focus:ring-rose-500",
            className,
          )}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <div className="flex items-center gap-2 truncate">
            {icon && <span className="shrink-0 text-slate-400">{icon}</span>}
            {selectedOption ? (
              <span className="truncate text-slate-900 font-medium">
                {selectedOption.label}
              </span>
            ) : (
              <span className="truncate text-slate-400">{placeholder}</span>
            )}
          </div>

          <ChevronsUpDown
            className={cn(
              "h-3.5 w-3.5 shrink-0 text-slate-400 ml-2 transition-transform duration-150",
              isOpen && "text-[#C9A227]",
            )}
            aria-hidden="true"
          />
        </button>

        {/* Floating Custom Dropdown Listing */}
        {isOpen && (
          <div
            className="absolute left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto rounded-xl border border-slate-200 bg-white py-1.5 shadow-xl animate-in fade-in zoom-in-95 duration-100 min-w-full"
            role="listbox"
          >
            {options.map((opt) => {
              const isSelected = opt.value === String(value);
              return (
                <div
                  key={opt.value}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelectOption(opt.value)}
                  className={cn(
                    "flex items-center justify-between px-3 py-2 text-xs transition-colors cursor-pointer select-none",
                    isSelected
                      ? "bg-[#FAF4E6] text-[#9B7415] font-semibold"
                      : "text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium",
                  )}
                >
                  <div className="flex items-center gap-2 truncate">
                    {opt.icon && <span>{opt.icon}</span>}
                    <span className="truncate">{opt.label}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    {opt.badge && (
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
                        {opt.badge}
                      </span>
                    )}
                    {isSelected && (
                      <Check className="h-3.5 w-3.5 text-[#C9A227]" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
      </div>
    );
  },
);

Select.displayName = "Select";
export default Select;
