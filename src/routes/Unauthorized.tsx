import React from "react";
import { useNavigate } from "react-router-dom";
import { ShieldAlert, Home } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/constants/routes";

export const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-600">
        <ShieldAlert className="h-8 w-8" aria-hidden="true" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">
        403 - Unauthorized
      </h1>
      <p className="mt-2 max-w-md text-sm text-slate-600">
        You do not have the required permissions to access this resource.
      </p>
      <div className="mt-6">
        <Button
          variant="primary"
          onClick={() => navigate(ROUTES.ROOT)}
          leftIcon={<Home className="h-4 w-4" />}
        >
          Return to Home
        </Button>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
