"use client";

import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import {
    AlertCircle,
    CarFront,
    Check,
    LoaderCircle,
    RotateCcw,
    Search,
} from "lucide-react";

import {
    getVehicleGenerations,
    getVehicleMakes,
    getVehicleModels,
    getVehicleModelYears,
    getVehicleVariants,
    searchVehicleCatalog,
} from "@/app/services/user/listings/vehicle-catalog.service";

import {
    VehicleCatalogSelect,
} from "./VehicleCatalogSelect";

import type {
    VehicleSelectOption,
} from "./VehicleCatalogSelect";

import type {
    VehicleGenerationOption,
    VehicleMakeOption,
    VehicleModelOption,
    VehicleSearchResult,
    VehicleVariantOption,
} from "@/app/types/user/listings/listing-form.types";

import type {
    VehicleModelYearOption,
} from "@/app/services/user/listings/vehicle-catalog.service";

interface VehicleSelectionFieldsProps {
    value: string;
    onChange: (vehicleVariantId: string) => void;
    disabled?: boolean;
    error?: string;
}

interface RequestState {
    loading: boolean;
    error: string | null;
}

const INITIAL_REQUEST_STATE: RequestState = {
    loading: false,
    error: null,
};

function getErrorMessage(
    error: unknown,
): string {
    if (error instanceof Error) {
        return error.message;
    }

    return "Something went wrong. Please try again.";
}

function formatYearRange(
    generation: VehicleGenerationOption,
): string {
    const {
        startYear,
        endYear,
        name,
    } = generation;

    if (startYear && endYear) {
        return `${startYear}–${endYear}`;
    }

    if (startYear) {
        return `${startYear} onwards`;
    }

    return name;
}

function getVariantEngineName(
    variant: VehicleVariantOption,
): string | null {
    return (
        variant.engine?.name ??
        variant.engineName ??
        null
    );
}

function getVariantDescription(
    variant: VehicleVariantOption,
): string {
    return [
        getVariantEngineName(variant),
        variant.fuelType,
        variant.transmission,
        variant.driveType,
        variant.bodyStyle,
    ]
        .filter(
            (item): item is string =>
                Boolean(item),
        )
        .join(" · ");
}

function getSearchResultLabel(
    result: VehicleSearchResult,
): string {
    return [
        result.makeName,
        result.modelName,
        result.generationName,
        result.year,
        result.variantName,
    ]
        .filter(
            (item) =>
                item !== null &&
                item !== undefined &&
                item !== "",
        )
        .join(" ");
}

function getSearchResultDetails(
    result: VehicleSearchResult,
): string {
    return [
        result.engineName ??
            result.legacyEngineName,
        result.fuelType,
        result.transmission,
        result.bodyStyle,
    ]
        .filter(
            (item): item is string =>
                Boolean(item),
        )
        .join(" · ");
}

export function VehicleSelectionFields({
    value,
    onChange,
    disabled = false,
    error,
}: VehicleSelectionFieldsProps) {
    /*
     * =========================================================
     * CATALOG DATA
     * =========================================================
     */

    const [makes, setMakes] =
        useState<VehicleMakeOption[]>([]);

    const [models, setModels] =
        useState<VehicleModelOption[]>([]);

    const [generations, setGenerations] =
        useState<VehicleGenerationOption[]>([]);

    const [modelYears, setModelYears] =
        useState<VehicleModelYearOption[]>([]);

    const [variants, setVariants] =
        useState<VehicleVariantOption[]>([]);

    const [searchResults, setSearchResults] =
        useState<VehicleSearchResult[]>([]);

    /*
     * =========================================================
     * SELECTED VALUES
     * =========================================================
     */

    const [selectedMakeId, setSelectedMakeId] =
        useState("");

    const [selectedModelId, setSelectedModelId] =
        useState("");

    const [
        selectedGenerationId,
        setSelectedGenerationId,
    ] = useState("");

    const [selectedYear, setSelectedYear] =
        useState("");

    const [selectedVariant, setSelectedVariant] =
        useState<VehicleVariantOption | null>(
            null,
        );

    const [searchSelection, setSearchSelection] =
        useState<VehicleSearchResult | null>(
            null,
        );

    /*
     * =========================================================
     * SEARCH
     * =========================================================
     */

    const [searchQuery, setSearchQuery] =
        useState("");

    const [showAllMakes, setShowAllMakes] =
        useState(false);

    /*
     * Nigerian-market filtering.
     */
    const [catalogMarket, setCatalogMarket] =
        useState(true);

    /*
     * =========================================================
     * REQUEST STATES
     * =========================================================
     */

    const [makesRequest, setMakesRequest] =
        useState<RequestState>(
            INITIAL_REQUEST_STATE,
        );

    const [modelsRequest, setModelsRequest] =
        useState<RequestState>(
            INITIAL_REQUEST_STATE,
        );

    const [
        generationsRequest,
        setGenerationsRequest,
    ] = useState<RequestState>(
        INITIAL_REQUEST_STATE,
    );

    const [yearsRequest, setYearsRequest] =
        useState<RequestState>(
            INITIAL_REQUEST_STATE,
        );

    const [variantsRequest, setVariantsRequest] =
        useState<RequestState>(
            INITIAL_REQUEST_STATE,
        );

    const [searchRequest, setSearchRequest] =
        useState<RequestState>(
            INITIAL_REQUEST_STATE,
        );

    const [catalogError, setCatalogError] =
        useState<string | null>(null);

    /*
     * =========================================================
     * RETRY COUNTERS
     * =========================================================
     */

    const [makeReloadKey, setMakeReloadKey] =
        useState(0);

    const [modelReloadKey, setModelReloadKey] =
        useState(0);

    const [
        generationReloadKey,
        setGenerationReloadKey,
    ] = useState(0);

    const [yearReloadKey, setYearReloadKey] =
        useState(0);

    const [variantReloadKey, setVariantReloadKey] =
        useState(0);

    /*
     * Request counters prevent older searches from
     * overwriting the latest search results.
     */
    const searchRequestId = useRef(0);

    /*
     * =========================================================
     * LOAD MAKES
     * =========================================================
     */

    useEffect(() => {
        let active = true;

        async function loadMakes(): Promise<void> {
            setMakesRequest({
                loading: true,
                error: null,
            });

            try {
                let result =
                    await getVehicleMakes(true);

                /*
                 * Fall back to the complete catalog only
                 * if the Nigerian-market catalog is empty.
                 */
                if (result.length === 0) {
                    result =
                        await getVehicleMakes(false);
                }

                if (!active) {
                    return;
                }

                setMakes(result);

                setMakesRequest({
                    loading: false,
                    error:
                        result.length === 0
                            ? "No active vehicle makes are available."
                            : null,
                });
            } catch (requestError) {
                if (!active) {
                    return;
                }

                setMakes([]);

                setMakesRequest({
                    loading: false,
                    error: getErrorMessage(
                        requestError,
                    ),
                });
            }
        }

        void loadMakes();

        return () => {
            active = false;
        };
    }, [makeReloadKey]);

    /*
     * =========================================================
     * LOAD MODELS
     * =========================================================
     */

    useEffect(() => {
        let active = true;

        setModels([]);
        setGenerations([]);
        setModelYears([]);
        setVariants([]);

        setSelectedModelId("");
        setSelectedGenerationId("");
        setSelectedYear("");

        setModelsRequest(
            INITIAL_REQUEST_STATE,
        );

        setGenerationsRequest(
            INITIAL_REQUEST_STATE,
        );

        setYearsRequest(
            INITIAL_REQUEST_STATE,
        );

        setVariantsRequest(
            INITIAL_REQUEST_STATE,
        );

        if (!selectedMakeId) {
            return () => {
                active = false;
            };
        }

        async function loadModels(): Promise<void> {
            setModelsRequest({
                loading: true,
                error: null,
            });

            try {
                const result =
                    await getVehicleModels(
                        selectedMakeId,
                        catalogMarket,
                    );

                if (!active) {
                    return;
                }

                setModels(result);

                setModelsRequest({
                    loading: false,
                    error:
                        result.length === 0
                            ? "No models are available for this make."
                            : null,
                });
            } catch (requestError) {
                if (!active) {
                    return;
                }

                setModels([]);

                setModelsRequest({
                    loading: false,
                    error: getErrorMessage(
                        requestError,
                    ),
                });
            }
        }

        void loadModels();

        return () => {
            active = false;
        };
    }, [
        selectedMakeId,
        catalogMarket,
        modelReloadKey,
    ]);

    /*
     * =========================================================
     * LOAD GENERATIONS
     * =========================================================
     */

    useEffect(() => {
        let active = true;

        setGenerations([]);
        setModelYears([]);
        setVariants([]);

        setSelectedGenerationId("");
        setSelectedYear("");

        setGenerationsRequest(
            INITIAL_REQUEST_STATE,
        );

        setYearsRequest(
            INITIAL_REQUEST_STATE,
        );

        setVariantsRequest(
            INITIAL_REQUEST_STATE,
        );

        if (!selectedModelId) {
            return () => {
                active = false;
            };
        }

        async function loadGenerations(): Promise<void> {
            setGenerationsRequest({
                loading: true,
                error: null,
            });

            try {
                const result =
                    await getVehicleGenerations(
                        selectedModelId,
                        catalogMarket,
                    );

                if (!active) {
                    return;
                }

                setGenerations(result);

                setGenerationsRequest({
                    loading: false,
                    error:
                        result.length === 0
                            ? "No generations are available for this model."
                            : null,
                });
            } catch (requestError) {
                if (!active) {
                    return;
                }

                setGenerations([]);

                setGenerationsRequest({
                    loading: false,
                    error: getErrorMessage(
                        requestError,
                    ),
                });
            }
        }

        void loadGenerations();

        return () => {
            active = false;
        };
    }, [
        selectedModelId,
        catalogMarket,
        generationReloadKey,
    ]);

    /*
     * =========================================================
     * LOAD MODEL YEARS
     * =========================================================
     *
     * Years are loaded from the model-year endpoint.
     * They are NOT derived from the variants array.
     */

    useEffect(() => {
        let active = true;

        setModelYears([]);
        setVariants([]);
        setSelectedYear("");

        setYearsRequest(
            INITIAL_REQUEST_STATE,
        );

        setVariantsRequest(
            INITIAL_REQUEST_STATE,
        );

        if (!selectedGenerationId) {
            return () => {
                active = false;
            };
        }

        async function loadYears(): Promise<void> {
            setYearsRequest({
                loading: true,
                error: null,
            });

            try {
                const result =
                    await getVehicleModelYears(
                        selectedGenerationId,
                        catalogMarket,
                    );

                if (!active) {
                    return;
                }

                const sortedYears = [...result].sort(
                    (a, b) => b.year - a.year,
                );

                setModelYears(sortedYears);

                setYearsRequest({
                    loading: false,
                    error:
                        sortedYears.length === 0
                            ? "No model years are available for this generation."
                            : null,
                });
            } catch (requestError) {
                if (!active) {
                    return;
                }

                setModelYears([]);

                setYearsRequest({
                    loading: false,
                    error: getErrorMessage(
                        requestError,
                    ),
                });
            }
        }

        void loadYears();

        return () => {
            active = false;
        };
    }, [
        selectedGenerationId,
        catalogMarket,
        yearReloadKey,
    ]);

    /*
     * =========================================================
     * LOAD VARIANTS
     * =========================================================
     *
     * Only request variants after the user selects a year.
     * This prevents the dropdown from mixing variants
     * belonging to different model years.
     */

    useEffect(() => {
        let active = true;

        setVariants([]);
        setSelectedVariant(null);

        setVariantsRequest(
            INITIAL_REQUEST_STATE,
        );

        if (
            !selectedGenerationId ||
            !selectedYear
        ) {
            return () => {
                active = false;
            };
        }

        async function loadVariants(): Promise<void> {
            setVariantsRequest({
                loading: true,
                error: null,
            });

            try {
                const result =
                    await getVehicleVariants(
                        selectedGenerationId,
                        {
                            market: catalogMarket,
                            year: Number(selectedYear),
                        },
                    );

                if (!active) {
                    return;
                }

                setVariants(result);

                setVariantsRequest({
                    loading: false,
                    error:
                        result.length === 0
                            ? "No variants are available for this model year."
                            : null,
                });
            } catch (requestError) {
                if (!active) {
                    return;
                }

                setVariants([]);

                setVariantsRequest({
                    loading: false,
                    error: getErrorMessage(
                        requestError,
                    ),
                });
            }
        }

        void loadVariants();

        return () => {
            active = false;
        };
    }, [
        selectedGenerationId,
        selectedYear,
        catalogMarket,
        variantReloadKey,
    ]);

    /*
     * =========================================================
     * SEARCH VEHICLES
     * =========================================================
     */

    useEffect(() => {
        const query = searchQuery.trim();

        const requestId =
            ++searchRequestId.current;

        if (
            query.length < 2 ||
            query === "/" ||
            showAllMakes
        ) {
            setSearchResults([]);

            setSearchRequest(
                INITIAL_REQUEST_STATE,
            );

            return;
        }

        let active = true;

        const timeoutId = window.setTimeout(
            async () => {
                setSearchRequest({
                    loading: true,
                    error: null,
                });

                try {
                    const result =
                        await searchVehicleCatalog(
                            query,
                            {
                                market: catalogMarket,
                                limit: 20,
                            },
                        );

                    if (
                        !active ||
                        requestId !==
                            searchRequestId.current
                    ) {
                        return;
                    }

                    setSearchResults(result);

                    setSearchRequest({
                        loading: false,
                        error: null,
                    });
                } catch (requestError) {
                    if (
                        !active ||
                        requestId !==
                            searchRequestId.current
                    ) {
                        return;
                    }

                    setSearchResults([]);

                    setSearchRequest({
                        loading: false,
                        error: getErrorMessage(
                            requestError,
                        ),
                    });
                }
            },
            350,
        );

        return () => {
            active = false;

            window.clearTimeout(timeoutId);
        };
    }, [
        searchQuery,
        catalogMarket,
        showAllMakes,
    ]);

    /*
     * =========================================================
     * DERIVED OPTIONS
     * =========================================================
     */

    const generationOptions =
        useMemo<VehicleSelectOption[]>(
            () =>
                generations.map((generation) => ({
                    id: generation.id,
                    label: generation.name,
                    description:
                        formatYearRange(generation),
                })),
            [generations],
        );

    const yearOptions =
        useMemo<VehicleSelectOption[]>(
            () =>
                modelYears.map((modelYear) => ({
                    id: String(modelYear.year),
                    label: String(modelYear.year),
                })),
            [modelYears],
        );

    const variantOptions =
        useMemo<VehicleSelectOption[]>(
            () =>
                variants.map((variant) => ({
                    id: variant.id,
                    label: variant.name,
                    description:
                        getVariantDescription(
                            variant,
                        ),
                })),
            [variants],
        );

    /*
     * =========================================================
     * RESET SELECTION
     * =========================================================
     */

    const resetSelection = useCallback(() => {
        setSelectedMakeId("");
        setSelectedModelId("");
        setSelectedGenerationId("");
        setSelectedYear("");

        setSelectedVariant(null);
        setSearchSelection(null);

        setSearchQuery("");
        setSearchResults([]);

        setShowAllMakes(false);
        setCatalogMarket(true);

        setModels([]);
        setGenerations([]);
        setModelYears([]);
        setVariants([]);

        setCatalogError(null);

        setModelsRequest(
            INITIAL_REQUEST_STATE,
        );

        setGenerationsRequest(
            INITIAL_REQUEST_STATE,
        );

        setYearsRequest(
            INITIAL_REQUEST_STATE,
        );

        setVariantsRequest(
            INITIAL_REQUEST_STATE,
        );

        setSearchRequest(
            INITIAL_REQUEST_STATE,
        );

        onChange("");
    }, [onChange]);

    /*
     * =========================================================
     * OPEN ALL MAKES
     * =========================================================
     */

    const openAllMakes = useCallback(async () => {
        setShowAllMakes(true);
        setCatalogMarket(false);

        setSearchResults([]);
        setSearchSelection(null);

        setSearchRequest(
            INITIAL_REQUEST_STATE,
        );

        setMakesRequest({
            loading: true,
            error: null,
        });

        try {
            const result =
                await getVehicleMakes(false);

            setMakes(result);

            setMakesRequest({
                loading: false,
                error:
                    result.length === 0
                        ? "No active vehicle makes were found."
                        : null,
            });
        } catch (requestError) {
            setMakesRequest({
                loading: false,
                error: getErrorMessage(
                    requestError,
                ),
            });
        }
    }, []);

    /*
     * =========================================================
     * SELECT MAKE
     * =========================================================
     */

    const selectMake = useCallback(
        (makeId: string) => {
            setSelectedMakeId(makeId);

            setSelectedModelId("");
            setSelectedGenerationId("");
            setSelectedYear("");

            setSelectedVariant(null);
            setSearchSelection(null);

            setSearchQuery("");
            setSearchResults([]);

            setCatalogError(null);

            setShowAllMakes(false);
            setCatalogMarket(true);

            onChange("");
        },
        [onChange],
    );

    /*
     * =========================================================
     * SELECT SEARCH RESULT
     * =========================================================
     */

    const selectSearchResult = useCallback(
        (result: VehicleSearchResult) => {
            setSearchSelection(result);

            setSelectedMakeId("");
            setSelectedModelId("");
            setSelectedGenerationId("");
            setSelectedYear("");

            setSelectedVariant(null);

            setShowAllMakes(false);

            setSearchQuery(
                getSearchResultLabel(result),
            );

            setSearchResults([]);

            setCatalogError(null);

            onChange(result.variantId);
        },
        [onChange],
    );

    /*
     * =========================================================
     * SELECT VARIANT
     * =========================================================
     */

    const selectVariant = useCallback(
        (variantId: string) => {
            const variant =
                variants.find(
                    (item) =>
                        item.id === variantId,
                ) ?? null;

            setSelectedVariant(variant);
            setSearchSelection(null);

            setCatalogError(null);

            onChange(variantId);
        },
        [onChange, variants],
    );

    /*
     * =========================================================
     * RETRY REQUEST
     * =========================================================
     */

    const retryCatalog = useCallback(() => {
        setCatalogError(null);

        if (searchRequest.error) {
            setSearchQuery((current) => {
                const query = current.trim();

                return query;
            });

            /*
             * Force a new search request without requiring
             * the user to modify the search text.
             */
            setSearchResults([]);

            setSearchRequest({
                loading: true,
                error: null,
            });

            const query = searchQuery.trim();

            if (query.length >= 2) {
                void searchVehicleCatalog(
                    query,
                    {
                        market: catalogMarket,
                        limit: 20,
                    },
                )
                    .then((result) => {
                        setSearchResults(result);

                        setSearchRequest({
                            loading: false,
                            error: null,
                        });
                    })
                    .catch((requestError: unknown) => {
                        setSearchRequest({
                            loading: false,
                            error: getErrorMessage(
                                requestError,
                            ),
                        });
                    });
            }

            return;
        }

        if (makesRequest.error) {
            setMakeReloadKey(
                (current) => current + 1,
            );

            return;
        }

        if (modelsRequest.error) {
            setModelReloadKey(
                (current) => current + 1,
            );

            return;
        }

        if (generationsRequest.error) {
            setGenerationReloadKey(
                (current) => current + 1,
            );

            return;
        }

        if (yearsRequest.error) {
            setYearReloadKey(
                (current) => current + 1,
            );

            return;
        }

        if (variantsRequest.error) {
            setVariantReloadKey(
                (current) => current + 1,
            );

            return;
        }

        setMakeReloadKey(
            (current) => current + 1,
        );
    }, [
        catalogMarket,
        generationsRequest.error,
        makesRequest.error,
        modelsRequest.error,
        searchQuery,
        searchRequest.error,
        variantsRequest.error,
        yearsRequest.error,
    ]);

    /*
     * =========================================================
     * RENDER
     * =========================================================
     */

    const hasSelectedVehicle = Boolean(value);

    return (
        <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
            {/* Header */}

            <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#7008E7]/10 bg-[#7008E7]/[0.07]">
                    <CarFront
                        size={21}
                        className="text-[#7008E7]"
                    />
                </div>

                <div className="min-w-0 flex-1">
                    <h2 className="text-base font-semibold text-slate-900">
                        Vehicle details
                    </h2>

                    <p className="mt-1 text-sm leading-6 text-slate-500">
                        Select your vehicle or search
                        the catalog for its exact variant.
                    </p>
                </div>

                {hasSelectedVehicle && (
                    <button
                        type="button"
                        disabled={disabled}
                        onClick={resetSelection}
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-2 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:opacity-40"
                    >
                        <RotateCcw size={13} />
                        Reset
                    </button>
                )}
            </div>

            {/* General catalog error */}

            {catalogError && (
                <div
                    role="alert"
                    className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4"
                >
                    <AlertCircle
                        size={18}
                        className="mt-0.5 shrink-0 text-amber-600"
                    />

                    <div className="min-w-0 flex-1">
                        <p className="text-sm text-amber-900">
                            {catalogError}
                        </p>

                        <button
                            type="button"
                            disabled={disabled}
                            onClick={retryCatalog}
                            className="mt-2 text-xs font-semibold text-[#7008E7] disabled:opacity-50"
                        >
                            Try again
                        </button>
                    </div>
                </div>
            )}

            {/* Search */}

            <div className="space-y-2">
                <label
                    htmlFor="vehicle-catalog-search"
                    className="block text-sm font-medium text-slate-700"
                >
                    Search vehicle catalog
                </label>

                <div className="relative">
                    <Search
                        size={18}
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                        id="vehicle-catalog-search"
                        type="search"
                        value={searchQuery}
                        disabled={disabled}
                        onChange={(event) => {
                            const nextValue =
                                event.target.value;

                            setSearchQuery(nextValue);

                            setSearchSelection(null);
                            setCatalogError(null);

                            if (
                                nextValue.trim() === "/"
                            ) {
                                void openAllMakes();
                                return;
                            }

                            setShowAllMakes(false);
                        }}
                        placeholder="Search make, model, year or variant"
                        autoComplete="off"
                        className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-11 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-[#7008E7]/60 focus:ring-2 focus:ring-[#7008E7]/10 disabled:opacity-50"
                    />

                    {searchRequest.loading && (
                        <LoaderCircle
                            size={17}
                            className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-[#7008E7]"
                        />
                    )}
                </div>

                <p className="text-xs text-slate-500">
                    Search by make, model, generation,
                    year or vehicle variant. Enter / to
                    browse all active makes.
                </p>

                {searchRequest.error && (
                    <div className="space-y-2">
                        <p
                            role="alert"
                            className="text-xs text-red-600"
                        >
                            {searchRequest.error}
                        </p>

                        <button
                            type="button"
                            disabled={disabled}
                            onClick={retryCatalog}
                            className="text-xs font-medium text-[#7008E7] hover:underline"
                        >
                            Retry search
                        </button>
                    </div>
                )}

                {/* All makes */}

                {showAllMakes && (
                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                            <div>
                                <p className="text-sm font-semibold text-slate-900">
                                    All active vehicle makes
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                    {makes.length} makes available
                                </p>
                            </div>

                            {makesRequest.loading && (
                                <LoaderCircle
                                    size={17}
                                    className="animate-spin text-[#7008E7]"
                                />
                            )}
                        </div>

                        {makesRequest.error && (
                            <div className="p-4">
                                <p
                                    role="alert"
                                    className="text-sm text-red-600"
                                >
                                    {makesRequest.error}
                                </p>

                                <button
                                    type="button"
                                    disabled={disabled}
                                    onClick={() => {
                                        void openAllMakes();
                                    }}
                                    className="mt-3 text-sm font-medium text-[#7008E7] hover:underline disabled:opacity-50"
                                >
                                    Try again
                                </button>
                            </div>
                        )}

                        {!makesRequest.loading &&
                            !makesRequest.error &&
                            makes.length === 0 && (
                                <p className="p-4 text-sm text-slate-500">
                                    No active vehicle makes found.
                                </p>
                            )}

                        {!makesRequest.error &&
                            makes.length > 0 && (
                                <div className="max-h-72 overflow-y-auto">
                                    {makes.map((make) => (
                                        <button
                                            key={make.id}
                                            type="button"
                                            disabled={disabled}
                                            onClick={() => {
                                                setCatalogMarket(
                                                    false,
                                                );

                                                setShowAllMakes(
                                                    false,
                                                );

                                                setSearchQuery(
                                                    "",
                                                );

                                                setSearchResults(
                                                    [],
                                                );

                                                setSelectedMakeId(
                                                    make.id,
                                                );

                                                setSelectedModelId(
                                                    "",
                                                );

                                                setSelectedGenerationId(
                                                    "",
                                                );

                                                setSelectedYear(
                                                    "",
                                                );

                                                setSelectedVariant(
                                                    null,
                                                );

                                                setSearchSelection(
                                                    null,
                                                );

                                                onChange("");
                                            }}
                                            className="flex w-full items-center justify-between border-b border-slate-100 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-[#7008E7]/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#7008E7]/30 disabled:opacity-50"
                                        >
                                            <span className="text-sm font-medium text-slate-900">
                                                {make.name}
                                            </span>

                                            <span className="text-xs text-slate-400">
                                                Select
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}
                    </div>
                )}

                {/* Search results */}

                {searchQuery.trim().length >= 2 &&
                    searchQuery.trim() !== "/" &&
                    !showAllMakes &&
                    !searchRequest.loading &&
                    !searchRequest.error &&
                    searchResults.length === 0 &&
                    !searchSelection && (
                        <p className="text-xs text-slate-500">
                            No matching vehicles found.
                            Try another search.
                        </p>
                    )}

                {searchResults.length > 0 &&
                    !showAllMakes && (
                        <div className="max-h-64 overflow-y-auto rounded-xl border border-slate-200 bg-white">
                            {searchResults.map((result) => (
                                <button
                                    key={result.variantId}
                                    type="button"
                                    disabled={disabled}
                                    onClick={() => {
                                        selectSearchResult(
                                            result,
                                        );
                                    }}
                                    className="flex w-full items-start gap-3 border-b border-slate-100 px-4 py-3 text-left last:border-b-0 hover:bg-[#7008E7]/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#7008E7]/30 disabled:opacity-50"
                                >
                                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                                        <CarFront
                                            size={16}
                                            className="text-[#7008E7]"
                                        />
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium text-slate-900">
                                            {getSearchResultLabel(
                                                result,
                                            )}
                                        </p>

                                        {getSearchResultDetails(
                                            result,
                                        ) && (
                                            <p className="mt-1 text-xs text-slate-500">
                                                {getSearchResultDetails(
                                                    result,
                                                )}
                                            </p>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                {/* Search-selected vehicle */}

                {searchSelection && (
                    <div className="flex items-start gap-3 rounded-xl border border-[#7008E7]/20 bg-[#7008E7]/[0.04] p-3">
                        <Check
                            size={18}
                            className="mt-0.5 shrink-0 text-[#7008E7]"
                        />

                        <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-900">
                                Vehicle selected
                            </p>

                            <p className="mt-1 text-sm text-slate-600">
                                {getSearchResultLabel(
                                    searchSelection,
                                )}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Divider */}

            <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-200" />

                <span className="text-xs text-slate-400">
                    OR SELECT MANUALLY
                </span>

                <div className="h-px flex-1 bg-slate-200" />
            </div>

            {/* Manual vehicle selection */}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <VehicleCatalogSelect
                    label="Make"
                    value={selectedMakeId}
                    placeholder={
                        makesRequest.loading
                            ? "Loading makes..."
                            : "Select make"
                    }
                    options={makes.map((make) => ({
                        id: make.id,
                        label: make.name,
                    }))}
                    loading={makesRequest.loading}
                    disabled={disabled}
                    error={makesRequest.error}
                    onChange={selectMake}
                />

                <VehicleCatalogSelect
                    label="Model"
                    value={selectedModelId}
                    placeholder={
                        !selectedMakeId
                            ? "Select make first"
                            : modelsRequest.loading
                              ? "Loading models..."
                              : "Select model"
                    }
                    options={models.map((model) => ({
                        id: model.id,
                        label: model.name,
                    }))}
                    loading={modelsRequest.loading}
                    disabled={
                        disabled ||
                        !selectedMakeId
                    }
                    error={modelsRequest.error}
                    onChange={(modelId) => {
                        setSelectedModelId(modelId);

                        setSelectedGenerationId("");
                        setSelectedYear("");

                        setSelectedVariant(null);
                        setSearchSelection(null);

                        onChange("");
                    }}
                />

                <VehicleCatalogSelect
                    label="Generation"
                    value={selectedGenerationId}
                    placeholder={
                        !selectedModelId
                            ? "Select model first"
                            : generationsRequest.loading
                              ? "Loading generations..."
                              : "Select generation"
                    }
                    options={generationOptions}
                    loading={
                        generationsRequest.loading
                    }
                    disabled={
                        disabled ||
                        !selectedModelId
                    }
                    error={generationsRequest.error}
                    onChange={(generationId) => {
                        setSelectedGenerationId(
                            generationId,
                        );

                        setSelectedYear("");

                        setSelectedVariant(null);
                        setSearchSelection(null);

                        onChange("");
                    }}
                />

                <VehicleCatalogSelect
                    label="Model year"
                    value={selectedYear}
                    placeholder={
                        !selectedGenerationId
                            ? "Select generation first"
                            : yearsRequest.loading
                              ? "Loading model years..."
                              : modelYears.length === 0
                                ? "No model years available"
                                : "Select model year"
                    }
                    options={yearOptions}
                    loading={yearsRequest.loading}
                    disabled={
                        disabled ||
                        !selectedGenerationId ||
                        modelYears.length === 0
                    }
                    error={yearsRequest.error}
                    onChange={(year) => {
                        setSelectedYear(year);

                        setSelectedVariant(null);
                        setSearchSelection(null);

                        onChange("");
                    }}
                />

                <div className="sm:col-span-2">
                    <VehicleCatalogSelect
                        label="Vehicle variant"
                        value={
                            selectedVariant?.id ?? ""
                        }
                        placeholder={
                            !selectedGenerationId
                                ? "Select generation first"
                                : !selectedYear
                                  ? "Select model year first"
                                  : variantsRequest.loading
                                    ? "Loading variants..."
                                    : variants.length === 0
                                      ? "No variants available"
                                      : "Select vehicle variant"
                        }
                        options={variantOptions}
                        loading={
                            variantsRequest.loading
                        }
                        disabled={
                            disabled ||
                            !selectedGenerationId ||
                            !selectedYear ||
                            variants.length === 0
                        }
                        error={variantsRequest.error}
                        onChange={selectVariant}
                    />
                </div>
            </div>

            {/* Selected variant preview */}

            {selectedVariant && (
                <div className="rounded-xl border border-[#7008E7]/15 bg-[#7008E7]/[0.04] p-4">
                    <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#7008E7]/[0.08]">
                            <Check
                                size={19}
                                className="text-[#7008E7]"
                            />
                        </div>

                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-slate-900">
                                {selectedVariant.year}{" "}
                                {selectedVariant.name}
                            </p>

                            {getVariantDescription(
                                selectedVariant,
                            ) && (
                                <p className="mt-1 text-xs leading-5 text-slate-500">
                                    {getVariantDescription(
                                        selectedVariant,
                                    )}
                                </p>
                            )}

                            <p className="mt-2 text-xs text-[#7008E7]">
                                Vehicle variant selected
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Form validation error */}

            {error && (
                <p
                    role="alert"
                    className="flex items-center gap-2 text-sm text-red-600"
                >
                    <AlertCircle size={16} />
                    {error}
                </p>
            )}

            {/* Empty catalog warning */}

            {!makesRequest.loading &&
                !makesRequest.error &&
                makes.length === 0 && (
                    <p
                        role="status"
                        className="text-xs text-amber-700"
                    >
                        The vehicle catalog has no active
                        makes yet. Please try again later.
                    </p>
                )}

            {makesRequest.error &&
                makes.length === 0 && (
                    <button
                        type="button"
                        onClick={retryCatalog}
                        disabled={disabled}
                        className="text-sm font-medium text-[#7008E7] hover:underline disabled:opacity-50"
                    >
                        Retry loading vehicle makes
                    </button>
                )}

            {!hasSelectedVehicle && (
                <p className="text-xs leading-5 text-slate-500">
                    Select the exact variant of your
                    vehicle. This helps buyers find your
                    listing using accurate vehicle
                    specifications.
                </p>
            )}
        </section>
    );
}