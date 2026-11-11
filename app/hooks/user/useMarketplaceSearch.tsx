"use client";

import { usePathname, useRouter } from "next/navigation";

import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    type FormEvent,
} from "react";

import {
    INITIAL_FILTERS,
    buildSearchParams,
    readFiltersFromUrl,
    type MarketplaceFilterState,
    type MarketplaceFilterKey,
    type SortOption,
    type MarketplaceVehicleFilterLabels,
} from "@/app/lib/user/marketplace/marketplace-search";

import {
    searchMarketplace,
    getFeaturedMarketplaceListings,
} from "@/app/services/user/marketplace/marketplace.service";

import {
    getExternalVehicleMakes,
    getExternalVehicleModels,
    type ExternalVehicleOption,
} from "@/app/services/user/listings/external-vehicle-catalog.service";

import type {
    MarketplacePagination,
    MarketplaceSearchResult,
} from "@/app/types/user/marketplace.types";

/* -------------------------------------------------------------------------- */
/* Configuration                                                              */
/* -------------------------------------------------------------------------- */

const MARKETPLACE_PAGE_SIZE = 12;
const FEATURED_PAGE_SIZE = 12;

const MARKETPLACE_ERROR =
    "We couldn't load vehicle listings. Please check your connection and try again.";

/* -------------------------------------------------------------------------- */
/* Hook                                                                       */
/* -------------------------------------------------------------------------- */

export function useMarketplaceSearch() {
    const router = useRouter();
    const pathname = usePathname();
    /* ---------------------------------------------------------------------- */
    /* Search state                                                           */
    /* ---------------------------------------------------------------------- */

    const [query, setQuery] = useState("");
    const [submittedQuery, setSubmittedQuery] = useState("");

    const [filters, setFilters] =
        useState<MarketplaceFilterState>(INITIAL_FILTERS);

    const [sort, setSort] = useState<SortOption>("newest");
    const [page, setPage] = useState(1);

    const [results, setResults] = useState<
        MarketplaceSearchResult[]
    >([]);

    const [pagination, setPagination] =
        useState<MarketplacePagination | null>(null);

    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState("");

    const [retryCount, setRetryCount] = useState(0);
    const [initialized, setInitialized] = useState(false);

    /* ---------------------------------------------------------------------- */
    /* Featured listings                                                      */
    /* ---------------------------------------------------------------------- */

    const [featuredVehicles, setFeaturedVehicles] = useState<
        MarketplaceSearchResult[]
    >([]);

    const [featuredLoading, setFeaturedLoading] = useState(true);
    const [featuredError, setFeaturedError] = useState("");
    const [featuredRetryCount, setFeaturedRetryCount] = useState(0);

    /* ---------------------------------------------------------------------- */
    /* Vehicle catalog                                                        */
    /* ---------------------------------------------------------------------- */

    const [makes, setMakes] = useState<ExternalVehicleOption[]>([]);
    const [models, setModels] = useState<ExternalVehicleOption[]>([]);
    const [vehicleModelsLoading, setVehicleModelsLoading] = useState(false);

    const [vehicleCatalogLoading, setVehicleCatalogLoading] =
        useState(false);

    const [vehicleCatalogError, setVehicleCatalogError] = useState("");

    const [vehicleCatalogRetryCount, setVehicleCatalogRetryCount] =
        useState(0);

    /* ---------------------------------------------------------------------- */
    /* Request coordination                                                   */
    /* ---------------------------------------------------------------------- */

    /**
     * Every marketplace request receives an increasing ID.
     *
     * Only the latest request is allowed to update the result state.
     * This prevents older requests from overwriting newer searches.
     */
    const searchRequestIdRef = useRef(0);

    /**
     * Prevent duplicate Load More requests before React updates state.
     */
    const loadingMoreRef = useRef(false);

    /* ---------------------------------------------------------------------- */
    /* Restore state from URL                                                 */
    /* ---------------------------------------------------------------------- */

    useEffect(() => {
        const initialState = readFiltersFromUrl();

        setQuery(initialState.query);
        setSubmittedQuery(initialState.query);
        setFilters(initialState.filters);
        setSort(initialState.sort);

        /**
         * Always start from page one.
         *
         * This is important because Load More uses accumulated results.
         * Loading page three directly after refresh would omit pages one
         * and two from the displayed results.
         */
        setPage(1);

        setInitialized(true);
    }, []);

    /* ---------------------------------------------------------------------- */
    /* Load featured listings                                                 */
    /* ---------------------------------------------------------------------- */

    useEffect(() => {
        let active = true;

        async function loadFeaturedVehicles() {
            setFeaturedLoading(true);
            setFeaturedError("");

            try {
                const response =
                    await getFeaturedMarketplaceListings({
                        page: 1,
                        limit: FEATURED_PAGE_SIZE,
                    });

                if (!active) return;

                setFeaturedVehicles(
                    response.data.listings ?? [],
                );
            } catch {
                if (!active) return;

                setFeaturedError(
                    "Unable to load featured vehicles. Please try again.",
                );
            } finally {
                if (active) {
                    setFeaturedLoading(false);
                }
            }
        }

        void loadFeaturedVehicles();

        return () => {
            active = false;
        };
    }, [featuredRetryCount]);

    /* ---------------------------------------------------------------------- */
    /* Load vehicle makes                                                     */
    /* ---------------------------------------------------------------------- */

    useEffect(() => {
        let active = true;

        async function loadMakes() {
            setVehicleCatalogLoading(true);
            setVehicleCatalogError("");

            try {
                const data = await getExternalVehicleMakes();

                if (!active) return;

                setMakes(data);
            } catch {
                if (!active) return;

                setVehicleCatalogError(
                    "Unable to load vehicle makes. Please try again.",
                );
            } finally {
                if (active) {
                    setVehicleCatalogLoading(false);
                }
            }
        }

        void loadMakes();

        return () => {
            active = false;
        };
    }, [vehicleCatalogRetryCount]);

    /* ---------------------------------------------------------------------- */
    /* Load models from the external vehicle providers                       */
    /* ---------------------------------------------------------------------- */

    useEffect(() => {
        let active = true;
        setModels([]);

        if (!filters.make) {
            setVehicleModelsLoading(false);
            return () => { active = false; };
        }

        async function loadModels() {
            setVehicleModelsLoading(true);
            setVehicleCatalogError("");
            try {
                const data = await getExternalVehicleModels(filters.make);
                if (active) setModels(data);
            } catch {
                if (active) {
                    setVehicleCatalogError("Unable to load models for the selected make.");
                }
            } finally {
                if (active) setVehicleModelsLoading(false);
            }
        }

        void loadModels();
        return () => { active = false; };
    }, [filters.make, vehicleCatalogRetryCount]);

    /* ---------------------------------------------------------------------- */
    /* Resolve selected vehicle labels                                        */
    /* ---------------------------------------------------------------------- */

    const vehicleLabels: MarketplaceVehicleFilterLabels = useMemo(() => ({
        make: filters.make || undefined,
        model: filters.model || undefined,
        variant: filters.variant || undefined,
    }), [filters.make, filters.model, filters.variant]);

    /* ---------------------------------------------------------------------- */
    /* Update individual filters                                              */
    /* ---------------------------------------------------------------------- */

    const updateFilter = useCallback(
        <K extends MarketplaceFilterKey>(
            key: K,
            value: MarketplaceFilterState[K],
        ) => {
            setFilters((current) => {
                const next: MarketplaceFilterState = {
                    ...current,
                    [key]: value,
                };

                if (key === "make" && value !== current.make) {
                    next.model = "";
                    next.variant = "";
                }

                if (key === "model" && value !== current.model) {
                    next.variant = "";
                }

                return next;
            });

            loadingMoreRef.current = false;
            setPage(1);
            setError("");
        },
        [],
    );

    /* ---------------------------------------------------------------------- */
    /* Remove individual filters                                              */
    /* ---------------------------------------------------------------------- */

    const removeFilter = useCallback(
        (key: MarketplaceFilterKey) => {
            setFilters((current) => {
                const next = { ...current };

                switch (key) {
                    case "minPrice":
                    case "maxPrice":
                        next.minPrice = "";
                        next.maxPrice = "";
                        break;

                    case "minMileage":
                    case "maxMileage":
                        next.minMileage = "";
                        next.maxMileage = "";
                        break;

                    case "minYear":
                    case "maxYear":
                        next.minYear = "";
                        next.maxYear = "";
                        break;

                    case "make":
                        next.make = "";
                        next.model = "";
                        next.variant = "";
                        break;

                    case "model":
                        next.model = "";
                        next.variant = "";
                        break;

                    case "variant":
                        next.variant = "";
                        break;

                    case "dealerOnly":
                    case "verifiedDealerOnly":
                        next[key] = false;
                        break;

                    default:
                        next[key] = "";
                        break;
                }

                return next;
            });

            loadingMoreRef.current = false;
            setPage(1);
            setError("");
        },
        [],
    );

    /* ---------------------------------------------------------------------- */
    /* Submit keyword search                                                  */
    /* ---------------------------------------------------------------------- */

    const handleSearch = useCallback(
        (event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();

            loadingMoreRef.current = false;

            const nextQuery = query.trim();

            setPage(1);
            setError("");
            setQuery(nextQuery);
            setSubmittedQuery(nextQuery);

            if (pathname !== "/marketplace") {
                const params = new URLSearchParams();

                if (nextQuery) {
                    params.set("q", nextQuery);
                }

                router.push(
                    params.size
                        ? `/marketplace?${params.toString()}`
                        : "/marketplace",
                );

                return;
            }
        },
        [query, pathname, router],
    );

    /* ---------------------------------------------------------------------- */
    /* Clear all search filters                                               */
    /* ---------------------------------------------------------------------- */

    const clearFilters = useCallback(() => {
        loadingMoreRef.current = false;

        setFilters({ ...INITIAL_FILTERS });
        setQuery("");
        setSubmittedQuery("");
        setSort("newest");
        setPage(1);

        setVehicleCatalogError("");
        setError("");
    }, []);

    /* ---------------------------------------------------------------------- */
    /* Change sort                                                            */
    /* ---------------------------------------------------------------------- */

    const handleSortChange = useCallback(
        (nextSort: SortOption) => {
            if (nextSort === sort) return;

            loadingMoreRef.current = false;

            setSort(nextSort);
            setPage(1);
            setError("");
        },
        [sort],
    );

    /* ---------------------------------------------------------------------- */
    /* Retry marketplace search                                               */
    /* ---------------------------------------------------------------------- */

    const retry = useCallback(() => {
        setRetryCount((count) => count + 1);
    }, []);

    /* ---------------------------------------------------------------------- */
    /* Retry featured listings                                                */
    /* ---------------------------------------------------------------------- */

    const retryFeatured = useCallback(() => {
        setFeaturedRetryCount((count) => count + 1);
    }, []);

    /* ---------------------------------------------------------------------- */
    /* Retry vehicle catalog                                                  */
    /* ---------------------------------------------------------------------- */

    const retryVehicleCatalog = useCallback(() => {
        setVehicleCatalogError("");
        setVehicleCatalogRetryCount((count) => count + 1);
    }, []);

    /* ---------------------------------------------------------------------- */
    /* Load more listings                                                      */
    /* ---------------------------------------------------------------------- */

    const loadMore = useCallback(() => {
        if (
            loading ||
            loadingMoreRef.current ||
            !pagination?.hasNextPage ||
            error
        ) {
            return;
        }

        loadingMoreRef.current = true;
        setPage((current) => current + 1);
    }, [loading, pagination, error]);

    /* ---------------------------------------------------------------------- */
    /* Fetch marketplace listings                                             */
    /* ---------------------------------------------------------------------- */

    useEffect(() => {
        if (!initialized) return;

        let active = true;

        const requestId = ++searchRequestIdRef.current;

        const isCurrentRequest = () =>
            active &&
            requestId === searchRequestIdRef.current;

        async function loadListings() {
            setLoading(true);
            setError("");

            if (page > 1) {
                setLoadingMore(true);
            } else {
                setLoadingMore(false);
                loadingMoreRef.current = false;
            }

            try {
                const searchParams = buildSearchParams(
                    submittedQuery,
                    filters,
                    sort,
                    page,
                );

                const response = await searchMarketplace({
                    ...searchParams,
                    page,
                    limit: MARKETPLACE_PAGE_SIZE,

                    /**
                     * Boosted listings remain part of the normal
                     * marketplace inventory. Active boosts only affect
                     * ranking and featured placement, never eligibility.
                     */
                });

                if (!isCurrentRequest()) return;

                const incomingListings =
                    response.data.listings ?? [];

                if (page === 1) {
                    setResults(incomingListings);
                } else {
                    setResults((current) => {
                        const existingIds = new Set(
                            current.map(
                                (item) => item.listing.id,
                            ),
                        );

                        const uniqueListings =
                            incomingListings.filter(
                                (item) =>
                                    !existingIds.has(
                                        item.listing.id,
                                    ),
                            );

                        return [
                            ...current,
                            ...uniqueListings,
                        ];
                    });
                }

                setPagination(response.data.pagination);
            } catch {
                if (!isCurrentRequest()) return;

                /**
                 * Preserve already loaded results when a later
                 * pagination request fails.
                 */
                if (page === 1) {
                    setResults([]);
                    setPagination(null);
                }

                setError(MARKETPLACE_ERROR);
            } finally {
                if (isCurrentRequest()) {
                    setLoading(false);
                    setLoadingMore(false);
                    loadingMoreRef.current = false;
                }
            }
        }

        void loadListings();

        return () => {
            active = false;
        };
    }, [
        initialized,
        submittedQuery,
        filters,
        sort,
        page,
        retryCount,
    ]);

    /* ---------------------------------------------------------------------- */
    /* Synchronize search state with URL                                       */
    /* ---------------------------------------------------------------------- */

    useEffect(() => {
        if (!initialized || pathname !== "/marketplace") return;

        const searchParams = buildSearchParams(
            submittedQuery,
            filters,
            sort,
            1,
        );

        const params = new URLSearchParams();

        for (const [key, value] of Object.entries(searchParams)) {
            if (
                value === undefined ||
                value === null ||
                value === "" ||
                value === false ||
                key === "page"
            ) {
                continue;
            }

            params.set(key, String(value));
        }

        const queryString = params.toString();

        const nextUrl = queryString
            ? `/marketplace?${queryString}`
            : "/marketplace";

        const currentUrl =
            `${window.location.pathname}${window.location.search}`;

        if (currentUrl !== nextUrl) {
            window.history.replaceState(
                null,
                "",
                nextUrl,
            );
        }
    }, [
        initialized,
        pathname,
        submittedQuery,
        filters,
        sort,
    ]);

    /* ---------------------------------------------------------------------- */
    /* Return public hook API                                                  */
    /* ---------------------------------------------------------------------- */

    return {
        initialized,

        // Search
        query,
        setQuery,
        submittedQuery,
        handleSearch,

        // Filters
        filters,
        updateFilter,
        removeFilter,
        clearFilters,

        // Vehicle catalog
        makes,
        models,
        vehicleLabels,
        vehicleCatalogLoading,
        vehicleModelsLoading,
        vehicleCatalogError,
        retryVehicleCatalog,

        // Sorting
        sort,
        handleSortChange,

        // Featured listings
        featuredVehicles,
        featuredLoading,
        featuredError,
        retryFeatured,

        // Pagination
        page,
        setPage,
        loadMore,
        hasMore: pagination?.hasNextPage ?? false,
        loadingMore,

        // Ordinary marketplace results
        results,
        pagination,
        loading,
        error,

        // Retry
        retry,
    };
}