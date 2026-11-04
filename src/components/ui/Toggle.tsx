import React from "react";
import { cn } from "@/utils/cn";

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: "sm" | "md";
  label?: string;
  tooltip?: string;
  className?: string;
}

export const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  disabled = false,
  size = "md",
  label,
  tooltip,
  className,
}) => {
  const isSmall = size === "sm";

  const toggleElement = (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      title={tooltip}
      className={cn(
        "relative inline-flex shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#C9A227] focus:ring-offset-2",
        checked ? "bg-emerald-600" : "bg-slate-200",
        disabled && "cursor-not-allowed opacity-50",
        isSmall ? "h-5 w-9" : "h-6 w-11",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none inline-block transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out",
          isSmall ? "h-3.5 w-3.5 mt-0.5 ml-0.5" : "h-5 w-5 mt-0.5 ml-0.5",
          checked
            ? isSmall
              ? "translate-x-4"
              : "translate-x-5"
            : "translate-x-0",
        )}
      />
    </button>
  );

  if (label) {
    return (
      <label className="inline-flex items-center gap-2 select-none cursor-pointer">
        {toggleElement}
        <span
          className={cn(
            "text-xs font-medium text-slate-700",
            disabled && "text-slate-400",
          )}
        >
          {label}
        </span>
      </label>
    );
  }

  return toggleElement;
};

export default Toggle;
