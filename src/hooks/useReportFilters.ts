import { useSearchParams } from "react-router-dom";
import { useCallback, useMemo } from "react";
import { useDebounce } from "./useDebounce";
import type { ReportFilters } from "@/types/reports.types";
import { OPERATING_DATE_DEFAULT } from "@/constants/catering";

export interface UseReportFiltersOptions {
  defaultFilters?: Partial<ReportFilters>;
  hasDateRange?: boolean;
}

export function useReportFilters(options: UseReportFiltersOptions = {}) {
  const { defaultFilters = {}, hasDateRange = true } = options;
  const [searchParams, setSearchParams] = useSearchParams();

  const search = searchParams.get("search") ?? defaultFilters.search ?? "";
  const from = searchParams.get("from") ?? (hasDateRange ? (defaultFilters.from ?? "2026-01-01") : "");
  const to = searchParams.get("to") ?? (hasDateRange ? (defaultFilters.to ?? OPERATING_DATE_DEFAULT) : "");
  const league = searchParams.get("league") ?? defaultFilters.league ?? "";
  const teamId = searchParams.get("teamId") ?? defaultFilters.teamId ?? "";
  const type = (searchParams.get("type") as ReportFilters["type"]) ?? defaultFilters.type ?? "ALL";
  const memberRole = searchParams.get("memberRole") ?? defaultFilters.memberRole ?? "";
  const status = searchParams.get("status") ?? defaultFilters.status ?? "ALL";
  const eligibility = (searchParams.get("eligibility") as ReportFilters["eligibility"]) ?? defaultFilters.eligibility ?? "ALL";
  const sortBy = searchParams.get("sortBy") ?? defaultFilters.sortBy ?? "";
  const sortOrder = (searchParams.get("sortOrder") as "asc" | "desc") ?? defaultFilters.sortOrder ?? "desc";
  const page = parseInt(searchParams.get("page") || String(defaultFilters.page || 1), 10);
  const pageSize = parseInt(searchParams.get("pageSize") || String(defaultFilters.pageSize || 10), 10);

  const debouncedSearch = useDebounce(search, 300);

  const updateParam = useCallback(
    (key: string, value: string | number | undefined | null, resetPage = true) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (value === undefined || value === "" || value === null || value === "ALL") {
            next.delete(key);
          } else {
            next.set(key, String(value));
          }
          if (resetPage && key !== "page") {
            next.set("page", "1");
          }
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const setFilterBatch = useCallback(
    (updates: Record<string, string | number | undefined | null>, resetPage = true) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          Object.entries(updates).forEach(([key, value]) => {
            if (value === undefined || value === "" || value === null || value === "ALL") {
              next.delete(key);
            } else {
              next.set(key, String(value));
            }
          });
          if (resetPage) {
            next.set("page", "1");
          }
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  // Cascading filters: choosing a League narrows teams; choosing Type = Staff or Organizer clears league, team, role
  const handleTypeChange = useCallback(
    (newType: string) => {
      if (newType === "STAFF" || newType === "ORGANIZER") {
        setFilterBatch({
          type: newType,
          league: undefined,
          teamId: undefined,
          memberRole: undefined,
        });
      } else {
        updateParam("type", newType);
      }
    },
    [setFilterBatch, updateParam],
  );

  const handleLeagueChange = useCallback(
    (newLeague: string) => {
      setFilterBatch({
        league: newLeague,
        teamId: undefined, // Reset team when league changes
      });
    },
    [setFilterBatch],
  );

  const resetFilters = useCallback(() => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams();
        if (hasDateRange) {
          next.set("from", "2026-01-01");
          next.set("to", OPERATING_DATE_DEFAULT);
        }
        next.set("page", "1");
        next.set("pageSize", String(pageSize));
        // Preserve sorting if set
        if (prev.get("sortBy")) next.set("sortBy", prev.get("sortBy")!);
        if (prev.get("sortOrder")) next.set("sortOrder", prev.get("sortOrder")!);
        return next;
      },
      { replace: true },
    );
  }, [hasDateRange, pageSize, setSearchParams]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (search.trim()) count++;
    if (league && league !== "ALL") count++;
    if (teamId && teamId !== "ALL") count++;
    if (type && type !== "ALL") count++;
    if (memberRole && memberRole !== "ALL") count++;
    if (status && status !== "ALL") count++;
    if (eligibility && eligibility !== "ALL") count++;
    if (from && from !== "2026-01-01") count++;
    if (to && to !== OPERATING_DATE_DEFAULT) count++;
    return count;
  }, [search, league, teamId, type, memberRole, status, eligibility, from, to]);

  const isFiltered = activeFilterCount > 0;

  const filters: ReportFilters = useMemo(
    () => ({
      search: debouncedSearch,
      from,
      to,
      league,
      teamId,
      type,
      memberRole,
      status,
      eligibility,
      sortBy,
      sortOrder,
      page,
      pageSize,
    }),
    [
      debouncedSearch,
      from,
      to,
      league,
      teamId,
      type,
      memberRole,
      status,
      eligibility,
      sortBy,
      sortOrder,
      page,
      pageSize,
    ],
  );

  return {
    filters,
    search,
    rawSearch: search,
    debouncedSearch,
    from,
    to,
    league,
    teamId,
    type,
    memberRole,
    status,
    eligibility,
    sortBy,
    sortOrder,
    page,
    pageSize,
    activeFilterCount,
    isFiltered,
    setSearch: (v: string) => updateParam("search", v),
    setDateRange: (f: string, t: string) => setFilterBatch({ from: f, to: t }),
    setLeague: handleLeagueChange,
    setTeamId: (v: string) => updateParam("teamId", v),
    setType: handleTypeChange,
    setMemberRole: (v: string) => updateParam("memberRole", v),
    setStatus: (v: string) => updateParam("status", v),
    setEligibility: (v: string) => updateParam("eligibility", v),
    setSort: (sBy: string, sOrder: "asc" | "desc") => setFilterBatch({ sortBy: sBy, sortOrder: sOrder }, false),
    setPage: (p: number) => updateParam("page", p, false),
    setPageSize: (s: number) => updateParam("pageSize", s),
    resetFilters,
  };
}

