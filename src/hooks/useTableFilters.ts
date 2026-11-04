import { useSearchParams } from "react-router-dom";
import { useCallback, useMemo } from "react";
import { useDebounce } from "./useDebounce";
import type { TableQueryParams } from "@/types/common.types";

export function useTableFilters(defaults: TableQueryParams = {}) {
  const [searchParams, setSearchParams] = useSearchParams();

  const search = searchParams.get("search") ?? defaults.search ?? "";
  const status = searchParams.get("status") ?? defaults.status ?? "";
  const league = searchParams.get("league") ?? defaults.league ?? "";
  const role = searchParams.get("role") ?? defaults.role ?? "";
  const memberType =
    searchParams.get("memberType") ?? defaults.memberType ?? "ALL";
  const tab = searchParams.get("tab") ?? defaults.tab ?? "teams";
  const sortBy = searchParams.get("sortBy") ?? defaults.sortBy ?? "submittedAt";
  const sortOrder =
    (searchParams.get("sortOrder") as "asc" | "desc") ??
    defaults.sortOrder ??
    "desc";
  const page = parseInt(
    searchParams.get("page") || String(defaults.page || 1),
    10,
  );
  const pageSize = parseInt(
    searchParams.get("pageSize") || String(defaults.pageSize || 10),
    10,
  );

  const debouncedSearch = useDebounce(search, 300);

  const updateParam = useCallback(
    (key: string, value: string | number | undefined, resetPage = true) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (value === undefined || value === "" || value === null) {
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

  const resetFilters = useCallback(() => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams();
        const currentTab = prev.get("tab");
        if (currentTab) next.set("tab", currentTab);
        next.set("page", "1");
        return next;
      },
      { replace: true },
    );
  }, [setSearchParams]);

  const queryParams: TableQueryParams = useMemo(
    () => ({
      search: debouncedSearch,
      status,
      league,
      role,
      memberType,
      tab,
      sortBy,
      sortOrder,
      page,
      pageSize,
    }),
    [
      debouncedSearch,
      status,
      league,
      role,
      memberType,
      tab,
      sortBy,
      sortOrder,
      page,
      pageSize,
    ],
  );

  return {
    search,
    rawSearch: search,
    debouncedSearch,
    status,
    league,
    role,
    memberType,
    tab,
    sortBy,
    sortOrder,
    page,
    pageSize,
    queryParams,
    setSearch: (val: string) => updateParam("search", val),
    setStatus: (val: string) => updateParam("status", val),
    setLeague: (val: string) => updateParam("league", val),
    setRole: (val: string) => updateParam("role", val),
    setMemberType: (val: string) => updateParam("memberType", val),
    setTab: (val: string) => updateParam("tab", val, false),
    setSortBy: (val: string) => updateParam("sortBy", val),
    setSortOrder: (val: "asc" | "desc") => updateParam("sortOrder", val),
    setPage: (val: number) => updateParam("page", val, false),
    setPageSize: (val: number) => updateParam("pageSize", val),
    resetFilters,
  };
}

export default useTableFilters;
