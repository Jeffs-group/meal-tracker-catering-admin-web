import React, { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/utils/cn";

export type ButtonVariant =
  "primary" | "secondary" | "outline" | "ghost" | "destructive" | "dark";
export type ButtonSize = "xs" | "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-[#C9A227] text-white hover:bg-[#B8901E] active:bg-[#9B7415] border border-transparent shadow-xs focus-visible:ring-2 focus-visible:ring-[#C9A227] focus-visible:ring-offset-1 font-semibold",
  secondary:
    "bg-slate-100 text-slate-800 hover:bg-slate-200 active:bg-slate-300 border border-transparent focus-visible:ring-2 focus-visible:ring-slate-400 font-medium",
  outline:
    "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 active:bg-slate-100 shadow-2xs focus-visible:ring-2 focus-visible:ring-[#C9A227] font-medium",
  ghost:
    "text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200 border border-transparent focus-visible:ring-2 focus-visible:ring-slate-400 font-medium",
  destructive:
    "bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 border border-transparent shadow-xs focus-visible:ring-2 focus-visible:ring-rose-500 font-semibold",
  dark: "bg-[#111111] text-white hover:bg-[#1F2937] active:bg-black border border-transparent shadow-xs focus-visible:ring-2 focus-visible:ring-slate-700 font-medium",
};

const sizeStyles: Record<ButtonSize, string> = {
  xs: "h-[28px] px-2.5 text-[11px] gap-1 rounded-md",
  sm: "h-[32px] px-3 text-xs gap-1.5 rounded-lg",
  md: "h-[38px] px-4 text-xs gap-2 rounded-lg",
  lg: "h-[44px] px-5 text-sm gap-2.5 rounded-lg",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      leftIcon,
      rightIcon,
      children,
      type = "button",
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={cn(
          "inline-flex items-center justify-center font-sans transition-all duration-150 select-none cursor-pointer",
          "focus-visible:outline-none focus-visible:ring-offset-1",
          "disabled:pointer-events-none disabled:opacity-45",
          variantStyles[variant],
          sizeStyles[size],
          className,
        )}
        {...props}
      >
        {isLoading ? (
          <Loader2
            className="h-3.5 w-3.5 animate-spin shrink-0"
            aria-hidden="true"
          />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        {children && <span className="leading-none">{children}</span>}
        {!isLoading && rightIcon && (
          <span className="shrink-0">{rightIcon}</span>
        )}
      </button>
    );
  },
);

Button.displayName = "Button";
