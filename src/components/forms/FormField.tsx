import React from "react";
import type { FieldError } from "react-hook-form";
import { Label } from "@/components/ui/Label";
import { cn } from "@/utils/cn";

export interface FormFieldProps {
  id?: string;
  label?: string;
  required?: boolean;
  error?: FieldError | string;
  helperText?: string;
  className?: string;
  children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
  id,
  label,
  required,
  error,
  helperText,
  className,
  children,
}) => {
  const errorMessage = typeof error === "string" ? error : error?.message;

  return (
    <div className={cn("w-full space-y-1.5", className)}>
      {label && (
        <Label htmlFor={id} required={required}>
          {label}
        </Label>
      )}
      <div>{children}</div>
      {errorMessage ? (
        <p
          className="text-xs font-medium text-red-600"
          role="alert"
          id={id ? `${id}-error` : undefined}
        >
          {errorMessage}
        </p>
      ) : helperText ? (
        <p
          className="text-xs text-slate-500"
          id={id ? `${id}-description` : undefined}
        >
          {helperText}
        </p>
      ) : null}
    </div>
  );
};
