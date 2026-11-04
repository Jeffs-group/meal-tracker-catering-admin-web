import React, { useState, useEffect } from "react";
import { Hash, Copy, Check, Info } from "lucide-react";
import { computeLedgerDigest } from "@/utils/cateringClock";
import { cn } from "@/utils/cn";

export interface LedgerDigestProps {
  records: Array<{ id: string; providedAt: string }>;
  className?: string;
}

export const LedgerDigest: React.FC<LedgerDigestProps> = ({
  records,
  className,
}) => {
  const [digest, setDigest] = useState("00000000");
  const [copied, setCopied] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    let isCurrent = true;
    computeLedgerDigest(records).then((hex) => {
      if (isCurrent) setDigest(hex);
    });
    return () => {
      isCurrent = false;
    };
  }, [records]);

  const handleCopy = () => {
    navigator.clipboard.writeText(digest);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        "relative inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs shadow-2xs select-none",
        className,
      )}
    >
      <div className="flex items-center gap-1.5 text-slate-500">
        <Hash className="h-3.5 w-3.5 text-[#C9A227]" />
        <span className="font-semibold text-[11px] uppercase tracking-wider text-slate-500">
          Ledger Digest:
        </span>
      </div>

      <span className="font-mono font-bold text-slate-900 tracking-wider">
        #{digest}
      </span>

      <button
        type="button"
        onClick={handleCopy}
        title="Copy 8-character ledger digest"
        className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
        aria-label="Copy ledger digest"
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-emerald-600" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
      </button>

      {/* Info Tooltip Trigger */}
      <div className="relative">
        <button
          type="button"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          onClick={() => setShowTooltip((p) => !p)}
          className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
          aria-label="Learn about ledger digest"
        >
          <Info className="h-3.5 w-3.5" />
        </button>

        {showTooltip && (
          <div className="absolute right-0 bottom-full mb-2 w-64 rounded-xl border border-slate-200 bg-slate-900 p-2.5 text-[11px] text-white shadow-xl z-50">
            <p className="font-bold text-[#DEC067] mb-1">
              Cryptographic Ledger Digest
            </p>
            <p className="text-slate-300 leading-relaxed">
              Real-time SHA-256 digest computed via Web Cryptography API over all {records.length}{" "}
              filtered record IDs and timestamps. Verifies immutability of today's dispensation log.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LedgerDigest;

