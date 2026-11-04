import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ChevronRight,
  UserPlus,
  AlertTriangle,
  Lock,
  ArrowLeft,
  User,
  ShieldCheck,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FormSection } from "@/components/catering/FormSection";
import { useUserMutations } from "@/hooks/useCatering";
import { useSuperRolesList } from "@/hooks/useSuperAdminApi";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/utils/cn";
import type { CateringRoleKey } from "@/types/catering.types";

interface PermissionAction {
  key: string;
  label: string;
  desc: string;
  badge: "VIEW" | "VERIFY" | "PROVIDE" | "MANAGE";
}

interface PermissionModuleConfig {
  key: string;
  name: string;
  desc: string;
  actions: PermissionAction[];
}

const MODULES_CONFIG: PermissionModuleConfig[] = [
  {
    key: "dashboard",
    name: "Dashboard",
    desc: "Operational metrics, active tournament teams, and matchday live velocity summaries",
    actions: [
      {
        key: "dashboard:view",
        label: "View Dashboard Overview",
        desc: "Access live counts, active counters, and fulfillment metrics",
        badge: "VIEW",
      },
    ],
  },
  {
    key: "meals",
    name: "Manage Meals",
    desc: "Matchday rosters, participant accreditation, QR scanning, and terminal portion dispensing",
    actions: [
      {
        key: "meals:view",
        label: "View Meal Rosters",
        desc: "Access matchday cricket team and tournament staff member rosters",
        badge: "VIEW",
      },
      {
        key: "meals:verify",
        label: "Verify Accreditation",
        desc: "Scan QR barcodes and validate passcodes at counter stations",
        badge: "VERIFY",
      },
      {
        key: "meals:provide",
        label: "Dispense Meals",
        desc: "Authorize meal portions, lock claims, and append to audit ledger",
        badge: "PROVIDE",
      },
      {
        key: "meals:manage",
        label: "Meal Configuration",
        desc: "Configure operating sessions, active service timings, and meal periods",
        badge: "MANAGE",
      },
    ],
  },
  {
    key: "users",
    name: "User Management",
    desc: "Personnel directory governance, administrative security, and user onboarding",
    actions: [
      {
        key: "users:view",
        label: "View User Directory",
        desc: "Inspect personnel rosters, terminal sessions, and audit history",
        badge: "VIEW",
      },
      {
        key: "users:manage",
        label: "Manage Accounts & Roles",
        desc: "Invite new users, update permissions, and activate/deactivate accounts",
        badge: "MANAGE",
      },
    ],
  },
];

export const AddUserPage: React.FC = () => {
  const navigate = useNavigate();
  const { create } = useUserMutations();
  const { data: superRoles } = useSuperRolesList();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Direct Interactive Module Permissions State
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([
    "dashboard:view",
    "meals:view",
    "meals:verify",
    "meals:provide",
  ]);

  const [formError, setFormError] = useState<string | null>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setFormError("Only JPG or PNG profile photos are supported.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setFormError("Photo size must not exceed 2MB.");
      return;
    }

    setFormError(null);
    const reader = new FileReader();
    reader.onload = (evt) => {
      setAvatarPreview(evt.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const togglePermission = (actionKey: string) => {
    setSelectedPermissions((prev) => {
      let next = [...prev];
      const isSelected = next.includes(actionKey);

      if (isSelected) {
        // Uncheck actionKey and cascade removals
        next = next.filter((k) => k !== actionKey);
        if (actionKey === "meals:view") {
          next = next.filter((k) => !k.startsWith("meals:"));
        } else if (actionKey === "meals:verify") {
          next = next.filter((k) => k !== "meals:provide" && k !== "meals:manage");
        } else if (actionKey === "meals:provide") {
          next = next.filter((k) => k !== "meals:manage");
        } else if (actionKey === "users:view") {
          next = next.filter((k) => k !== "users:manage");
        }
      } else {
        // Check actionKey and cascade dependencies
        next.push(actionKey);
        if (actionKey === "meals:provide") {
          if (!next.includes("meals:verify")) next.push("meals:verify");
          if (!next.includes("meals:view")) next.push("meals:view");
        } else if (actionKey === "meals:verify") {
          if (!next.includes("meals:view")) next.push("meals:view");
        } else if (actionKey === "meals:manage") {
          if (!next.includes("meals:provide")) next.push("meals:provide");
          if (!next.includes("meals:verify")) next.push("meals:verify");
          if (!next.includes("meals:view")) next.push("meals:view");
        } else if (actionKey === "users:manage") {
          if (!next.includes("users:view")) next.push("users:view");
        }
      }

      return Array.from(new Set(next));
    });
  };

  const handleApplyPreset = (preset: "operator" | "admin" | "all" | "clear") => {
    if (preset === "all" || preset === "admin") {
      const all = MODULES_CONFIG.flatMap((m) => m.actions.map((a) => a.key));
      setSelectedPermissions(all);
      const adminRole = superRoles?.find(
        (r) =>
          r.name.toLowerCase().includes("super") ||
          r.name.toLowerCase().includes("admin"),
      );
      if (adminRole) setSelectedRoleId(adminRole.id);
    } else if (preset === "clear") {
      setSelectedPermissions([]);
    } else if (preset === "operator") {
      setSelectedPermissions([
        "dashboard:view",
        "meals:view",
        "meals:verify",
        "meals:provide",
      ]);
      const operatorRole = superRoles?.find(
        (r) =>
          r.name.toLowerCase().includes("operator") ||
          r.name.toLowerCase().includes("meal"),
      );
      if (operatorRole) setSelectedRoleId(operatorRole.id);
    }
  };

  const isSuperAdminScope =
    selectedPermissions.includes("users:manage") ||
    selectedPermissions.includes("meals:manage");

  const computedRoleKey: CateringRoleKey = isSuperAdminScope
    ? "SUPER_ADMIN"
    : "MEAL_OPERATOR";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      setFormError("Please fill in all required fields marked with *.");
      return;
    }

    if (selectedPermissions.length === 0) {
      setFormError("Please select at least one module permission for this user.");
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setFormError("Please enter a valid email address.");
      return;
    }

    setFormError(null);
    try {
      await create.mutateAsync({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim() || undefined,
        roleId: selectedRoleId || computedRoleKey,
        permissions: selectedPermissions,
      });
      navigate(ROUTES.CATERING.USERS);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setFormError(err.message);
      } else {
        setFormError("An unexpected error occurred while creating user.");
      }
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-500">
        <Link to={ROUTES.CATERING.USERS} className="hover:text-slate-800 transition-colors">
          User Management
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
        <span className="font-semibold text-slate-800">Add User</span>
      </nav>

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-1 border-b border-slate-200 gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-[clamp(24px,2vw+16px,32px)] font-bold tracking-tight text-slate-900 leading-[1.25]">
              Add New User
            </h1>
            <span className="rounded-full bg-[#FAF4E6] border border-[#ECD59A] px-2.5 py-0.5 text-xs font-bold text-[#9B7415]">
              Secure Onboarding
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-600 leading-relaxed">
            Provision official catering credentials and configure module permissions directly.
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

      {formError && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800"
        >
          <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{formError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SECTION 01: Personal Information */}
        <FormSection
          sectionNumber="01"
          title="Personal Information"
          description="Personnel identity, communication details and avatar."
        >
          <div className="space-y-5">
            {/* Photo upload card */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Profile Photo (Optional)
              </label>
              <div className="flex items-center gap-4">
                <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 border border-slate-200 text-slate-400 overflow-hidden shrink-0">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="h-7 w-7 text-slate-400" />
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <label className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors shadow-2xs">
                      <span>Upload Photo</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png"
                        onChange={handlePhotoUpload}
                        className="sr-only"
                      />
                    </label>
                    {avatarPreview && (
                      <button
                        type="button"
                        onClick={() => setAvatarPreview(null)}
                        className="rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-500 hover:text-rose-600"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    JPG or PNG up to 2MB. Square 1:1 ratio recommended.
                  </p>
                </div>
              </div>
            </div>

            {/* Full Name & Email & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Ramesh Patel"
                  required
                  className="text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. ramesh.patel@example.com"
                  required
                  className="text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Contact Number (Optional)
                </label>
                <div className="flex gap-2">
                  <div className="flex items-center rounded-xl border border-slate-300 bg-slate-50 px-3 text-xs font-semibold text-slate-600 shrink-0">
                    +91
                  </div>
                  <Input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="98401 23456"
                    className="text-xs"
                  />
                </div>
              </div>
            </div>
          </div>
        </FormSection>

        {/* SECTION 02: Interactive Module Permissions */}
        <FormSection
          sectionNumber="02"
          title="Role & Module Permissions"
          description="Assign an operational role and configure granular access privileges across modules."
        >
          <div className="space-y-5">
            {/* Operational Role Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Assigned Operational Role <span className="text-rose-500">*</span>
              </label>
              <select
                value={
                  selectedRoleId ||
                  (superRoles?.find((r) =>
                    isSuperAdminScope
                      ? r.name.toLowerCase().includes("super") || r.name.toLowerCase().includes("admin")
                      : r.name.toLowerCase().includes("operator"),
                  )?.id ?? "")
                }
                onChange={(e) => {
                  const roleId = e.target.value;
                  setSelectedRoleId(roleId);
                  const roleObj = superRoles?.find((r) => r.id === roleId);
                  const roleName = (roleObj?.name || "").toLowerCase();
                  if (roleName.includes("super") || roleName.includes("admin")) {
                    handleApplyPreset("admin");
                  } else if (roleName.includes("operator")) {
                    handleApplyPreset("operator");
                  }
                }}
                className="w-full max-w-md rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#C9A227] cursor-pointer"
              >
                {superRoles && superRoles.length > 0 ? (
                  superRoles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name} {role.permissionsScope ? `— ${role.permissionsScope}` : ""}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="MEAL_OPERATOR">Meal Operator — Accreditation & Dispensation</option>
                    <option value="SUPER_ADMIN">Super Admin — Full Administrative Privileges</option>
                  </>
                )}
              </select>
              <p className="text-[11px] text-slate-500">
                Determines the operational privileges assigned to the user within the Super Admin portal.
              </p>
            </div>

            {/* Presets and Tier Summary Bar */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#FAF4E6] text-[#9B7415] border border-[#ECD59A]">
                  <ShieldCheck className="h-3.5 w-3.5" />
                </span>
                <div>
                  <span className="text-xs font-bold text-slate-800">
                    {isSuperAdminScope
                      ? "Full Administrative Privileges"
                      : selectedPermissions.includes("meals:provide")
                        ? "Meal Operator Privileges"
                        : "Custom Permissions Selected"}
                  </span>
                  <span className="text-[11px] text-slate-500 ml-2 font-medium">
                    ({selectedPermissions.length} of {MODULES_CONFIG.flatMap((m) => m.actions).length} permissions active)
                  </span>
                </div>
              </div>

              {/* Quick Presets */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleApplyPreset("operator")}
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer shadow-2xs"
                >
                  Meal Operator Preset
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset("admin")}
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer shadow-2xs"
                >
                  Super Admin Preset
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset("clear")}
                  className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
                >
                  Clear All
                </button>
              </div>
            </div>

            {/* Modules List */}
            <div className="space-y-4">
              {MODULES_CONFIG.map((module) => {
                const moduleActionKeys = module.actions.map((a) => a.key);
                const activeInModule = moduleActionKeys.filter((k) =>
                  selectedPermissions.includes(k),
                ).length;
                const isAllActive = activeInModule === moduleActionKeys.length;

                return (
                  <div
                    key={module.key}
                    className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs transition-all"
                  >
                    {/* Module Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-slate-100 bg-slate-50/40 gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                            {module.name}
                          </h4>
                          <span
                            className={cn(
                              "rounded-full px-2 py-0.5 text-[10px] font-bold",
                              activeInModule > 0
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-slate-100 text-slate-500 border border-slate-200",
                            )}
                          >
                            {activeInModule > 0
                              ? `${activeInModule} / ${moduleActionKeys.length} Granted`
                              : "No Access"}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {module.desc}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (isAllActive) {
                            setSelectedPermissions((prev) =>
                              prev.filter((k) => !moduleActionKeys.includes(k)),
                            );
                          } else {
                            setSelectedPermissions((prev) =>
                              Array.from(new Set([...prev, ...moduleActionKeys])),
                            );
                          }
                        }}
                        className="text-[11px] font-semibold text-[#9B7415] hover:text-[#7A5A0F] self-start sm:self-auto cursor-pointer select-none"
                      >
                        {isAllActive ? "Deselect Module" : "Select All in Module"}
                      </button>
                    </div>

                    {/* Permissions Grid */}
                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                      {module.actions.map((action) => {
                        const isChecked = selectedPermissions.includes(action.key);

                        return (
                          <div
                            key={action.key}
                            onClick={() => togglePermission(action.key)}
                            className={cn(
                              "flex items-start gap-3 rounded-xl border p-3 cursor-pointer select-none transition-all",
                              isChecked
                                ? "border-[#C9A227] bg-[#FAF4E6]/40 shadow-2xs"
                                : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50",
                            )}
                          >
                            <div className="pt-0.5">
                              <div
                                className={cn(
                                  "flex h-4.5 w-4.5 items-center justify-center rounded-md border transition-colors",
                                  isChecked
                                    ? "bg-[#C9A227] border-[#C9A227] text-white"
                                    : "border-slate-300 bg-white",
                                )}
                              >
                                {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                              </div>
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1.5 mb-0.5">
                                <span className="text-xs font-bold text-slate-800">
                                  {action.label}
                                </span>
                                <span
                                  className={cn(
                                    "rounded px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider",
                                    action.badge === "MANAGE"
                                      ? "bg-purple-50 text-purple-700 border border-purple-200"
                                      : action.badge === "PROVIDE"
                                        ? "bg-amber-50 text-amber-800 border border-amber-200"
                                        : action.badge === "VERIFY"
                                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                                          : "bg-slate-100 text-slate-600 border border-slate-200",
                                  )}
                                >
                                  {action.badge}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 leading-snug">
                                {action.desc}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </FormSection>

        {/* Full-width Info Box */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-xs text-slate-600 leading-relaxed flex items-start gap-3">
          <Lock className="h-4 w-4 text-[#C9A227] shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold text-slate-800 block mb-0.5">
              Direct User Creation Protocol:
            </strong>
            The administrative account will be provisioned directly in the system with the selected module permissions. The user will be immediately active and authorized for portal access.
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
          <Link
            to={ROUTES.CATERING.USERS}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-2"
          >
            Cancel & Exit
          </Link>

          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={create.isPending}
            className="rounded-xl bg-[#C9A227] hover:bg-[#B8901E] text-white shadow-xs font-semibold px-5"
            leftIcon={<UserPlus className="h-4 w-4" />}
          >
            Create User
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddUserPage;
