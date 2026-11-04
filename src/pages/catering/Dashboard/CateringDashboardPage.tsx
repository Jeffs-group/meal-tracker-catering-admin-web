import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Shield,
  Users,
  UtensilsCrossed,
  ArrowRight,
  Clock,
  Calendar,
} from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { PeriodCard } from "@/components/catering/PeriodCard";
import { TeamTile } from "@/components/reports/TeamTile";
import { useCateringDashboard } from "@/hooks/useCatering";
import { useAuthStore } from "@/stores/authStore";
import { ROUTES } from "@/constants/routes";
import { formatTimestampIST } from "@/utils/cateringClock";

export const CateringDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const firstName = user?.firstName || "Alex";

  const { data: dashboard, isLoading } = useCateringDashboard("2026-11-03");

  if (isLoading || !dashboard) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center text-xs text-slate-500">
          Loading operational dashboard…
        </div>
      </div>
    );
  }

  // Day-level metrics
  const overallRate = dashboard.eligibleRegistrantsCount
    ? Math.round(
        (dashboard.mealsProvidedTodayCount / dashboard.eligibleRegistrantsCount) *
          100,
      )
    : 0;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-1 border-b border-slate-200 gap-3">
        <div>
          <h1 className="text-[clamp(24px,2vw+16px,32px)] font-bold tracking-tight text-slate-900 leading-[1.25]">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-600 leading-relaxed">
            Welcome back, {firstName}! Here is your operational overview for today.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs">
            <Calendar className="h-3.5 w-3.5 text-[#C9A227]" />
            <span>Today, 03 Nov 2026</span>
          </div>
        </div>
      </div>

      {/* 3 Top Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="ACTIVE TEAMS"
          value={dashboard.activeTeamsCount}
          subtitle="Matchday activations for operating date"
          icon={<Shield className="h-5 w-5 text-slate-400" />}
          badgeText="Matchday Live"
          badgeVariant="success"
        />

        <StatCard
          title="ELIGIBLE REGISTRANTS"
          value={dashboard.eligibleRegistrantsCount}
          subtitle="125 Team members + 6 Operational staff"
          icon={<Users className="h-5 w-5 text-slate-400" />}
          badgeText="Verified Today"
          badgeVariant="neutral"
        />

        <StatCard
          title="MEALS PROVIDED TODAY"
          value={dashboard.mealsProvidedTodayCount}
          subtitle="Total meals dispensed across 3 sessions"
          icon={<UtensilsCrossed className="h-5 w-5 text-[#C9A227]" />}
          progress={{
            value: Math.min(100, overallRate),
            color: "gold",
          }}
          badgeText={`${overallRate}% Fulfilment`}
          badgeVariant="warning"
        />
      </div>

      {/* Today's Meal Operations (3 Period Cards) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
              Today's Meal Operations
            </h2>
            <span className="rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 text-[11px] font-bold text-slate-700">
              {dashboard.periods.length} Configured Periods
            </span>
          </div>

          <Link
            to={ROUTES.CATERING.MEALS_CONFIG}
            className="text-xs font-bold text-[#9B7415] hover:text-[#7D5C13] transition-colors"
          >
            Configure Windows →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {dashboard.periods.map((period) => (
            <PeriodCard
              key={period.key}
              period={{
                key: period.key,
                label: period.label,
                subtitle: period.subtitle,
                enabled: period.enabled,
                start: period.start,
                end: period.end,
                plannedVeg: 0,
                plannedNonVeg: 0,
              }}
              state={period.state}
              mealsProvided={period.mealsProvided}
              onClick={() => navigate(ROUTES.CATERING.MEALS)}
            />
          ))}
        </div>
      </div>

      {/* Grid: Team-wise Distribution & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Team-wise Meal Distribution */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Team-wise Meal Distribution
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Portion fulfilment by activated tournament rosters.
              </p>
            </div>
            <Link
              to={ROUTES.CATERING.REPORTS_TEAM_WISE}
              className="text-xs font-semibold text-[#9B7415] hover:underline"
            >
              Full Report →
            </Link>
          </div>

          <div className="space-y-4">
            {dashboard.teamDistributionRows.map((row) => (
              <div
                key={row.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl border border-slate-100 hover:bg-slate-50/60 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-[200px]">
                  {row.isStaffRow ? (
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white font-bold text-xs select-none">
                      ST
                    </div>
                  ) : (
                    <TeamTile
                      name={row.name}
                      code={row.letterCode}
                      size="sm"
                    />
                  )}

                  <div>
                    <h4 className="text-xs font-bold text-slate-900 leading-tight">
                      {row.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {row.isStaffRow
                        ? "Tournament Staff"
                        : "Matchday Active Roster"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 flex-1 max-w-sm sm:justify-end">
                  <div className="w-full max-w-[140px]">
                    <ProgressBar
                      value={Math.min(100, row.distributionRatePercent)}
                      size="sm"
                      color={row.isStaffRow ? "emerald" : "gold"}
                    />
                  </div>
                  <div className="text-right min-w-[70px]">
                    <span className="font-bold text-slate-900 text-xs">
                      {row.mealsProvidedCount} / {row.eligibleCount}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      {row.distributionRatePercent}% rate
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer Totals */}
          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
            <span>
              Total Eligible Registrants:{" "}
              <strong className="text-slate-900">
                {dashboard.eligibleRegistrantsCount}
              </strong>
            </span>
            <span>
              Total Meals Provided:{" "}
              <strong className="text-slate-900">
                {dashboard.mealsProvidedTodayCount}
              </strong>
            </span>
            <span>
              Overall Distribution Rate:{" "}
              <strong className="text-[#9B7415]">{overallRate}%</strong>
            </span>
          </div>
        </div>

        {/* Right 1 Col: Recent Meal Activity (Latest 5) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h3 className="text-base font-bold text-slate-900">
                Recent Meal Activity
              </h3>
              <Clock className="h-4 w-4 text-slate-400" />
            </div>

            <div className="divide-y divide-slate-100">
              {dashboard.recentActivity.map((rec) => (
                <div key={rec.id} className="py-2.5 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {rec.registrantName}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      <span className="font-mono text-slate-600 font-semibold">
                        {rec.registrantCode}
                      </span>{" "}
                      • {rec.teamName}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="inline-block rounded-md bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 text-[10px] font-bold text-emerald-800">
                      {rec.periodLabel}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5 font-sans">
                      {formatTimestampIST(rec.providedAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4">
            <Link
              to={ROUTES.CATERING.REPORTS_ACTIVITY}
              className="flex items-center justify-center gap-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <span>View in Reports</span>
              <ArrowRight className="h-3.5 w-3.5 text-[#C9A227]" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CateringDashboardPage;
