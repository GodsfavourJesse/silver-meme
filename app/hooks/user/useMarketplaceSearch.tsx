"use client";

import {
    useCallback,
    useEffect,
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

const MARKETPLACE_PAGE_SIZE = 12;
const FEATURED_PAGE_SIZE = 12;

export function useMarketplaceSearch() {
    const [query, setQuery] = useState("");
    const [submittedQuery, setSubmittedQuery] = useState("");

    const [filters, setFilters] = useState<MarketplaceFilterState>(
        INITIAL_FILTERS,
    );

    const [sort, setSort] = useState<SortOption>("newest");
    const [page, setPage] = useState(1);

    // Ordinary marketplace results
    const [results, setResults] = useState<MarketplaceSearchResult[]>([]);

    const [pagination, setPagination] =
        useState<MarketplacePagination | null>(null);

    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState("");

    const [retryCount, setRetryCount] = useState(0);

    const [initialized, setInitialized] = useState(false);

    // Featured marketplace results
    const [featuredVehicles, setFeaturedVehicles] = useState<
        MarketplaceSearchResult[]
    >([]);

    const [featuredLoading, setFeaturedLoading] = useState(true);
    const [featuredError, setFeaturedError] = useState("");
    const [featuredRetryCount, setFeaturedRetryCount] = useState(0);

    // Prevent multiple Load More requests before React updates state.
    const loadingMoreRef = useRef(false);

    // Vehicle catalog
    const [makes, setMakes] = useState<MarketplaceMake[]>([]);
    const [models, setModels] = useState<MarketplaceModel[]>([]);
    const [generations, setGenerations] = useState<
        MarketplaceGeneration[]
    >([]);
    const [variants, setVariants] = useState<MarketplaceVariant[]>([]);

    const [vehicleCatalogLoading, setVehicleCatalogLoading] =
        useState(false);

    const [vehicleCatalogError, setVehicleCatalogError] = useState("");

    /*
    |--------------------------------------------------------------------------
    | Restore search and filter state from homepage URL
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        const initialState = readFiltersFromUrl();

        setQuery(initialState.query);
        setSubmittedQuery(initialState.query);
        setFilters(initialState.filters);
        setSort(initialState.sort);
        setPage(1);

        setInitialized(true);
    }, []);

    /*
    |--------------------------------------------------------------------------
    | Load featured vehicles
    |--------------------------------------------------------------------------
    |
    | Featured vehicles are fetched independently.
    | The backend returns only listings with currently active boosts.
    |
    */

    useEffect(() => {
        let active = true;

        async function loadFeaturedVehicles() {
            setFeaturedLoading(true);
            setFeaturedError("");

            try {
                const response = await getFeaturedMarketplaceListings({
                    page: 1,
                    limit: FEATURED_PAGE_SIZE,
                });

                if (!active) {
                    return;
                }

                setFeaturedVehicles(response.data.listings);
            } catch {
                if (!active) {
                    return;
                }

                setFeaturedVehicles([]);

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

    /*
    |--------------------------------------------------------------------------
    | Load vehicle makes
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        let active = true;

        async function loadMakes() {
            setVehicleCatalogLoading(true);
            setVehicleCatalogError("");

            try {
                const data = await getVehicleMakes();

                if (active) {
                    setMakes(data);
                }
            } catch {
                if (active) {
                    setVehicleCatalogError(
                        "Unable to load vehicle makes. Please try again.",
                    );
                }
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
    }, []);

    /*
    |--------------------------------------------------------------------------
    | Load models when selected make changes
    |--------------------------------------------------------------------------
    */

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
            try {
                const data = await getVehicleModels(filters.makeId);

                if (active) {
                    setModels(data);
                }
            } catch {
                if (active) {
                    setVehicleCatalogError(
                        "Unable to load models for the selected make.",
                    );
                }
            }
        }

        void loadModels();

        return () => {
            active = false;
        };
    }, [filters.makeId]);

    /*
    |--------------------------------------------------------------------------
    | Load generations when selected model changes
    |--------------------------------------------------------------------------
    */

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
            try {
                const data = await getVehicleGenerations(filters.modelId);

                if (active) {
                    setGenerations(data);
                }
            } catch {
                if (active) {
                    setVehicleCatalogError(
                        "Unable to load generations for the selected model.",
                    );
                }
            }
        }

        void loadGenerations();

        return () => {
            active = false;
        };
    }, [filters.modelId]);

    /*
    |--------------------------------------------------------------------------
    | Load variants when selected generation changes
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        let active = true;

        setVariants([]);

        if (!filters.generationId) {
            return () => {
                active = false;
            };
        }

        async function loadVariants() {
            try {
                const data = await getVehicleVariants(
                    filters.generationId,
                );

                if (active) {
                    setVariants(data);
                }
            } catch {
                if (active) {
                    setVehicleCatalogError(
                        "Unable to load variants for the selected generation.",
                    );
                }
            }
        }

        void loadVariants();

        return () => {
            active = false;
        };
    }, [filters.generationId]);

    /*
    |--------------------------------------------------------------------------
    | Resolve vehicle IDs into readable labels
    |--------------------------------------------------------------------------
    */

    const vehicleLabels: MarketplaceVehicleFilterLabels = {
        make: makes.find(
            (item) => item.id === filters.makeId,
        )?.name,

        model: models.find(
            (item) => item.id === filters.modelId,
        )?.name,

        generation: generations.find(
            (item) => item.id === filters.generationId,
        )?.name,

        variant: (() => {
            const selectedVariant = variants.find(
                (item) => item.id === filters.variantId,
            );

            if (!selectedVariant) {
                return undefined;
            }

            const name = selectedVariant.name?.trim();
            const year = selectedVariant.year;

            if (name && year) {
                return `${year} ${name}`;
            }

            return name || (year ? String(year) : undefined);
        })(),
    };

    /*
    |--------------------------------------------------------------------------
    | Update an individual filter
    |--------------------------------------------------------------------------
    */

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

                if (key === "makeId" && value !== current.makeId) {
                    next.modelId = "";
                    next.generationId = "";
                    next.variantId = "";
                }

                if (key === "modelId" && value !== current.modelId) {
                    next.generationId = "";
                    next.variantId = "";
                }

                if (
                    key === "generationId"
                    && value !== current.generationId
                ) {
                    next.variantId = "";
                }

                return next;
            });

            loadingMoreRef.current = false;
            setPage(1);
        },
        [],
    );

    /*
    |--------------------------------------------------------------------------
    | Remove an individual filter
    |--------------------------------------------------------------------------
    */

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
        },
        [],
    );

    /*
    |--------------------------------------------------------------------------
    | Submit keyword search
    |--------------------------------------------------------------------------
    */

    const handleSearch = useCallback(
        (event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();

            loadingMoreRef.current = false;

            setPage(1);
            setSubmittedQuery(query.trim());
        },
        [query],
    );

    /*
    |--------------------------------------------------------------------------
    | Clear search and filters
    |--------------------------------------------------------------------------
    */

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

    /*
    |--------------------------------------------------------------------------
    | Change sorting
    |--------------------------------------------------------------------------
    */

    const handleSortChange = useCallback(
        (nextSort: SortOption) => {
            loadingMoreRef.current = false;

            setSort(nextSort);
            setPage(1);
        },
        [],
    );

    /*
    |--------------------------------------------------------------------------
    | Retry ordinary marketplace request
    |--------------------------------------------------------------------------
    */

    const retry = useCallback(() => {
        setRetryCount((count) => count + 1);
    }, []);

    /*
    |--------------------------------------------------------------------------
    | Retry featured vehicles request
    |--------------------------------------------------------------------------
    */

    const retryFeatured = useCallback(() => {
        setFeaturedRetryCount((count) => count + 1);
    }, []);

    /*
    |--------------------------------------------------------------------------
    | Retry vehicle catalog
    |--------------------------------------------------------------------------
    */

    const retryVehicleCatalog = useCallback(async () => {
        setVehicleCatalogLoading(true);
        setVehicleCatalogError("");

        try {
            const data = await getVehicleMakes();

            setMakes(data);
        } catch {
            setVehicleCatalogError(
                "Unable to load vehicle makes. Please try again.",
            );
        } finally {
            setVehicleCatalogLoading(false);
        }
    }, []);

    /*
    |--------------------------------------------------------------------------
    | Load more listings
    |--------------------------------------------------------------------------
    */

    const loadMore = useCallback(() => {
        if (
            loading
            || loadingMoreRef.current
            || !pagination?.hasNextPage
            || error
        ) {
            return;
        }

        loadingMoreRef.current = true;

        setPage((current) => current + 1);
    }, [loading, pagination, error]);

    /*
    |--------------------------------------------------------------------------
    | Fetch marketplace listings
    |--------------------------------------------------------------------------
    |
    | Page 1 replaces the current result set.
    | Subsequent pages append to the existing result set.
    |
    | excludeBoosted: true ensures actively boosted listings
    | are displayed only in the Featured Vehicles section.
    |
    */

    useEffect(() => {
        if (!initialized) {
            return;
        }

        let active = true;

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
                    excludeBoosted: true,
                });

                if (!active) {
                    return;
                }

                const incomingListings = response.data.listings;

                if (page === 1) {
                    setResults(incomingListings);
                } else {
                    setResults((current) => {
                        const existingIds = new Set(
                            current.map(
                                (item) => item.listing.id,
                            ),
                        );

                        const uniqueListings = incomingListings.filter(
                            (item) => !existingIds.has(item.listing.id),
                        );

                        return [
                            ...current,
                            ...uniqueListings,
                        ];
                    });
                }

                setPagination(response.data.pagination);
            } catch {
                if (!active) {
                    return;
                }

                if (page === 1) {
                    setResults([]);
                    setPagination(null);
                }

                setError(
                    "We couldn't load vehicle listings. Please check your connection and try again.",
                );
            } finally {
                if (active) {
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

    /*
    |--------------------------------------------------------------------------
    | Synchronize search state with homepage URL
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        if (!initialized) {
            return;
        }

        const searchParams = buildSearchParams(
            submittedQuery,
            filters,
            sort,
            page,
        );

        const params = new URLSearchParams();

        for (const [key, value] of Object.entries(searchParams)) {
            if (
                value === undefined
                || value === null
                || value === ""
                || value === false
            ) {
                continue;
            }

            params.set(key, String(value));
        }

        /*
         * Preserve generationId even though the current
         * marketplace search API does not accept it.
         */
        if (filters.generationId) {
            params.set("generationId", filters.generationId);
        }

        const queryString = params.toString();

        const nextUrl = queryString
            ? `/?${queryString}`
            : "/";

        const currentUrl =
            `${window.location.pathname}${window.location.search}`;

        if (currentUrl !== nextUrl) {
            window.history.replaceState(null, "", nextUrl);
        }
    }, [
        initialized,
        submittedQuery,
        filters,
        sort,
        page,
    ]);

    /*
    |--------------------------------------------------------------------------
    | Return marketplace state and actions
    |--------------------------------------------------------------------------
    */

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

        // Featured vehicles
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