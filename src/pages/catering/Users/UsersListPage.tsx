import React, { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  UserCheck,
  UserPlus,
  RotateCcw,
  Download,
  Shield,
  Eye,
  Edit2,
  Ban,
  Send,
  Lock,
  AlertTriangle,
} from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Pagination } from "@/components/ui/Pagination";
import { UserDetailsDrawer } from "./UserDetailsDrawer";
import { DeactivateUserDialog } from "@/components/catering/DeactivateUserDialog";
import { useCateringUsers, useUserMutations } from "@/hooks/useCatering";
import { usePermissions } from "@/hooks/usePermissions";
import { AUTH_CONFIG } from "@/constants/catering";
import { ROUTES, buildCateringUserEditRoute } from "@/constants/routes";
import type { CateringUser } from "@/types/catering.types";
import { cn } from "@/utils/cn";

export const UsersListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { can } = usePermissions();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Deactivate dialog state
  const [deactivateUser, setDeactivateUser] = useState<CateringUser | null>(null);
  const [deactivateMode, setDeactivateMode] = useState<"deactivate" | "activate">("deactivate");
  const [isDeactivateOpen, setIsDeactivateOpen] = useState(false);

  // Active drawer user from URL query param ?user=<id>
  const activeDrawerUserId = searchParams.get("user");

  const { data, isLoading, error, refetch } = useCateringUsers({
    search,
    status: statusFilter,
  });

  const { setStatus, resend } = useUserMutations();

  const handleOpenDrawer = (userId: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("user", userId);
      return next;
    });
  };

  const handleCloseDrawer = () => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete("user");
      return next;
    });
  };

  const handleOpenDeactivate = (user: CateringUser, mode: "deactivate" | "activate" = "deactivate") => {
    setDeactivateUser(user);
    setDeactivateMode(mode);
    setIsDeactivateOpen(true);
  };

  const handleConfirmStatusChange = async (notes?: string) => {
    if (!deactivateUser) return;
    await setStatus.mutateAsync({
      userId: deactivateUser.id,
      status: deactivateMode === "deactivate" ? "inactive" : "active",
      notes,
    });
  };

  const handleResendInvite = async (user: CateringUser) => {
    await resend.mutateAsync(user.id);
  };

  const users = data?.users || [];
  const start = (page - 1) * pageSize;
  const pagedUsers = users.slice(start, start + pageSize);

  const activeSuperAdmins = users.filter(
    (u) => u.roleId === "SUPER_ADMIN" && u.status === "active",
  ).length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-1 border-b border-slate-200 gap-3">
        <div>
          <h1 className="text-[clamp(24px,2vw+16px,32px)] font-bold tracking-tight text-slate-900 leading-[1.25]">
            User Management
          </h1>
          <p className="mt-1 text-sm text-slate-600 leading-relaxed">
            Invite catering personnel, govern matchday roles, and manage module security policies.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <Button
            variant="outline"
            size="md"
            onClick={() => {
              // Export roster CSV directly
              const headers = ["User ID", "Full Name", "Email", "Status"];
              const rows = users.map((u) => [
                u.userCode,
                `"${u.fullName}"`,
                u.email,
                u.status,
              ]);
              const csv = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
              const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `catering_users_season_2026_${new Date().toISOString().slice(0, 10)}.csv`;
              a.click();
            }}
            className="rounded-xl text-xs"
            leftIcon={<Download className="h-4 w-4" />}
          >
            Export Roster
          </Button>

          {can("users", "create") && (
            <Link to={ROUTES.CATERING.USERS_NEW}>
              <Button
                variant="primary"
                size="md"
                className="rounded-xl bg-[#C9A227] hover:bg-[#B8901E] text-white shadow-xs font-semibold"
                leftIcon={<UserPlus className="h-4 w-4" />}
              >
                Add User
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Stat Cards (Total & Active Users) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard
          title="TOTAL USERS"
          value={data?.total ?? users.length}
          subtitle={`Total registered portal accounts across KSPL & ISCL (${data?.inactiveCount ?? 0} inactive)`}
          icon={<Shield className="h-5 w-5 text-slate-400" />}
          badgeText="All Accounts"
          badgeVariant="neutral"
        />

        <StatCard
          title="ACTIVE USERS"
          value={data?.activeCount ?? users.filter((u) => u.status === "active").length}
          subtitle="Currently authorized for matchday operations"
          icon={<UserCheck className="h-5 w-5 text-emerald-600" />}
          badgeText={`${(data?.total ?? users.length) > 0 ? Math.round(((data?.activeCount ?? users.filter((u) => u.status === "active").length) / (data?.total ?? users.length)) * 100) : 100}% Active`}
          badgeVariant="success"
        />
      </div>

      {/* Filters Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by name, email address or user code…"
              className="w-full text-xs"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-[#C9A227] cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="invitation_pending">Invitation Pending</option>
              <option value="invitation_expired">Invitation Expired</option>
              <option value="inactive">Inactive</option>
            </select>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
                setPage(1);
                refetch();
              }}
              title="Reset Filters"
              className="rounded-xl border border-slate-300 bg-white p-2 text-slate-500 hover:bg-slate-50 cursor-pointer"
              aria-label="Reset filters"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800"
        >
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-rose-900 text-sm">Failed to load user accounts</p>
              <p className="mt-0.5">
                {error instanceof Error ? error.message : "Error connecting to the backend API."}
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => refetch()}
            className="rounded-xl border-rose-300 text-rose-800 hover:bg-rose-100 shrink-0"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Users Table / Mobile Card List */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        {/* Desktop Table (>=768px) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3">User & Contact</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Account Status</th>
                <th className="px-4 py-3">Last Login</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    Loading personnel accounts…
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-rose-600">
                    Failed to load users: {error instanceof Error ? error.message : "Error connecting to server"}
                  </td>
                </tr>
              ) : pagedUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No matching users found.
                  </td>
                </tr>
              ) : (
                pagedUsers.map((u) => (
                  <tr
                    key={u.id}
                    onClick={() => handleOpenDrawer(u.id)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                  >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-white font-bold text-xs select-none shrink-0">
                            {u.fullName.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{u.fullName}</p>
                            <p className="text-[11px] text-slate-500 font-sans font-normal">
                              {u.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3 text-slate-600 font-mono text-[11px]">
                        {u.phone || "—"}
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold select-none",
                            u.status === "active"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : u.status === "invitation_pending"
                                ? "bg-amber-50 text-amber-800 border-amber-200"
                                : u.status === "invitation_expired"
                                  ? "bg-rose-50 text-rose-800 border-rose-200"
                                  : "bg-slate-100 text-slate-600 border-slate-200",
                          )}
                        >
                          <span
                            className={cn(
                              "h-1.5 w-1.5 rounded-full",
                              u.status === "active"
                                ? "bg-emerald-500"
                                : u.status === "invitation_pending"
                                  ? "bg-amber-500"
                                  : u.status === "invitation_expired"
                                    ? "bg-rose-500"
                                    : "bg-slate-400",
                            )}
                          />
                          <span className="capitalize">{u.status.replace("_", " ")}</span>
                        </span>
                      </td>

                      <td className="px-4 py-3 text-slate-600">
                        {u.lastLogin ? (
                          <div>
                            <span className="font-semibold text-slate-800 block text-xs">
                              Today, 12:45 PM
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {u.lastLogin.browser}
                            </span>
                          </div>
                        ) : (
                          <div>
                            <span className="text-slate-500 block text-xs">Never</span>
                            <span className="text-[10px] text-slate-400">
                              Invited {u.invitation?.sentAt?.slice(0, 10) || "Recently"}
                            </span>
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenDrawer(u.id)}
                            title="View dossier"
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          {can("users", "edit") && (
                            <Link
                              to={buildCateringUserEditRoute(u.id)}
                              title="Edit user"
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Link>
                          )}

                          {u.invitation.status !== "accepted" && (
                            <button
                              type="button"
                              onClick={() => handleResendInvite(u)}
                              title="Resend invitation link"
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-[#9B7415] transition-colors"
                            >
                              <Send className="h-4 w-4" />
                            </button>
                          )}

                          {can("users", "manage") && (
                            <button
                              type="button"
                              onClick={() =>
                                handleOpenDeactivate(
                                  u,
                                  u.status === "active" ? "deactivate" : "activate",
                                )
                              }
                              title={u.status === "active" ? "Deactivate account" : "Activate account"}
                              className={cn(
                                "rounded-lg p-1.5 transition-colors",
                                u.status === "active"
                                  ? "text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                                  : "text-slate-400 hover:bg-emerald-50 hover:text-emerald-600",
                              )}
                            >
                              <Ban className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards (<768px) */}
        <div className="md:hidden divide-y divide-slate-100">
          {isLoading ? (
            <div className="py-12 text-center text-xs text-slate-400">
              Loading personnel accounts…
            </div>
          ) : error ? (
            <div className="py-12 text-center text-xs text-rose-600">
              Failed to load personnel accounts.
            </div>
          ) : pagedUsers.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No matching users found.
            </div>
          ) : (
            pagedUsers.map((u) => (
              <div
                key={u.id}
                onClick={() => handleOpenDrawer(u.id)}
                className="p-4 space-y-3 cursor-pointer hover:bg-slate-50/60 transition-colors"
              >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white font-bold text-xs select-none shrink-0 shadow-2xs">
                        {u.fullName.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-900 text-sm truncate">
                          {u.fullName}
                        </h4>
                        <p className="text-xs text-slate-500 truncate">{u.email}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold",
                        u.status === "active"
                          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                          : u.status === "invitation_pending"
                            ? "border-amber-200 bg-amber-50 text-amber-800"
                            : u.status === "invitation_expired"
                              ? "border-rose-200 bg-rose-50 text-rose-800"
                              : "border-slate-200 bg-slate-100 text-slate-600",
                      )}
                    >
                      <span
                        className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          u.status === "active"
                            ? "bg-emerald-500"
                            : u.status === "invitation_pending"
                              ? "bg-amber-500"
                              : u.status === "invitation_expired"
                                ? "bg-rose-500"
                                : "bg-slate-400",
                        )}
                      />
                      <span className="capitalize">{u.status.replace("_", " ")}</span>
                    </span>

                    <span className="font-mono text-[11px] text-slate-400">
                      {u.userCode}
                    </span>
                  </div>

                  <div
                    className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => handleOpenDrawer(u.id)}
                      title="View dossier"
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <Eye className="h-3.5 w-3.5 text-slate-400" />
                      <span>Details</span>
                    </button>

                    {can("users", "edit") && (
                      <Link
                        to={buildCateringUserEditRoute(u.id)}
                        title="Edit user"
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-[#9B7415] hover:bg-slate-50"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                        <span>Edit</span>
                      </Link>
                    )}

                    {can("users", "manage") && (
                      <button
                        type="button"
                        onClick={() =>
                          handleOpenDeactivate(
                            u,
                            u.status === "active" ? "deactivate" : "activate",
                          )
                        }
                        title={u.status === "active" ? "Deactivate" : "Activate"}
                        className={cn(
                          "inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-semibold",
                          u.status === "active"
                            ? "border-rose-200 bg-rose-50/50 text-rose-700 hover:bg-rose-100/50"
                            : "border-emerald-200 bg-emerald-50/50 text-emerald-700 hover:bg-emerald-100/50",
                        )}
                      >
                        <Ban className="h-3.5 w-3.5" />
                        <span>{u.status === "active" ? "Deactivate" : "Activate"}</span>
                      </button>
                    )}
                  </div>
                </div>
              ))
          )}
        </div>

        {/* Footer Note with Governance Config */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <Lock className="h-3 w-3 text-slate-400" />
            <span>Access Control Protocol & Multi-Entity Governance:</span>
            <span>Invitation TTL: <strong>{AUTH_CONFIG.INVITE_TTL_HOURS} hours</strong></span>
            <span>•</span>
            <span>Session Idle Timeout: <strong>{AUTH_CONFIG.SESSION_IDLE_TIMEOUT_HOURS} hours</strong></span>
          </div>
          <span>Showing {pagedUsers.length} of {users.length} portal accounts</span>
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={page}
          totalPages={Math.ceil(users.length / pageSize) || 1}
          totalItems={users.length}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setPage(1);
          }}
          pageSizeOptions={[10, 25, 50]}
        />
      </div>

      {/* User Details Drawer */}
      <UserDetailsDrawer
        userId={activeDrawerUserId}
        isOpen={!!activeDrawerUserId}
        onClose={handleCloseDrawer}
        onOpenDeactivate={(id) => {
          const target = users.find((u) => u.id === id);
          if (target) handleOpenDeactivate(target, target.status === "active" ? "deactivate" : "activate");
        }}
      />

      {/* Deactivate User Dialog */}
      <DeactivateUserDialog
        isOpen={isDeactivateOpen}
        mode={deactivateMode}
        user={deactivateUser}
        totalActiveSuperAdmins={activeSuperAdmins}
        onClose={() => setIsDeactivateOpen(false)}
        onConfirm={handleConfirmStatusChange}
      />
    </div>
  );
};

export default UsersListPage;
