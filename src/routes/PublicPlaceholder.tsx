import React from "react";
import { useNavigate } from "react-router-dom";
import { LogIn, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/stores/authStore";
import { ROUTES } from "@/constants/routes";

/**
 * Public route foundation placeholder.
 * Architectural anchor point for organization authentication screens.
 */
export const PublicPlaceholder: React.FC = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSimulateLogin = () => {
    setAuth(
      {
        id: "org-admin-demo",
        email: "admin@organization.com",
        firstName: "Org",
        lastName: "Admin",
        organizationId: "org-001",
        role: "ORG_ADMIN",
        permissions: ["ORG_ADMIN"],
      },
      {
        accessToken: "demo-org-token",
        refreshToken: "demo-org-refresh-token",
      },
    );
    navigate(ROUTES.ROOT);
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-6 text-center">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
          <LogIn className="h-6 w-6" aria-hidden="true" />
        </div>

        <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-800">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Catering Organization Admin</span>
        </div>

        <h2 className="text-xl font-bold tracking-tight text-slate-900 mt-2">
          Public Route Foundation
        </h2>
        <p className="mt-1 text-xs font-mono text-slate-400">
          Route: {ROUTES.LOGIN}
        </p>

        <p className="mt-3 text-sm text-slate-600">
          Organization Admin authentication shell. Unauthenticated users are
          automatically redirected here by the{" "}
          <code className="rounded bg-slate-100 px-1 py-0.5 text-xs text-slate-800">
            ProtectedRoute
          </code>{" "}
          guard.
        </p>

        <div className="mt-6 border-t border-slate-100 pt-6">
          <p className="mb-3 text-xs text-slate-500">
            Click below to simulate authentication and test the protected route:
          </p>
          <Button
            variant="primary"
            className="w-full"
            onClick={handleSimulateLogin}
            leftIcon={<LogIn className="h-4 w-4" />}
          >
            Simulate Sign In (Enter App)
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PublicPlaceholder;
