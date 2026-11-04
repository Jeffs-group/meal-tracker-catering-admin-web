import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  UtensilsCrossed,
  Shield,
  Users,
  Search,
  Settings,
  ArrowRight,
  QrCode,
  AlertCircle,
} from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { TeamTile } from "@/components/reports/TeamTile";
import { ScanDialog } from "@/components/catering/ScanDialog";
import { extractCodeFromQrPayload } from "@/utils/qrPayload";
import { useMealsOverview, useMealSearch } from "@/hooks/useCatering";
import { usePermissions } from "@/hooks/usePermissions";
import { ROUTES, buildCateringTeamRoute, buildCateringRegistrantRoute } from "@/constants/routes";
import { getManageMealsDashboard } from "@/api/manageMeals.api";

export const MealsLandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { can } = usePermissions();

  const [searchQuery, setSearchQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [isScanOpen, setIsScanOpen] = useState(false);

  const { data: overview, isLoading, error, refetch } = useMealsOverview();
  const { data: searchResults, isFetching: isSearching } = useMealSearch(submittedQuery);

  useEffect(() => {
    getManageMealsDashboard().catch(() => {});
  }, []);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const raw = searchQuery.trim();
    if (!raw) return;
    const extracted = extractCodeFromQrPayload(raw);
    setSearchQuery(extracted);
    setSubmittedQuery(extracted);
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center text-xs text-slate-500">
          Loading meal management…
        </div>
      </div>
    );
  }

  if (error || !overview) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 rounded-2xl border border-red-200 bg-white shadow-xs space-y-4 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
          <AlertCircle className="h-8 w-8" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Failed to Load Manage Meals</h2>
          <p className="mt-1.5 text-sm text-slate-600">
            {(error as Error)?.message || "Unable to retrieve dashboard information from the server."}
          </p>
        </div>
        <div className="flex items-center justify-center gap-3 pt-3">
          <Button variant="primary" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const overallRate = overview.eligibleRegistrantsCount
    ? Math.round(
        (overview.mealsProvidedTodayCount / overview.eligibleRegistrantsCount) *
          100,
      )
    : 0;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-1 border-b border-slate-200 gap-3">
        <div>
          <h1 className="text-[clamp(24px,2vw+16px,32px)] font-bold tracking-tight text-slate-900 leading-[1.25]">
            Manage Meals
          </h1>
          <p className="mt-1 text-sm text-slate-600 leading-relaxed">
            Verify accreditation credentials and authorize matchday meal dispensation.
          </p>
        </div>

        {can("meals", "manage") && (
          <Link to={ROUTES.CATERING.MEALS_CONFIG}>
            <Button
              variant="primary"
              size="md"
              className="rounded-xl bg-[#C9A227] hover:bg-[#B8901E] text-white shadow-xs font-semibold"
              leftIcon={<Settings className="h-4 w-4" />}
            >
              Meal Configuration
            </Button>
          </Link>
        )}
      </div>

      {/* 3 Top Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="ACTIVE TEAMS"
          value={overview.activeTeamsCount}
          subtitle="Matchday activated delegations"
          icon={<Shield className="h-5 w-5 text-slate-400" />}
          badgeText="Matchday Live"
          badgeVariant="success"
        />

        <StatCard
          title="ELIGIBLE REGISTRANTS"
          value={overview.eligibleRegistrantsCount}
          subtitle="Athletes, coaches and event operations personnel"
          icon={<Users className="h-5 w-5 text-slate-400" />}
          badgeText="Authorized"
          badgeVariant="neutral"
        />

        <StatCard
          title="MEALS PROVIDED TODAY"
          value={overview.mealsProvidedTodayCount}
          subtitle="Logged across active service counters"
          icon={<UtensilsCrossed className="h-5 w-5 text-[#C9A227]" />}
          progress={{
            value: Math.min(100, overallRate),
            color: "gold",
          }}
          badgeText={`${overallRate}% Fulfilment`}
          badgeVariant="warning"
        />
      </div>

      {/* Wedge / Quick Scanner Search Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <form onSubmit={handleSearch} className="space-y-3">
          <label
            htmlFor="registrant-scanner-input"
            className="block text-xs font-bold uppercase tracking-wider text-slate-800"
          >
            Search by Registered ID or Registrant Name
          </label>
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Input
                id="registrant-scanner-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter credential ID (e.g. REG-TM-A-001) or athlete name…"
                className="w-full text-xs font-medium"
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              size="md"
              className="rounded-xl bg-[#C9A227] hover:bg-[#B8901E] text-white font-semibold shrink-0"
              leftIcon={<Search className="h-4 w-4" />}
            >
              Search Registrant
            </Button>
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setIsScanOpen(true)}
              className="rounded-xl border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold shrink-0"
              leftIcon={<QrCode className="h-4 w-4 text-[#C9A227]" />}
            >
              Scan QR
            </Button>
          </div>
          <p className="text-[11px] text-slate-500">
            Supports optical QR scanners and USB barcode wedges. Pressing enter automatically resolves attendee profile.
          </p>
        </form>

        {/* Inline Search Results */}
        {submittedQuery && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-700">
                Search Results for "{submittedQuery}":
              </span>
              <button
                type="button"
                onClick={() => {
                  setSubmittedQuery("");
                  setSearchQuery("");
                }}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                Clear Results
              </button>
            </div>

            {isSearching ? (
              <p className="text-xs text-slate-400 py-3">Resolving credentials…</p>
            ) : searchResults && searchResults.length > 0 ? (
              <div className="space-y-2">
                {searchResults.map((item) => (
                  <div
                    key={item.id}
                    onClick={() =>
                      navigate(buildCateringRegistrantRoute(item.registrantCode || item.registrantId))
                    }
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-[#C9A227]/50 cursor-pointer transition-all gap-2"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-white font-bold text-xs select-none shrink-0">
                        {item.fullName.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-900">
                            {item.fullName}
                          </h4>
                          <span className="font-mono text-[10px] text-slate-500">
                            {item.registrantCode}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {item.teamName} • {item.designation}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                      {item.isEligibleToday ? (
                        <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">
                          Eligible today
                        </span>
                      ) : (
                        <span className="rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800">
                          {item.ineligibilityReason || "Not eligible today"}
                        </span>
                      )}

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={!can("meals", "verify")}
                        onClick={() =>
                          navigate(buildCateringRegistrantRoute(item.registrantCode || item.registrantId))
                        }
                        className="rounded-lg text-xs"
                      >
                        {item.isEligibleToday ? "Dispense Meal →" : "View Meal Status →"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <p className="text-xs text-slate-400">
                  No matching active credential found for today's matchday roster.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(buildCateringRegistrantRoute(submittedQuery))}
                  className="rounded-lg text-xs shrink-0"
                >
                  Open Meal Selection Page →
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Active Matchday Teams List */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Active Teams
          </h2>
          <span className="rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 text-[11px] font-bold text-slate-700">
            {overview.teams.length} Matchday Active Teams
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {overview.teams.map((team) => (
            <div
              key={team.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between hover:shadow-subtle hover:border-slate-300 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <TeamTile
                      name={team.name}
                      code={team.letterCode}
                      size="md"
                    />
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-slate-900 truncate leading-tight">
                        {team.name}
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                        Matchday Roster Confirmed
                      </p>
                    </div>
                  </div>

                  <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-800 shrink-0">
                    Active
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Eligible Registrants:</span>
                    <span className="font-semibold text-slate-800">
                      {team.eligibleCount}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Meals Provided:</span>
                    <span className="font-bold text-slate-900">
                      {team.mealsProvidedCount}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100">
                <Link
                  to={buildCateringTeamRoute(team.id)}
                  className="flex items-center justify-between text-xs font-bold text-[#9B7415] hover:text-[#7D5C13] transition-colors"
                >
                  <span>View Team Registrants</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}

          {/* Approved Operational Staff Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between hover:shadow-subtle hover:border-slate-300 transition-all">
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 text-white font-bold text-xs select-none shrink-0 shadow-2xs">
                    ST
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-900 truncate leading-tight">
                      Approved Staff
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                      Operational Staff Roster
                    </p>
                  </div>
                </div>

                <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-800 shrink-0">
                  Active Roster
                </span>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Eligible Staff:</span>
                  <span className="font-semibold text-slate-800">
                    {overview.staffSummary.eligibleCount}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Meals Provided:</span>
                  <span className="font-bold text-slate-900">
                    {overview.staffSummary.mealsProvidedCount}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100">
              <Link
                to={ROUTES.CATERING.MEALS_STAFF}
                className="flex items-center justify-between text-xs font-bold text-[#9B7415] hover:text-[#7D5C13] transition-colors"
              >
                <span>View Staff Registrants</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Camera QR Scanner Dialog */}
      <ScanDialog
        isOpen={isScanOpen}
        onClose={() => setIsScanOpen(false)}
        onScanSuccess={(registrantId) => {
          navigate(buildCateringRegistrantRoute(registrantId));
        }}
      />
    </div>
  );
};

export default MealsLandingPage;
