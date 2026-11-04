import { lazy, Suspense } from "react";
import {
  createBrowserRouter,
  Navigate,
  type RouteObject,
} from "react-router-dom";
import { CateringLayout } from "@/components/catering/CateringLayout";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";
import { RequirePermission } from "@/components/common/RequirePermission";
import { ROUTES } from "@/constants/routes";

const NotFoundPage = lazy(() => import("@/routes/NotFound"));
const LoginPage = lazy(() => import("@/pages/Auth/LoginPage"));

// Jeff's Catering – Super Admin Pages
const CateringDashboardPage = lazy(
  () => import("@/pages/catering/Dashboard/CateringDashboardPage"),
);
const MealsLandingPage = lazy(
  () => import("@/pages/catering/Meals/MealsLandingPage"),
);
const TeamRegistrantsPage = lazy(
  () => import("@/pages/catering/Meals/TeamRegistrantsPage"),
);
const StaffRegistrantsPage = lazy(
  () => import("@/pages/catering/Meals/StaffRegistrantsPage"),
);
const MealDistributionPage = lazy(
  () => import("@/pages/catering/Meals/MealDistributionPage"),
);
const MealConfigPage = lazy(
  () => import("@/pages/catering/Meals/MealConfigPage"),
);
const UsersListPage = lazy(
  () => import("@/pages/catering/Users/UsersListPage"),
);
const AddUserPage = lazy(
  () => import("@/pages/catering/Users/AddUserPage"),
);
const EditUserPage = lazy(
  () => import("@/pages/catering/Users/EditUserPage"),
);
const CateringReportsOverviewPage = lazy(
  () => import("@/pages/catering/Reports/CateringReportsOverviewPage"),
);

export const routes: RouteObject[] = [
  // Super Admin Portal Shell (Mounted directly at root / with Super Admin Sidebar)
  {
    path: ROUTES.ROOT,
    element: <CateringLayout />,
    children: [
      {
        index: true,
        element: <Navigate to={ROUTES.DASHBOARD} replace />,
      },
      {
        path: "dashboard",
        element: (
          <RequirePermission module="dashboard" action="view">
            <Suspense fallback={<LoadingIndicator fullScreen label="Loading Dashboard..." />}>
              <CateringDashboardPage />
            </Suspense>
          </RequirePermission>
        ),
      },
      {
        path: "meals",
        element: (
          <RequirePermission module="meals" action="view">
            <Suspense fallback={<LoadingIndicator fullScreen label="Loading Meal Operations..." />}>
              <MealsLandingPage />
            </Suspense>
          </RequirePermission>
        ),
      },
      {
        path: "meals/teams/:teamId",
        element: (
          <RequirePermission module="meals" action="view">
            <Suspense fallback={<LoadingIndicator fullScreen label="Loading Team Registrants..." />}>
              <TeamRegistrantsPage />
            </Suspense>
          </RequirePermission>
        ),
      },
      {
        path: "meals/staff",
        element: (
          <RequirePermission module="meals" action="view">
            <Suspense fallback={<LoadingIndicator fullScreen label="Loading Staff Registrants..." />}>
              <StaffRegistrantsPage />
            </Suspense>
          </RequirePermission>
        ),
      },
      {
        path: "meals/registrants/:registrantId",
        element: (
          <RequirePermission module="meals" action="verify">
            <Suspense fallback={<LoadingIndicator fullScreen label="Loading Meal Distribution..." />}>
              <MealDistributionPage />
            </Suspense>
          </RequirePermission>
        ),
      },
      {
        path: "meals/config",
        element: (
          <RequirePermission module="meals" action="manage">
            <Suspense fallback={<LoadingIndicator fullScreen label="Loading Meal Configuration..." />}>
              <MealConfigPage />
            </Suspense>
          </RequirePermission>
        ),
      },
      {
        path: "users",
        element: (
          <RequirePermission module="users" action="view">
            <Suspense fallback={<LoadingIndicator fullScreen label="Loading User Management..." />}>
              <UsersListPage />
            </Suspense>
          </RequirePermission>
        ),
      },
      {
        path: "users/new",
        element: (
          <RequirePermission module="users" action="create">
            <Suspense fallback={<LoadingIndicator fullScreen label="Loading New User Form..." />}>
              <AddUserPage />
            </Suspense>
          </RequirePermission>
        ),
      },
      {
        path: "users/:userId/edit",
        element: (
          <RequirePermission module="users" action="edit">
            <Suspense fallback={<LoadingIndicator fullScreen label="Loading Edit User Form..." />}>
              <EditUserPage />
            </Suspense>
          </RequirePermission>
        ),
      },
      {
        path: "reports",
        element: (
          <RequirePermission module="reports" action="view">
            <Suspense fallback={<LoadingIndicator fullScreen label="Loading Reports Overview..." />}>
              <CateringReportsOverviewPage />
            </Suspense>
          </RequirePermission>
        ),
      },
      {
        path: "reports/distribution-activity",
        element: <Navigate to={ROUTES.REPORTS} replace />,
      },
      {
        path: "reports/meal-period",
        element: <Navigate to={ROUTES.REPORTS} replace />,
      },
      {
        path: "reports/team-wise",
        element: <Navigate to={ROUTES.REPORTS} replace />,
      },
      {
        path: "reports/staff",
        element: <Navigate to={ROUTES.REPORTS} replace />,
      },
      // Backwards-compatibility redirects for /catering/*
      {
        path: "catering",
        element: <Navigate to={ROUTES.DASHBOARD} replace />,
      },
      {
        path: "catering/dashboard",
        element: <Navigate to={ROUTES.DASHBOARD} replace />,
      },
      {
        path: "catering/meals",
        element: <Navigate to={ROUTES.MEALS} replace />,
      },
      {
        path: "catering/meals/teams/:teamId",
        element: (
          <RequirePermission module="meals" action="view">
            <Suspense fallback={<LoadingIndicator fullScreen />}>
              <TeamRegistrantsPage />
            </Suspense>
          </RequirePermission>
        ),
      },
      {
        path: "catering/meals/staff",
        element: <Navigate to={ROUTES.MEALS_STAFF} replace />,
      },
      {
        path: "catering/meals/registrants/:registrantId",
        element: (
          <RequirePermission module="meals" action="verify">
            <Suspense fallback={<LoadingIndicator fullScreen />}>
              <MealDistributionPage />
            </Suspense>
          </RequirePermission>
        ),
      },
      {
        path: "catering/meals/config",
        element: <Navigate to={ROUTES.MEALS_CONFIG} replace />,
      },
      {
        path: "catering/users",
        element: <Navigate to={ROUTES.USERS} replace />,
      },
      {
        path: "catering/users/new",
        element: <Navigate to={ROUTES.USERS_NEW} replace />,
      },
      {
        path: "catering/reports",
        element: <Navigate to={ROUTES.REPORTS} replace />,
      },
      {
        path: "catering/reports/distribution-activity",
        element: <Navigate to={ROUTES.REPORTS_ACTIVITY} replace />,
      },
      {
        path: "catering/reports/meal-period",
        element: <Navigate to={ROUTES.REPORTS_MEAL_PERIOD} replace />,
      },
      {
        path: "catering/reports/team-wise",
        element: <Navigate to={ROUTES.REPORTS_TEAM_WISE} replace />,
      },
      {
        path: "catering/reports/staff",
        element: <Navigate to={ROUTES.REPORTS_STAFF} replace />,
      },
    ],
  },
  {
    path: ROUTES.LOGIN,
    element: (
      <Suspense fallback={<LoadingIndicator fullScreen label="Loading Portal..." />}>
        <LoginPage />
      </Suspense>
    ),
  },
  {
    path: ROUTES.UNAUTHORIZED,
    element: (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 max-w-md shadow-xs">
          <h2 className="text-lg font-bold text-rose-900">Access Denied (403)</h2>
          <p className="mt-2 text-xs text-rose-700">
            Your catering role does not have permission to view this resource.
          </p>
        </div>
      </div>
    ),
  },
  {
    path: ROUTES.NOT_FOUND,
    element: (
      <Suspense fallback={<LoadingIndicator fullScreen />}>
        <NotFoundPage />
      </Suspense>
    ),
  },
];

export const router = createBrowserRouter(routes);
export default router;
