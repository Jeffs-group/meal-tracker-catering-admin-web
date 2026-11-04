import React from "react";
import { Lock, Check, Plus, Minus } from "lucide-react";
import { cn } from "@/utils/cn";
import { CATERING_MODULES, CATERING_ROLES } from "@/constants/catering";
import { evaluatePermission } from "@/hooks/usePermissions";

export interface PermissionMatrixPreviewProps {
  selectedRoleKey: string;
  previousRoleKey?: string;
  showDiff?: boolean;
  className?: string;
}

export const PermissionMatrixPreview: React.FC<PermissionMatrixPreviewProps> = ({
  selectedRoleKey,
  previousRoleKey,
  showDiff = false,
  className,
}) => {
  const currentRole =
    CATERING_ROLES[selectedRoleKey] ?? CATERING_ROLES.MEAL_OPERATOR!;
  const prevRole = previousRoleKey ? CATERING_ROLES[previousRoleKey] : undefined;

  const currentPerms = currentRole.permissions;
  const prevPerms = prevRole?.permissions || [];

  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200 bg-slate-50/50 overflow-hidden text-xs",
        className,
      )}
    >
      <div className="border-b border-slate-200 bg-white px-4 py-2.5 flex items-center justify-between">
        <div>
          <span className="font-bold text-slate-900 text-xs uppercase tracking-wider">
            Live Permissions Matrix
          </span>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Auto-computed based on selected role:{" "}
            <strong className="text-[#9B7415]">{currentRole.label}</strong>
          </p>
        </div>

        {showDiff && prevRole && prevRole.id !== currentRole.id && (
          <span className="rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
            Role Comparison Active
          </span>
        )}
      </div>

      <div className="divide-y divide-slate-200">
        {CATERING_MODULES.map((module) => {
          const hasView = evaluatePermission(currentPerms, module.key, "view");
          const hasVerify = evaluatePermission(currentPerms, module.key, "verify");
          const hasProvide = evaluatePermission(currentPerms, module.key, "provide");
          const hasManage = evaluatePermission(currentPerms, module.key, "manage");
          const hasCreate = evaluatePermission(currentPerms, module.key, "create");
          const hasEdit = evaluatePermission(currentPerms, module.key, "edit");

          const prevHasView = prevRole ? evaluatePermission(prevPerms, module.key, "view") : false;
          const prevHasProvide = prevRole ? evaluatePermission(prevPerms, module.key, "provide") : false;

          const isLocked = !hasView && !hasManage && !hasProvide;

          return (
            <div
              key={module.key}
              className="p-3.5 sm:px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{module.label}</span>
                  {showDiff && prevRole && prevHasView !== hasView && (
                    <span
                      className={cn(
                        "inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.2 rounded",
                        hasView
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-rose-50 text-rose-700",
                      )}
                    >
                      {hasView ? <Plus className="h-2.5 w-2.5" /> : <Minus className="h-2.5 w-2.5" />}
                      {hasView ? "Access Added" : "Access Removed"}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">{module.description}</p>
              </div>

              {/* Action / Tier Badges */}
              <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                {isLocked ? (
                  <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 border border-slate-200 px-2 py-1 text-[11px] font-medium text-slate-500 select-none">
                    <Lock className="h-3 w-3 text-slate-400" />
                    <span>No Access – Locked</span>
                  </span>
                ) : (
                  <>
                    {hasView && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 border border-slate-200 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                        <Check className="h-3 w-3 text-emerald-600" />
                        <span>View</span>
                      </span>
                    )}
                    {hasVerify && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-[#FAF4E6] border border-[#ECD59A] px-2 py-0.5 text-[11px] font-semibold text-[#9B7415]">
                        <Check className="h-3 w-3 text-[#C9A227]" />
                        <span>Verify</span>
                      </span>
                    )}
                    {hasProvide && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                        <Check className="h-3 w-3 text-emerald-600" />
                        <span>Provide Meal</span>
                        {showDiff && prevRole && !prevHasProvide && (
                          <span className="text-[9px] font-extrabold text-emerald-600 ml-0.5">+</span>
                        )}
                      </span>
                    )}
                    {(hasCreate || hasEdit) && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 border border-blue-200 px-2 py-0.5 text-[11px] font-semibold text-blue-800">
                        <Check className="h-3 w-3 text-blue-600" />
                        <span>Create & Edit</span>
                      </span>
                    )}
                    {hasManage && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-[#C9A227] text-white px-2 py-0.5 text-[11px] font-bold shadow-2xs">
                        <Check className="h-3 w-3 text-white" />
                        <span>Full Governance</span>
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PermissionMatrixPreview;
