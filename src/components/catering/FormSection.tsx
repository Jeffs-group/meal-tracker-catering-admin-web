import React from "react";
import { cn } from "@/utils/cn";

export interface FormSectionProps {
  sectionNumber: string | number; // "01", "02"
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export const FormSection: React.FC<FormSectionProps> = ({
  sectionNumber,
  title,
  description,
  children,
  className,
}) => {
  const numStr = String(sectionNumber).padStart(2, "0");

  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden",
        className,
      )}
    >
      {/* Header with gold chip-left variant */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 bg-slate-50/60 px-5 py-4 gap-2">
        <div className="flex items-center gap-3">
          <div className="flex h-7 items-center justify-center rounded-lg bg-[#FAF4E6] border border-[#ECD59A] px-2.5 text-xs font-bold font-mono text-[#9B7415] shrink-0 select-none">
            SECTION {numStr}
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
              {title}
            </h3>
            {description && (
              <p className="text-xs text-slate-500 mt-0.5">{description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 sm:p-6">{children}</div>
    </div>
  );
};

export default FormSection;

