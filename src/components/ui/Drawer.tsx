import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/utils/cn";

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  headerIndicator?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: string;
  className?: string;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  headerIndicator,
  children,
  footer,
  width = "w-full max-w-full sm:max-w-[560px]",
  className,
}) => {
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex justify-end overflow-hidden"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div
        ref={drawerRef}
        className={cn(
          "relative z-10 flex h-full flex-col bg-white shadow-2xl transition-transform animate-in slide-in-from-right duration-250 border-l border-slate-200",
          width,
          className,
        )}
      >
        {/* Header */}
        {(title || subtitle) && (
          <div className="flex items-start justify-between border-b border-slate-200 px-4 sm:px-6 py-3 bg-white shrink-0">
            <div className="flex items-start gap-3 min-w-0">
              {headerIndicator && (
                <div className="mt-0.5 shrink-0">{headerIndicator}</div>
              )}
              <div className="min-w-0">
                {title && (
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight truncate">
                    {title}
                  </h3>
                )}
                {subtitle && (
                  <div className="text-xs text-slate-500 mt-0.5 font-normal truncate">
                    {subtitle}
                  </div>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer shrink-0 ml-2"
              aria-label="Close drawer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 pt-3 pb-5 bg-white">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="border-t border-slate-200 px-4 sm:px-6 py-3 bg-white shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Drawer;
