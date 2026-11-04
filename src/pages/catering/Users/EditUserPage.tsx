import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ChevronRight,
  Save,
  RotateCcw,
  Ban,
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FormSection } from "@/components/catering/FormSection";
import { PermissionMatrixPreview } from "@/components/catering/PermissionMatrixPreview";
import { DeactivateUserDialog } from "@/components/catering/DeactivateUserDialog";
import { useUserDossier, useUserMutations } from "@/hooks/useCatering";
import { useAuthStore } from "@/stores/authStore";
import { usePermissions } from "@/hooks/usePermissions";
import { CATERING_ROLES } from "@/constants/catering";
import { ROUTES } from "@/constants/routes";
import type { CateringRoleKey } from "@/types/catering.types";

export const EditUserPage: React.FC = () => {
  const { userId = "usr-002" } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const { can } = usePermissions();

  const { data: user, isLoading } = useUserDossier(userId);
  const { update } = useUserMutations();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedRole, setSelectedRole] = useState<CateringRoleKey>("MEAL_OPERATOR");
  const [isDeactivateOpen, setIsDeactivateOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName);
      setEmail(user.email);
      setPhone(user.phone || "");
      setSelectedRole(user.roleId);
    }
  }, [user]);

  if (isLoading || !user) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center text-xs text-slate-500">
          Loading user dossier…
        </div>
      </div>
    );
  }

  const isSelf = user.id === currentUser?.id;
  const isDirty =
    fullName !== user.fullName ||
    email !== user.email ||
    phone !== (user.phone || "") ||
    selectedRole !== user.roleId;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      setFormError("Full name and corporate email address are required.");
      return;
    }

    if (isSelf && selectedRole !== "SUPER_ADMIN" && user.roleId === "SUPER_ADMIN") {
      setFormError("Security safeguard: You cannot demote your own Super Admin access.");
      return;
    }

    setFormError(null);
    try {
      await update.mutateAsync({
        userId: user.id,
        data: {
          fullName: fullName.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim() || undefined,
          roleId: selectedRole,
        },
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setFormError(err.message);
      } else {
        setFormError("Failed to update user profile.");
      }
    }
  };

  const handleRevert = () => {
    setFullName(user.fullName);
    setEmail(user.email);
    setPhone(user.phone || "");
    setSelectedRole(user.roleId);
    setFormError(null);
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Top Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-500">
        <Link to={ROUTES.CATERING.USERS} className="hover:text-slate-800 transition-colors">
          User Management
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
        <span className="font-semibold text-slate-800">Edit User</span>
      </nav>

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-1 border-b border-slate-200 gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-[clamp(24px,2vw+16px,32px)] font-bold tracking-tight text-slate-900 leading-[1.25]">
              Edit User & Role Assignment
            </h1>
            <span className="font-mono text-xs font-bold text-slate-600 rounded-lg bg-slate-100 border border-slate-200 px-2 py-0.5">
              {user.userCode}
            </span>
            <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
              Status: {user.status.replace("_", " ")}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-600 leading-relaxed">
            Update personnel credentials, modify tournament module scopes, and manage access standing.
          </p>
        </div>

        <Link
          to={ROUTES.CATERING.USERS}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors self-start sm:self-auto"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Users</span>
        </Link>
      </div>

      {user.pendingEmail && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-amber-600 shrink-0" />
            <span>
              Email verification pending for <strong>{user.pendingEmail}</strong>. Current email{" "}
              <strong>{user.email}</strong> remains active until verified.
            </span>
          </div>
        </div>
      )}

      {formError && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800"
        >
          <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{formError}</span>
        </div>
      )}

      {saveSuccess && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>User profile and security permissions updated successfully!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 01: Personal Details */}
        <FormSection
          sectionNumber="01"
          title="Personnel Identification"
          description="Update personal identification details and contact information."
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Corporate Email Address <span className="text-rose-500">*</span>
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="text-xs"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Changing email sends a verification link to the new address.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Contact Number
              </label>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="text-xs font-mono"
              />
            </div>
          </div>
        </FormSection>

        {/* Section 02: Role & Module Privileges */}
        <FormSection
          sectionNumber="02"
          title="Role Assignment & Privileges"
          description="Modify module governance policies across matchday terminals."
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Assigned Operational Role <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as CateringRoleKey)}
                className="w-full max-w-md rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#C9A227] cursor-pointer"
              >
                {Object.values(CATERING_ROLES).map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.label} — {role.description}
                  </option>
                ))}
              </select>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-900">
              Role modification updates active session tokens immediately across matchday terminals.
            </div>

            {/* Live Comparison Permissions Matrix Preview */}
            <div className="pt-2">
              <PermissionMatrixPreview
                selectedRoleKey={selectedRole}
                previousRoleKey={user.roleId}
                showDiff={true}
              />
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs text-slate-600 flex items-start gap-2.5">
              <Lock className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
              <span>
                Updating this user's role refreshes their active sessions. Permissions change immediately;
                passwords are never exposed or modified.
              </span>
            </div>
          </div>
        </FormSection>

        {/* Sticky / Pinned Footer */}
        <div className="sticky bottom-4 z-20 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="w-full sm:w-auto">
            {can("users", "manage") && (
              <Button
                type="button"
                variant="destructive"
                size="md"
                onClick={() => setIsDeactivateOpen(true)}
                className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs w-full sm:w-auto justify-center"
                leftIcon={<Ban className="h-4 w-4" />}
              >
                Deactivate Account
              </Button>
            )}
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={handleRevert}
              disabled={!isDirty || update.isPending}
              className="rounded-xl text-xs w-full sm:w-auto justify-center"
              leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
            >
              Cancel & Revert
            </Button>

            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={!isDirty || update.isPending}
              isLoading={update.isPending}
              className="rounded-xl bg-[#C9A227] hover:bg-[#B8901E] text-white shadow-xs font-semibold px-5 w-full sm:w-auto justify-center"
              leftIcon={<Save className="h-4 w-4" />}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </form>

      {/* Deactivate User Dialog */}
      <DeactivateUserDialog
        isOpen={isDeactivateOpen}
        mode="deactivate"
        user={user}
        currentUserId={currentUser?.id}
        onClose={() => setIsDeactivateOpen(false)}
        onConfirm={async () => {
          navigate(ROUTES.CATERING.USERS);
        }}
      />
    </div>
  );
};

export default EditUserPage;
