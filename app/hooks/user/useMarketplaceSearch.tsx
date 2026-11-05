"use client";

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
    getVehicleMakes,
    getVehicleModels,
    getVehicleGenerations,
    getVehicleVariants,
} from "@/app/services/user/vehicle/vehicle-catalog.service";

import type {
    MarketplaceMake,
    MarketplaceModel,
    MarketplaceGeneration,
    MarketplaceVariant,
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

    const [makes, setMakes] = useState<MarketplaceMake[]>([]);
    const [models, setModels] = useState<MarketplaceModel[]>([]);
    const [generations, setGenerations] = useState<
        MarketplaceGeneration[]
    >([]);
    const [variants, setVariants] = useState<MarketplaceVariant[]>([]);

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
                const data = await getVehicleMakes();

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
    /* Load models                                                            */
    /* ---------------------------------------------------------------------- */

    useEffect(() => {
        let active = true;

        setModels([]);
        setGenerations([]);
        setVariants([]);

        if (!filters.makeId) {
            return () => {
                active = false;
            };
        }

        async function loadModels() {
            setVehicleCatalogError("");

            try {
                const data = await getVehicleModels(
                    filters.makeId,
                );

                if (!active) return;

                setModels(data);
            } catch {
                if (!active) return;

                setVehicleCatalogError(
                    "Unable to load models for the selected make.",
                );
            }
        }

        void loadModels();

        return () => {
            active = false;
        };
    }, [filters.makeId, vehicleCatalogRetryCount]);

    /* ---------------------------------------------------------------------- */
    /* Load generations                                                       */
    /* ---------------------------------------------------------------------- */

    useEffect(() => {
        let active = true;

        setGenerations([]);
        setVariants([]);

        if (!filters.modelId) {
            return () => {
                active = false;
            };
        }

        async function loadGenerations() {
            setVehicleCatalogError("");

            try {
                const data = await getVehicleGenerations(
                    filters.modelId,
                );

                if (!active) return;

                setGenerations(data);
            } catch {
                if (!active) return;

                setVehicleCatalogError(
                    "Unable to load generations for the selected model.",
                );
            }
        }

        void loadGenerations();

        return () => {
            active = false;
        };
    }, [filters.modelId, vehicleCatalogRetryCount]);

    /* ---------------------------------------------------------------------- */
    /* Load variants                                                          */
    /* ---------------------------------------------------------------------- */

    useEffect(() => {
        let active = true;

        setVariants([]);

        if (!filters.generationId) {
            return () => {
                active = false;
            };
        }

        async function loadVariants() {
            setVehicleCatalogError("");

            try {
                const data = await getVehicleVariants(
                    filters.generationId,
                );

                if (!active) return;

                setVariants(data);
            } catch {
                if (!active) return;

                setVehicleCatalogError(
                    "Unable to load variants for the selected generation.",
                );
            }
        }

        void loadVariants();

        return () => {
            active = false;
        };
    }, [filters.generationId, vehicleCatalogRetryCount]);

    /* ---------------------------------------------------------------------- */
    /* Resolve selected vehicle labels                                        */
    /* ---------------------------------------------------------------------- */

    const vehicleLabels: MarketplaceVehicleFilterLabels =
        useMemo(() => {
            const selectedVariant = variants.find(
                (item) => item.id === filters.variantId,
            );

            const variantName = selectedVariant?.name?.trim();
            const variantYear = selectedVariant?.year;

            let variant: string | undefined;

            if (variantName && variantYear) {
                variant = `${variantYear} ${variantName}`;
            } else {
                variant =
                    variantName ||
                    (variantYear
                        ? String(variantYear)
                        : undefined);
            }

            return {
                make: makes.find(
                    (item) => item.id === filters.makeId,
                )?.name,

                model: models.find(
                    (item) => item.id === filters.modelId,
                )?.name,

                generation: generations.find(
                    (item) => item.id === filters.generationId,
                )?.name,

                variant,
            };
        }, [
            makes,
            models,
            generations,
            variants,
            filters.makeId,
            filters.modelId,
            filters.generationId,
            filters.variantId,
        ]);

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

                if (
                    key === "makeId" &&
                    value !== current.makeId
                ) {
                    next.modelId = "";
                    next.generationId = "";
                    next.variantId = "";
                }

                if (
                    key === "modelId" &&
                    value !== current.modelId
                ) {
                    next.generationId = "";
                    next.variantId = "";
                }

                if (
                    key === "generationId" &&
                    value !== current.generationId
                ) {
                    next.variantId = "";
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

                    case "makeId":
                        next.makeId = "";
                        next.modelId = "";
                        next.generationId = "";
                        next.variantId = "";
                        break;

                    case "modelId":
                        next.modelId = "";
                        next.generationId = "";
                        next.variantId = "";
                        break;

                    case "generationId":
                        next.generationId = "";
                        next.variantId = "";
                        break;

                    case "variantId":
                        next.variantId = "";
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

            setPage(1);
            setError("");
            setSubmittedQuery(query.trim());
        },
        [query],
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
                     * Boosted vehicles are fetched separately
                     * and displayed in the Featured Vehicles section.
                     */
                    excludeBoosted: true,
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
        if (!initialized) return;

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

        /**
         * generationId is preserved in the URL for filter restoration,
         * even though the current marketplace search API does not
         * accept generationId as a search parameter.
         */
        if (filters.generationId) {
            params.set(
                "generationId",
                filters.generationId,
            );
        }

        const queryString = params.toString();

        const nextUrl = queryString
            ? `/?${queryString}`
            : "/";

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
        generations,
        variants,
        vehicleLabels,
        vehicleCatalogLoading,
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