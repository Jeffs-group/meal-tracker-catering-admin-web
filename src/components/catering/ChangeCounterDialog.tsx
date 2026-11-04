import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { COUNTERS } from "@/constants/catering";
import type { Counter } from "@/types/catering.types";
import { Check, Store } from "lucide-react";
import { cn } from "@/utils/cn";

export interface ChangeCounterDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentCounterId: string;
  onSelectCounter: (counterId: string) => void;
}

export const ChangeCounterDialog: React.FC<ChangeCounterDialogProps> = ({
  isOpen,
  onClose,
  currentCounterId,
  onSelectCounter,
}) => {
  const [selectedId, setSelectedId] = useState(currentCounterId);

  const handleConfirm = () => {
    onSelectCounter(selectedId);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Active Station Assignment"
      subtitle="Select the counter terminal currently paired with this operator session."
      maxWidth="md"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleConfirm}>
            Set Active Counter
          </Button>
        </>
      }
    >
      <div className="p-4 space-y-2.5">
        {COUNTERS.map((counter: Counter) => {
          const isSelected = counter.id === selectedId;
          return (
            <div
              key={counter.id}
              onClick={() => setSelectedId(counter.id)}
              className={cn(
                "flex items-center justify-between rounded-xl border p-3.5 cursor-pointer transition-all select-none",
                isSelected
                  ? "border-[#C9A227] bg-[#FAF4E6] text-[#7D5C13] shadow-xs"
                  : "border-slate-200 bg-white hover:bg-slate-50 text-slate-800",
              )}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg border shrink-0",
                    isSelected
                      ? "border-[#DEC067] bg-white text-[#9B7415]"
                      : "border-slate-200 bg-slate-100 text-slate-500",
                  )}
                >
                  <Store className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold leading-tight truncate">
                    {counter.name}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {counter.terminal} • {counter.gate}
                  </p>
                </div>
              </div>

              {isSelected && (
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#C9A227] text-white shrink-0">
                  <Check className="h-3 w-3 stroke-[3]" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Modal>
  );
};

export default ChangeCounterDialog;

