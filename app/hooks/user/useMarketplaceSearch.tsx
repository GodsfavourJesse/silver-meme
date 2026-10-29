"use client";

import {
    useCallback,
    useEffect,
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

import { searchMarketplace } from "@/app/services/user/marketplace/marketplace.service";

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

export function useMarketplaceSearch() {
    const [query, setQuery] = useState("");
    const [submittedQuery, setSubmittedQuery] = useState("");

    const [filters, setFilters] =
        useState<MarketplaceFilterState>(INITIAL_FILTERS);

    const [sort, setSort] = useState<SortOption>("newest");
    const [page, setPage] = useState(1);

    const [results, setResults] = useState<MarketplaceSearchResult[]>([]);

    const [pagination, setPagination] =
        useState<MarketplacePagination | null>(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [retryCount, setRetryCount] = useState(0);
    const [initialized, setInitialized] = useState(false);

    /*
     * Shared vehicle catalog.
     *
     * Both desktop and mobile can now access the same catalog
     * data without issuing duplicate requests.
     */
    const [makes, setMakes] = useState<MarketplaceMake[]>([]);
    const [models, setModels] = useState<MarketplaceModel[]>([]);
    const [generations, setGenerations] =
        useState<MarketplaceGeneration[]>([]);
    const [variants, setVariants] = useState<MarketplaceVariant[]>([]);

    const [vehicleCatalogLoading, setVehicleCatalogLoading] =
        useState(false);
    const [vehicleCatalogError, setVehicleCatalogError] = useState("");

    /*
     * Restore the URL state before searching or synchronizing the URL.
     */
    useEffect(() => {
        const initialState = readFiltersFromUrl();

        setQuery(initialState.query);
        setSubmittedQuery(initialState.query);
        setFilters(initialState.filters);
        setSort(initialState.sort);
        setPage(initialState.page);

        setInitialized(true);
    }, []);

    /*
     * Load makes once for the shared marketplace.
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
     * Load models whenever the selected make changes.
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
     * Load generations whenever the selected model changes.
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
     * Load variants whenever the selected generation changes.
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
                const data = await getVehicleVariants(filters.generationId);

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
     * Resolve selected IDs into human-readable vehicle names.
     */
    const vehicleLabels: MarketplaceVehicleFilterLabels = {
        make: makes.find((item) => item.id === filters.makeId)?.name,
        model: models.find((item) => item.id === filters.modelId)?.name,
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
     * Update one filter while preserving the others.
     *
     * Vehicle catalog selections reset their dependent fields
     * to prevent invalid combinations.
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
                    key === "generationId" &&
                    value !== current.generationId
                ) {
                    next.variantId = "";
                }

                return next;
            });

            setPage(1);
        },
        [],
    );

    /*
     * Remove a filter, including complete ranges when applicable.
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

            setPage(1);
        },
        [],
    );

    /*
     * Submit a keyword search.
     */
    const handleSearch = useCallback(
        (event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();

            setPage(1);
            setSubmittedQuery(query.trim());
        },
        [query],
    );

    /*
     * Clear all filters and search terms.
     */
    const clearFilters = useCallback(() => {
        setFilters({ ...INITIAL_FILTERS });
        setQuery("");
        setSubmittedQuery("");
        setSort("newest");
        setPage(1);
        setVehicleCatalogError("");
    }, []);

    /*
     * Change sort order.
     */
    const handleSortChange = useCallback((nextSort: SortOption) => {
        setSort(nextSort);
        setPage(1);
    }, []);

    /*
     * Retry a failed marketplace request.
     */
    const retry = useCallback(() => {
        setRetryCount((count) => count + 1);
    }, []);

    /*
     * Retry loading vehicle makes.
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
     * Fetch listings after the initial URL state is restored.
     */
    useEffect(() => {
        if (!initialized) {
            return;
        }

        let active = true;

        async function loadListings() {
            setLoading(true);
            setError("");

            try {
                const params = buildSearchParams(
                    submittedQuery,
                    filters,
                    sort,
                    page,
                );

                const response = await searchMarketplace(params);

                if (!active) {
                    return;
                }

                setResults(response.data.listings);
                setPagination(response.data.pagination);
            } catch {
                if (!active) {
                    return;
                }

                setResults([]);
                setPagination(null);

                setError(
                    "We couldn't load vehicle listings. Please check your connection and try again.",
                );
            } finally {
                if (active) {
                    setLoading(false);
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
     * Synchronize the URL after initialization.
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
                value === undefined ||
                value === null ||
                value === "" ||
                value === false
            ) {
                continue;
            }

            params.set(key, String(value));
        }

        /*
         * Preserve generationId in the URL even though the
         * current marketplace search API doesn't accept it.
         */
        if (filters.generationId) {
            params.set("generationId", filters.generationId);
        }

        const queryString = params.toString();

        const nextUrl = queryString
            ? `/marketplace?${queryString}`
            : "/marketplace";

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

        // Sorting and pagination
        sort,
        handleSortChange,
        page,
        setPage,

        // Results
        results,
        pagination,
        loading,
        error,

        // Retry
        retry,
    };
}