import React from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/utils/cn";

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = "Search...",
  className,
  disabled = false,
}) => {
  return (
    <div className={cn("relative w-full max-w-xs", className)}>
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
        <Search className="h-4 w-4" aria-hidden="true" />
      </div>
      <input
        type="text"
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "block w-full h-9 rounded-lg border border-slate-300 bg-white py-1.5 pl-9 pr-8 text-xs text-slate-900 placeholder:text-slate-400 transition-colors",
          "focus:border-[#C9A227] focus:outline-none focus:ring-1 focus:ring-[#C9A227]",
          "disabled:bg-slate-50 disabled:text-slate-400",
        )}
      />
      {value && !disabled && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400 hover:text-slate-600"
          aria-label="Clear search"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
};

export default SearchInput;
