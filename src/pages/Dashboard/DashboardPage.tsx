import React, { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import {
  RegistrationDonut,
  BreakdownBars,
  RecentRegistrationsTable,
  TeamOverviewTable,
} from "@/components/dashboard";
import { RegistrantReviewModal } from "@/components/registrations/RegistrantReviewModal";
import { ErrorDisplay } from "@/components/ui/ErrorDisplay";
import { useDashboard } from "@/hooks/useDashboard";
import { Users, Clock, CheckCircle2, ShieldCheck } from "lucide-react";

export const DashboardPage: React.FC = () => {
  const { data, isLoading, isError, error, refetch } = useDashboard();
  const [reviewId, setReviewId] = useState<string | null>(null);

  if (isError) {
    return (
      <div className="py-12">
        <ErrorDisplay
          title="Failed to Load Dashboard Metrics"
          message={
            error instanceof Error
              ? error.message
              : "An error occurred while fetching registration metrics."
          }
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Meal Tracker Dashboard"
        description="Comprehensive real-time overview of tournament registrations, approvals, and meal eligibility allocations."
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Dashboard" },
        ]}
      />

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Registrations"
          value={
            isLoading ? "..." : (data?.stats.totalRegistrations.count ?? 0)
          }
          trend={
            data?.stats.totalRegistrations
              ? {
                  value: `+${data.stats.totalRegistrations.trendPercentage}%`,
                  isPositive: true,
                }
              : undefined
          }
          subtitle="All rosters across active leagues"
          icon={<Users className="h-5 w-5" />}
        />

        <StatCard
          title="Pending Approvals"
          value={isLoading ? "..." : (data?.stats.pendingApprovals.count ?? 0)}
          badgeText="Requires Action"
          badgeVariant="warning"
          subtitle="Awaiting administrative verification"
          icon={<Clock className="h-5 w-5 text-amber-500" />}
        />

        <StatCard
          title="Approved Registrations"
          value={
            isLoading ? "..." : (data?.stats.approvedRegistrations.count ?? 0)
          }
          badgeText={`${data?.stats.approvedRegistrations.ratioPercentage ?? 0}% Ratio`}
          badgeVariant="success"
          subtitle="QR codes & meal access generated"
          icon={<CheckCircle2 className="h-5 w-5 text-emerald-500" />}
        />

        <StatCard
          title="Active Teams"
          value={
            isLoading
              ? "..."
              : `${data?.stats.activeTeams.count ?? 0} / ${data?.stats.activeTeams.totalTeams ?? 0}`
          }
          badgeText={`${data?.stats.activeTeams.verifiedPercentage ?? 100}% Verified`}
          badgeVariant="neutral"
          subtitle="Eligible for kitchen catering batch"
          icon={<ShieldCheck className="h-5 w-5 text-[#C9A227]" />}
        />
      </div>

      {/* Visual Analytics Grid: Donut + Breakdown Bars */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8 items-stretch">
        {/* Registration Overview Donut Chart */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs flex flex-col justify-between min-h-[380px] overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 mb-4 shrink-0">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Registration Overview
              </h3>
              <p className="text-xs text-slate-500">
                Distribution by verification status
              </p>
            </div>
          </div>
          <div className="flex-1 flex flex-col justify-between">
            {isLoading || !data ? (
              <div className="h-64 flex items-center justify-center text-xs text-slate-400">
                Loading chart distribution...
              </div>
            ) : (
              <RegistrationDonut data={data.overview} />
            )}
          </div>
        </div>

        {/* Registration Breakdown Progress Bars & Rates */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs flex flex-col justify-between min-h-[380px] overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 mb-4 shrink-0">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Capacity & Intake Breakdown
              </h3>
              <p className="text-xs text-slate-500">
                Roster quota utilization and daily meal tracking metrics
              </p>
            </div>
          </div>
          <div className="flex-1 flex flex-col justify-between">
            {isLoading || !data ? (
              <div className="h-64 flex items-center justify-center text-xs text-slate-400">
                Loading capacity breakdown...
              </div>
            ) : (
              <BreakdownBars data={data.breakdown} />
            )}
          </div>
        </div>
      </div>

      {/* Tables Section: Recent Registrations & Team Overview */}
      <div className="space-y-6">
        {data && (
          <RecentRegistrationsTable
            items={data.recentRegistrations}
            onReviewRegistrant={(id) => setReviewId(id)}
          />
        )}

        {data && <TeamOverviewTable teams={data.teamOverview} />}
      </div>

      {/* Registrant Review Modal */}
      <RegistrantReviewModal
        registrantId={reviewId}
        isOpen={!!reviewId}
        onClose={() => setReviewId(null)}
      />
    </div>
  );
};

export default DashboardPage;
