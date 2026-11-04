import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/constants/routes";
import { FileQuestion, Home } from "lucide-react";

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-600">
        <FileQuestion className="h-8 w-8" aria-hidden="true" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">
        404 - Page Not Found
      </h1>
      <p className="mt-2 max-w-md text-sm text-slate-600">
        The requested page does not exist or has been moved.
      </p>
      <div className="mt-6 flex gap-3">
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

export default NotFoundPage;
