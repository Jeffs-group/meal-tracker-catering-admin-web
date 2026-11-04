import React, { useState } from "react";
import { Outlet, NavLink, useLocation, useNavigate, Navigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  LayoutDashboard,
  UtensilsCrossed,
  UserCheck,
  BarChart3,
  X,
  LogOut,
  Calendar,
  Bell,
  Menu,
  Store,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { ROUTES } from "@/constants/routes";
import { useAuthStore } from "@/stores/authStore";
import { usePermissions } from "@/hooks/usePermissions";
import {
  CATERING_ROLES,
  COUNTERS,
  SEASON_LABEL,
  LEAGUE_SCOPE,
  getTodayHeaderFormatted,
} from "@/constants/catering";
import { SyncStatusChip } from "./SyncStatusChip";
import { ChangeCounterDialog } from "./ChangeCounterDialog";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { getManageMealsDashboard } from "@/api/manageMeals.api";
import { logout as logoutApi } from "@/api/auth.api";
import { isEventAdminUser } from "@/utils/authGuards";

export const CateringLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [changeCounterOpen, setChangeCounterOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const { user, setUser, logout, isAuthenticated } = useAuthStore();
  const { can } = usePermissions();
  const queryClient = useQueryClient();

  // Route security: require authentication and strictly bar Event Admin accounts
  if (!isAuthenticated || !user) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (isEventAdminUser(user)) {
    logout();
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logoutApi().catch(() => {});
    } finally {
      logout();
      queryClient.clear();
      setIsLoggingOut(false);
      setLogoutConfirmOpen(false);
      navigate(ROUTES.LOGIN);
    }
  };

  const handleNavClick = (label: string) => {
    setSidebarOpen(false);
    if (label === "Dashboard") {
      queryClient.invalidateQueries({ queryKey: ["catering", "dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["catering", "meals-overview"] });
    } else if (label === "Manage Meals") {
      getManageMealsDashboard().catch(() => {});
      queryClient.invalidateQueries({ queryKey: ["catering", "meals-overview"] });
      queryClient.invalidateQueries({ queryKey: ["super", "manage-meals"] });
      queryClient.refetchQueries({ queryKey: ["catering", "meals-overview"] });
    } else if (label === "User Management") {
      queryClient.invalidateQueries({ queryKey: ["catering", "users"] });
      queryClient.invalidateQueries({ queryKey: ["super-users"] });
    } else if (label === "Reports") {
      queryClient.invalidateQueries({ queryKey: ["catering", "reports"] });
      queryClient.invalidateQueries({ queryKey: ["catering", "ledger"] });
      queryClient.invalidateQueries({ queryKey: ["catering", "report"] });
      queryClient.invalidateQueries({ queryKey: ["catering", "velocity"] });
    }
  };

  // Active counter in session (default counter-01)
  const currentCounterId = user?.currentCounterId || "counter-01";
  const currentCounter =
    COUNTERS.find((c) => c.id === currentCounterId) ?? COUNTERS[0]!;

  // Derived user details
  const userFullName = user?.firstName
    ? `${user.firstName} ${user.lastName}`
    : "Alex Morgan";
  const currentRoleKey = (user?.role || "SUPER_ADMIN") as keyof typeof CATERING_ROLES;
  const roleDef = CATERING_ROLES[currentRoleKey] ?? CATERING_ROLES.SUPER_ADMIN!;
  const roleLabel = roleDef.label;

  // Determine current topbar section breadcrumb
  const getSectionTitle = () => {
    const p = location.pathname;
    if (p.includes("/meals")) return "Manage Meals";
    if (p.includes("/users")) return "User Management";
    if (p.includes("/reports")) return "Reports";
    return "Dashboard";
  };

  const navItems = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      to: ROUTES.DASHBOARD,
      show: can("dashboard", "view"),
      isMatch: (p: string) =>
        p === "/" || p.startsWith("/dashboard") || p.startsWith("/catering/dashboard"),
    },
    {
      label: "Manage Meals",
      icon: UtensilsCrossed,
      to: ROUTES.MEALS,
      show: can("meals", "view"),
      isMatch: (p: string) =>
        p.startsWith("/meals") || p.startsWith("/catering/meals"),
    },
    {
      label: "User Management",
      icon: UserCheck,
      to: ROUTES.USERS,
      show: can("users", "view"),
      isMatch: (p: string) =>
        p.startsWith("/users") || p.startsWith("/catering/users"),
    },
    {
      label: "Reports",
      icon: BarChart3,
      to: ROUTES.REPORTS,
      show: can("reports", "view"),
      isMatch: (p: string) =>
        p.startsWith("/reports") || p.startsWith("/catering/reports"),
    },
  ];


  const handleSelectCounter = (counterId: string) => {
    if (user) {
      setUser({
        ...user,
        currentCounterId: counterId,
      });
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#F8F9FA] text-slate-900 overflow-hidden font-sans">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-[#111111] text-slate-300 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 shrink-0 select-none",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-[#222222] px-4">
          <div className="flex items-center gap-2.5">
            <img
              src="/jeffs-group-logo.png"
              alt="Jeffs Group of Companies"
              className="h-11 w-auto max-h-12 object-contain rounded-lg"
            />
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1 text-slate-400 hover:text-white lg:hidden cursor-pointer"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 space-y-1.5 px-3 py-5 overflow-y-auto">
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            NAVIGATION
          </p>
          {navItems
            .filter((item) => item.show)
            .map((item) => {
              const isActive = item.isMatch(location.pathname);

              return (
                <NavLink
                  key={item.label}
                  to={item.to}
                  onClick={() => handleNavClick(item.label)}
                  className={cn(
                    "group flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-medium transition-all",
                    isActive
                      ? "bg-[#C9A227] text-white font-semibold shadow-xs"
                      : "text-slate-400 hover:bg-[#1C1C1C] hover:text-slate-200",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon
                      className={cn(
                        "h-4 w-4 shrink-0 transition-colors",
                        isActive
                          ? "text-white"
                          : "text-slate-400 group-hover:text-slate-200",
                      )}
                    />
                    <span>{item.label}</span>
                  </div>
                </NavLink>
              );
            })}
        </nav>

        {/* User Card in Footer with Logout */}
        <div className="border-t border-[#222222] p-4 bg-[#0D0D0D]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#222222] text-[#DEC067] font-bold text-xs shrink-0 select-none">
                AM
              </div>
              <div className="overflow-hidden text-left">
                <p className="truncate text-xs font-semibold text-slate-200">
                  {userFullName}
                </p>
                <p className="truncate text-[10px] text-[#DEC067] font-medium">
                  {roleLabel}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setLogoutConfirmOpen(true)}
              title="Sign Out"
              className="rounded-lg p-1.5 text-slate-400 hover:bg-[#222222] hover:text-rose-400 transition-colors cursor-pointer"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-3 sm:px-6 backdrop-blur-xs select-none">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 lg:hidden cursor-pointer shrink-0"
              aria-label="Toggle navigation menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Operating Date Chip (Visible on Mobile and Desktop) */}
            <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2 sm:px-2.5 py-1 text-xs font-medium text-slate-600 shrink-0">
              <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span>
                <span className="hidden xs:inline sm:inline">Today, </span>
                {getTodayHeaderFormatted()}
              </span>
            </div>

            {/* Breadcrumb KSPL / ISCL / Section (Desktop) */}
            <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <span>{LEAGUE_SCOPE}</span>
              <span>/</span>
              <span className="font-semibold text-slate-800">
                {getSectionTitle()}
              </span>
            </div>

            {/* Season Badge (Tablet/Desktop) */}
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/80 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 shadow-2xs shrink-0">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>{SEASON_LABEL}</span>
            </div>
          </div>

          {/* Right Area: Sync Status, Bell, User Menu */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <SyncStatusChip />

            <button
              type="button"
              className="relative rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#C9A227]" />
            </button>

            {/* User Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserMenuOpen((prev) => !prev)}
                className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 hover:bg-slate-100 transition-all cursor-pointer text-left"
                aria-haspopup="true"
                aria-expanded={userMenuOpen}
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FAF4E6] text-[#9B7415] font-bold text-xs shrink-0 border border-[#ECD59A]">
                  AM
                </div>
                <div className="hidden sm:block">
                  <p className="text-xs font-bold text-slate-900 leading-tight">
                    {userFullName}
                  </p>
                  <p className="text-[10px] text-slate-500">{roleLabel}</p>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 z-50 mt-1.5 w-60 rounded-xl border border-slate-200 bg-white p-2 shadow-xl animate-in fade-in zoom-in-95">
                  <div className="px-3 py-2 border-b border-slate-100 mb-1">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {userFullName}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">
                      {user?.email || "alex.morgan@jeffscatering.com"}
                    </p>
                    <p className="text-[10px] font-semibold text-[#9B7415] mt-0.5">
                      {roleLabel} ({roleDef.tier.toUpperCase()})
                    </p>
                  </div>

                  {/* Counter station switcher */}
                  <button
                    type="button"
                    onClick={() => {
                      setUserMenuOpen(false);
                      setChangeCounterOpen(true);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer text-left"
                  >
                    <Store className="h-4 w-4 text-[#C9A227]" />
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 truncate">
                        Station: {currentCounter.name}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {currentCounter.terminal} • {currentCounter.gate}
                      </p>
                    </div>
                  </button>


                  <div className="pt-2 mt-1 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        setLogoutConfirmOpen(true);
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-8 sm:py-8 bg-[#F8F9FB]">
          <div className="mx-auto max-w-7xl">
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </div>
        </main>
      </div>

      {/* Change Counter Dialog */}
      <ChangeCounterDialog
        isOpen={changeCounterOpen}
        onClose={() => setChangeCounterOpen(false)}
        currentCounterId={currentCounterId}
        onSelectCounter={handleSelectCounter}
      />

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={logoutConfirmOpen}
        onClose={() => {
          if (!isLoggingOut) setLogoutConfirmOpen(false);
        }}
        title="Sign Out of Session"
        subtitle="Jeff's Catering Super Admin Portal"
        maxWidth="md"
      >
        <div className="p-5 space-y-4">
          <div className="flex items-start gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 shrink-0">
              <LogOut className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-900">
                Are you sure you want to sign out?
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                You will be signed out of your active matchday terminal session. To resume dispensing meals or administering tournament operations, you will need to sign in again.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#111111] text-[#DEC067] font-bold text-[11px]">
                {userFullName.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-slate-900 leading-tight">{userFullName}</p>
                <p className="text-[11px] text-slate-500">{user?.email || "superadmin@jeffscatering.com"}</p>
              </div>
            </div>
            <span className="rounded-md bg-amber-50 border border-amber-200/60 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
              {roleLabel}
            </span>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="md"
              disabled={isLoggingOut}
              onClick={() => setLogoutConfirmOpen(false)}
              className="rounded-xl text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="md"
              disabled={isLoggingOut}
              onClick={handleConfirmLogout}
              className="rounded-xl text-xs bg-rose-600 hover:bg-rose-700 text-white font-semibold"
              leftIcon={
                isLoggingOut ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <LogOut className="h-3.5 w-3.5" />
                )
              }
            >
              {isLoggingOut ? "Signing Out…" : "Yes, Sign Out"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CateringLayout;
