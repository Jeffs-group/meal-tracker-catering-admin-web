import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Shield,
  X,
  LogOut,
  BarChart3,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { ROUTES } from "@/constants/routes";
import { useAuthStore } from "@/stores/authStore";

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { user, logout } = useAuthStore();

  interface NavItem {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    to: string;
  }

  const navItems: NavItem[] = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      to: ROUTES.DASHBOARD,
    },
    {
      label: "Registrations",
      icon: Users,
      to: ROUTES.REGISTRATIONS,
    },
    {
      label: "Manage Teams",
      icon: Shield,
      to: ROUTES.MANAGE_TEAMS,
    },
    {
      label: "Reports",
      icon: BarChart3,
      to: ROUTES.REPORTS,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-[#111111] text-slate-300 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-[#222222] px-5">
          <div className="flex items-center gap-3">
            <img
              src="/jeffs-group-emblem.png"
              alt="Jeffs Group Emblem"
              className="h-9 w-9 object-contain shrink-0"
            />
            <div>
              <h2 className="text-sm font-bold tracking-tight text-white leading-tight">
                JEFFS GROUP
              </h2>
              <p className="text-[9px] uppercase tracking-wider text-[#DEC067] font-semibold">
                OF COMPANIES
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:text-white lg:hidden cursor-pointer"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 space-y-1.5 px-3 py-5 overflow-y-auto">
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Registrations Module
          </p>
          {navItems.map((item) => {
            const isActive =
              location.pathname === item.to ||
              (item.to === ROUTES.MANAGE_TEAMS &&
                location.pathname.startsWith("/manage-teams")) ||
              (item.to === ROUTES.REGISTRATIONS &&
                location.pathname.startsWith("/registrations")) ||
              (item.to === ROUTES.REPORTS &&
                location.pathname.startsWith("/reports"));

            return (
              <NavLink
                key={item.label}
                to={item.to}
                onClick={onClose}
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

        {/* Bottom User Info & Logout */}
        <div className="border-t border-[#222222] p-4 bg-[#0D0D0D]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#222222] text-[#DEC067] font-bold text-xs shrink-0">
                OA
              </div>
              <div className="overflow-hidden text-left">
                <p className="truncate text-xs font-semibold text-slate-200">
                  {user?.firstName
                    ? `${user.firstName} ${user.lastName}`
                    : "Organization Admin"}
                </p>
                <p className="truncate text-[10px] font-mono text-slate-500">
                  {user?.email || "admin@iscl.org"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => logout()}
              title="Sign Out"
              className="rounded-lg p-1.5 text-slate-400 hover:bg-[#222222] hover:text-rose-400 transition-colors cursor-pointer"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
