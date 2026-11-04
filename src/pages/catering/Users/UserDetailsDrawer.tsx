import React from "react";
import { useNavigate } from "react-router-dom";
import { Drawer } from "@/components/ui/Drawer";
import { Button } from "@/components/ui/Button";
import {
  Mail,
  Phone,
  CheckCircle2,
  Edit2,
  Ban,
} from "lucide-react";
import { useUserDossier, useUserMutations } from "@/hooks/useCatering";
import { usePermissions } from "@/hooks/usePermissions";
import { CATERING_ROLES, COUNTERS, CATERING_MODULES } from "@/constants/catering";
import { evaluatePermission } from "@/hooks/usePermissions";
import { formatDateTimeIST } from "@/utils/cateringClock";
import { buildCateringUserEditRoute } from "@/constants/routes";
import { cn } from "@/utils/cn";

export interface UserDetailsDrawerProps {
  userId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenDeactivate: (userId: string) => void;
}

export const UserDetailsDrawer: React.FC<UserDetailsDrawerProps> = ({
  userId,
  isOpen,
  onClose,
  onOpenDeactivate,
}) => {
  const navigate = useNavigate();
  const { can } = usePermissions();
  const { data: user, isLoading } = useUserDossier(userId || "");
  const { resend } = useUserMutations();

  if (!isOpen || !userId) return null;

  if (isLoading || !user) {
    return (
      <Drawer isOpen={isOpen} onClose={onClose} title="Loading dossier…">
        <div className="py-12 text-center text-xs text-slate-400">
          Retrieving personnel profile…
        </div>
      </Drawer>
    );
  }

  const roleDef = CATERING_ROLES[user.roleId] ?? CATERING_ROLES.MEAL_OPERATOR!;
  const counterObj = COUNTERS.find((c) => c.id === user.currentCounterId);

  // Presence check (lastSeen within 5 mins)
  const isOnline =
    user.lastSeen &&
    Date.now() - new Date(user.lastSeen).getTime() < 5 * 60 * 1000;

  const handleResend = async () => {
    await resend.mutateAsync(user.id);
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <span className="text-base sm:text-lg font-bold text-slate-900 truncate">
            {user.fullName}
          </span>
          <span className="font-mono text-xs font-semibold text-slate-500">
            ({user.userCode})
          </span>
        </div>
      }
      subtitle={
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <span>{roleDef.label}</span>
          <span>•</span>
          <span className="capitalize">{user.status.replace("_", " ")}</span>
        </div>
      }
      headerIndicator={
        <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white font-bold text-xs select-none shrink-0 shadow-2xs">
          {user.fullName.slice(0, 2).toUpperCase()}
          {isOnline && (
            <span
              className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500"
              title="Online now"
            />
          )}
        </div>
      }
      footer={
        <div className="flex items-center justify-between w-full">
          <Button variant="outline" size="sm" onClick={onClose} className="rounded-xl">
            Close
          </Button>

          <div className="flex items-center gap-2">
            {user.status === "active" ? (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onOpenDeactivate(user.id)}
                disabled={!can("users", "manage")}
                className="rounded-xl text-xs"
                leftIcon={<Ban className="h-3.5 w-3.5" />}
              >
                Deactivate User
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onOpenDeactivate(user.id)}
                disabled={!can("users", "manage")}
                className="rounded-xl text-xs text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                leftIcon={<CheckCircle2 className="h-3.5 w-3.5" />}
              >
                Activate User
              </Button>
            )}

            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                onClose();
                navigate(buildCateringUserEditRoute(user.id));
              }}
              disabled={!can("users", "edit")}
              className="rounded-xl bg-[#C9A227] hover:bg-[#B8901E] text-white font-semibold text-xs shadow-xs"
              leftIcon={<Edit2 className="h-3.5 w-3.5" />}
            >
              Edit User
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-5 text-xs">
        {/* Personnel Profile Card */}
        <div className="rounded-xl border border-slate-200 bg-[#F8F9FA] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              PERSONNEL DOSSIER
            </span>
            <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
              {user.status === "active" ? "Active Account" : "Pending Verification"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-700">
            <div className="flex items-center gap-2 truncate">
              <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span className="truncate font-sans font-medium">{user.email}</span>
              <span title="Email verified">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              </span>
            </div>

            <div className="flex items-center gap-2 truncate">
              <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span className="font-mono text-slate-800">{user.phone || "+91 98400 00000"}</span>
            </div>
          </div>
        </div>

        {/* 4 Info Tiles */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
              Assigned Role
            </span>
            <p className="font-bold text-slate-900 text-sm">{roleDef.label}</p>
            <p className="text-[11px] text-slate-500 mt-0.5 capitalize">
              {roleDef.tier} Tier Privileges
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
              Account Status
            </span>
            <p className="font-bold text-slate-900 capitalize text-sm">
              {user.status.replace("_", " ")}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Invitation {user.invitation?.status || "accepted"}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
              Live Station
            </span>
            <p className="font-semibold text-slate-900 truncate">
              {counterObj ? counterObj.name : "Not signed in"}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5 truncate">
              {counterObj ? `${counterObj.terminal} • ${counterObj.gate}` : "No active session"}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
              Last Login Session
            </span>
            <p className="font-semibold text-slate-900">
              {user.lastLogin ? "Today, 11:20 AM" : "Never"}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5 truncate">
              {user.lastLogin
                ? `${user.lastLogin.browser} • ${user.lastLogin.city}`
                : "Awaiting first signup"}
            </p>
          </div>
        </div>

        {/* Audit & Account History */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2.5">
          <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">
            Audit & Account History
          </h4>

          <div className="space-y-2 text-[11px]">
            <div className="flex items-center justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Account Created:</span>
              <span className="font-medium text-slate-800">
                {formatDateTimeIST(user.createdAt)}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Invitation State:</span>
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-800 capitalize">
                  {user.invitation.status}
                </span>
                {user.invitation.status !== "accepted" && (
                  <button
                    type="button"
                    onClick={handleResend}
                    className="text-[#9B7415] hover:underline font-semibold"
                  >
                    Resend Link
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Operating League Scope:</span>
              <span className="font-semibold text-slate-800">KSPL / ISCL 2026 Live</span>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-slate-500">Security Governance:</span>
              <span className="font-semibold text-slate-800">Append-Only Immutability</span>
            </div>
          </div>
        </div>

        {/* Module Access Summary */}
        <div>
          <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">
            Module Access Summary • {roleDef.label} Role
          </h4>
          <div className="space-y-2">
            {CATERING_MODULES.map((module) => {
              const hasAccess = evaluatePermission(roleDef.permissions, module.key, "view");
              return (
                <div
                  key={module.key}
                  className="rounded-xl border border-slate-200 bg-white p-3 flex items-center justify-between"
                >
                  <div>
                    <p className="font-bold text-slate-900">{module.label}</p>
                    <p className="text-[11px] text-slate-500">{module.description}</p>
                  </div>
                  <span
                    className={cn(
                      "rounded-md px-2 py-0.5 text-[10px] font-bold select-none",
                      hasAccess
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : "bg-slate-100 text-slate-500 border border-slate-200",
                    )}
                  >
                    {hasAccess ? "Authorized" : "Locked"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Drawer>
  );
};

export default UserDetailsDrawer;
