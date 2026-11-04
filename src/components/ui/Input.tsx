import React, { forwardRef } from "react";
import { cn } from "@/utils/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean | string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, leftIcon, rightIcon, disabled, id, ...props }, ref) => {
    return (
      <div className="relative w-full">
        {leftIcon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          id={id}
          disabled={disabled}
          className={cn(
            "flex h-9 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 transition-colors placeholder:text-slate-400",
            "focus:border-[#C9A227] focus:outline-none focus:ring-1 focus:ring-[#C9A227]",
            "disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500",
            leftIcon && "pl-10",
            rightIcon && "pr-10",
            error &&
              "border-red-500 focus:border-red-500 focus:ring-red-500/20",
            className,
          )}
          aria-invalid={!!error}
          {...props}
        />
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 z-10">
            {rightIcon}
          </div>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
