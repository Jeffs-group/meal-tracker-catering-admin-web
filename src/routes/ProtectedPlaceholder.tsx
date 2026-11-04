import React from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Shield, User, Building } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/stores/authStore";
import { ROUTES } from "@/constants/routes";

/**
 * Protected route foundation placeholder.
 * Architectural anchor point for authenticated organization admin screens.
 */
export const ProtectedPlaceholder: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-6 text-center">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
          <Shield className="h-6 w-6" aria-hidden="true" />
        </div>

        <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-800">
          <Building className="h-3.5 w-3.5" />
          <span>Catering Organization Admin</span>
        </div>

        <h2 className="text-xl font-bold tracking-tight text-slate-900 mt-2">
          Protected Route Foundation
        </h2>
        <p className="mt-1 text-xs font-mono text-slate-400">
          Route: {ROUTES.ROOT}
        </p>

        <p className="mt-3 text-sm text-slate-600">
          You have successfully accessed the authenticated root shell. Ready for
          feature modules (Menus, Orders, Kitchen Management, etc.).
        </p>

        {/* Live Session State Details */}
        <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50 p-4 text-left text-xs">
          <div className="font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 text-primary-600" />
            <span>Active Session State (Zustand Auth Store)</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-slate-600">
            <div>
              <span className="text-slate-400">Status:</span>{" "}
              <span className="font-medium text-emerald-600">
                {isAuthenticated ? "Authenticated" : "Unauthenticated"}
              </span>
            </div>
            <div>
              <span className="text-slate-400">Role:</span>{" "}
              <span className="font-mono font-medium">
                {user?.role || "N/A"}
              </span>
            </div>
            <div className="col-span-2">
              <span className="text-slate-400">User:</span>{" "}
              <span className="font-mono">{user?.email || "N/A"}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 border-t border-slate-100 pt-6">
          <Button
            variant="outline"
            className="w-full"
            onClick={handleLogout}
            leftIcon={<LogOut className="h-4 w-4" />}
          >
            Sign Out (Test Protected Redirect)
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProtectedPlaceholder;
