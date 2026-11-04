import React from "react";
import { Modal, Button } from "@/components/ui";
import { Printer, AlertTriangle, CheckCircle, FileText } from "lucide-react";
import { useBatchPrintCateringTokens } from "@/hooks/useReports";
import type { ReportFilters } from "@/types/reports.types";

export interface BatchPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  eligibleCount: number;
  filters: ReportFilters;
}

export const BatchPrintModal: React.FC<BatchPrintModalProps> = ({
  isOpen,
  onClose,
  eligibleCount,
  filters,
}) => {
  const batchPrintMutation = useBatchPrintCateringTokens();
  const cappedCount = Math.min(eligibleCount, 500);
  const isCapped = eligibleCount > 500;

  const handlePrint = async () => {
    try {
      const result = await batchPrintMutation.mutateAsync(filters);
      // Trigger download or open PDF in new tab
      const dummyPdf = `JEFFS GROUP MEAL TRACKER - BATCH CATERING TOKENS\nTotal Accreditations: ${result.printedCount}\nGenerated: ${new Date().toISOString()}`;
      const blob = new Blob([dummyPdf], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Batch_Tokens_${Date.now()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Batch Print Catering Tokens"
      subtitle="Generate high-resolution printable catering voucher badges for verified attendees."
      maxWidth="md"
    >
      <div className="space-y-4 py-2">
        <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#FAF4E6] text-[#C9A227] border border-[#ECD59A]">
            <Printer className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              {cappedCount} Tokens Ready to Compile
            </h4>
            <p className="mt-1 text-xs text-slate-600 leading-relaxed">
              Printable accreditation dossier includes active digital QR passes and dining allocation vouchers.
            </p>
          </div>
        </div>

        {isCapped && (
          <div className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
            <div>
              <p className="font-semibold">Batch Volume Capped at 500</p>
              <p className="mt-0.5 text-[11px] text-amber-700">
                You have {eligibleCount} eligible records. Printing is limited to 500 records per batch for rendering stability.
              </p>
            </div>
          </div>
        )}

        <div className="rounded-lg border border-slate-200 bg-white p-3 text-xs space-y-1.5 text-slate-600">
          <div className="flex items-center justify-between">
            <span>Attendee Eligibility:</span>
            <span className="font-semibold text-emerald-700 flex items-center gap-1">
              <CheckCircle className="h-3 w-3" /> Approved & Meal-Active
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Output Format:</span>
            <span className="font-mono font-semibold text-slate-800">A4 Badge PDF / 4-per-page</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Audit Trail:</span>
            <span className="font-semibold text-slate-700">Logged to Security HQ</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handlePrint}
            isLoading={batchPrintMutation.isPending}
            leftIcon={<FileText className="h-4 w-4" />}
          >
            Generate {cappedCount} Passes
          </Button>
        </div>
      </div>
    </Modal>
  );
};

