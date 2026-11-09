"use client";

import {
    AnimatePresence,
    motion,
} from "framer-motion";

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
    Pencil,
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

import {
    VehicleManualEntryFields,
} from "./VehicleManualEntryFields";

import type {
    ManualVehicleValues,
} from "./VehicleManualEntryFields";

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
    onVehicleSelected?: (title: string | null) => void;
    manualValue: ManualVehicleValues;
    onManualVehicleChange: (field: keyof ManualVehicleValues, value: string) => void;
    onVehicleDetailsChange?: (details: Partial<ManualVehicleValues>) => void;
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

const BRAND = "#1491FF";
const BRAND_HOVER = "#0877D9";

function getErrorMessage(error: unknown): string {
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

const fadeIn = {
    initial: {
        opacity: 0,
        y: 8,
    },
    animate: {
        opacity: 1,
        y: 0,
    },
    exit: {
        opacity: 0,
        y: -6,
    },
    transition: {
        duration: 0.2,
        ease: "easeOut" as const,
    },
};

export function VehicleSelectionFields({
    value,
    onChange,
    onVehicleSelected,
    manualValue,
    onManualVehicleChange,
    onVehicleDetailsChange,
    disabled = false,
    error,
}: VehicleSelectionFieldsProps) {
    const [selectionMode, setSelectionMode] =
        useState<"catalog" | "manual">("catalog");

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
     * Prevent outdated search requests from
     * overwriting newer search results.
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
            showAllMakes ||
            searchSelection
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
        searchSelection,
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
     * CLEAR SEARCH SELECTION
     * =========================================================
     */

    const clearSearchSelection = useCallback(() => {
        if (searchSelection) {
            setSearchSelection(null);
            onVehicleSelected?.(null);
        }
    }, [
        onVehicleSelected,
        searchSelection,
    ]);

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
        onVehicleSelected?.(null);
        onVehicleDetailsChange?.({
            makeName: "", modelName: "", year: "",
            generationName: "", variantName: "",
        });
    }, [
        onChange,
        onVehicleSelected,
        onVehicleDetailsChange,
    ]);

    const clearVehicleDetails = useCallback(() => {
        onVehicleDetailsChange?.({
            makeName: "", modelName: "", year: "",
            generationName: "", variantName: "",
        });
    }, [onVehicleDetailsChange]);

    const switchSelectionMode = useCallback(
        (mode: "catalog" | "manual") => {
            if (disabled || mode === selectionMode) return;
            resetSelection();
            setSelectionMode(mode);
            if (mode === "catalog") clearVehicleDetails();
        },
        [clearVehicleDetails, disabled, resetSelection, selectionMode],
    );

    /*
     * =========================================================
     * OPEN ALL MAKES
     * =========================================================
     */

    const openAllMakes = useCallback(async () => {
        setShowAllMakes(true);
        setCatalogMarket(false);

        setSearchResults([]);
        clearSearchSelection();

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
    }, [clearSearchSelection]);

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
            onVehicleSelected?.(null);
            clearVehicleDetails();
        },
        [
            clearVehicleDetails,
            onChange,
            onVehicleSelected,
        ],
    );

    /*
     * =========================================================
     * SELECT SEARCH RESULT
     * =========================================================
     */

    const selectSearchResult = useCallback(
        (result: VehicleSearchResult) => {
            const vehicleTitle =
                getSearchResultLabel(result);

            setSearchSelection(result);

            setSelectedMakeId("");
            setSelectedModelId("");
            setSelectedGenerationId("");
            setSelectedYear("");

            setSelectedVariant(null);

            setShowAllMakes(false);

            setSearchQuery(vehicleTitle);
            setSearchResults([]);

            setCatalogError(null);

            onChange(result.variantId);
            onVehicleSelected?.(vehicleTitle);
            onVehicleDetailsChange?.({
                makeName: result.makeName,
                modelName: result.modelName,
                year: String(result.year),
                generationName: result.generationName ?? "",
                variantName: result.variantName,
            });
        },
        [
            onChange,
            onVehicleDetailsChange,
            onVehicleSelected,
        ],
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
            onVehicleSelected?.(null);
            if (variant) {
                const make = makes.find((item) => item.id === selectedMakeId);
                const model = models.find((item) => item.id === selectedModelId);
                const generation = generations.find((item) => item.id === selectedGenerationId);
                onVehicleDetailsChange?.({
                    makeName: make?.name ?? "",
                    modelName: model?.name ?? "",
                    year: selectedYear,
                    generationName: generation?.name ?? "",
                    variantName: variant.name,
                });
            }
        },
        [
            generations,
            makes,
            models,
            onChange,
            onVehicleDetailsChange,
            onVehicleSelected,
            selectedGenerationId,
            selectedMakeId,
            selectedModelId,
            selectedYear,
            variants,
        ],
    );

    /*
     * =========================================================
     * RETRY REQUEST
     * =========================================================
     */

    const retryCatalog = useCallback(() => {
        setCatalogError(null);

        if (searchRequest.error) {
            setSearchResults([]);

            setSearchRequest({
                loading: true,
                error: null,
            });

            const query = searchQuery.trim();

            if (query.length >= 2) {
                const requestId =
                    ++searchRequestId.current;

                void searchVehicleCatalog(
                    query,
                    {
                        market: catalogMarket,
                        limit: 20,
                    },
                )
                    .then((result) => {
                        if (
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
                    })
                    .catch((requestError: unknown) => {
                        if (
                            requestId !==
                            searchRequestId.current
                        ) {
                            return;
                        }

                        setSearchRequest({
                            loading: false,
                            error: getErrorMessage(
                                requestError,
                            ),
                        });
                    });
            } else {
                setSearchRequest(
                    INITIAL_REQUEST_STATE,
                );
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
     * DERIVED SELECTION STATE
     * =========================================================
     */

    const hasSelectedVehicle = Boolean(value);

    const hasSearchSelection = Boolean(
        searchSelection &&
        value === searchSelection.variantId,
    );

    /*
     * =========================================================
     * RENDER
     * =========================================================
     */

    return (
        <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-900/[0.02] sm:p-5">

            {/* HEADER */}

            <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EAF5FF]">
                    <CarFront
                        size={21}
                        strokeWidth={1.8}
                        className="text-[#1491FF]"
                    />
                </div>

                <div className="min-w-0 flex-1">
                    <h2 className="text-base font-semibold tracking-tight text-slate-900">
                        Vehicle details
                    </h2>

                    <p className="mt-1 max-w-lg text-sm leading-5 text-slate-500">
                        Find your vehicle in the catalog
                        or select its details manually.
                    </p>
                </div>

                {hasSelectedVehicle && (
                    <button
                        type="button"
                        disabled={disabled}
                        onClick={resetSelection}
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <RotateCcw size={13} />
                        Reset
                    </button>
                )}
            </div>

            <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
                <button type="button" disabled={disabled} onClick={() => switchSelectionMode("catalog")} className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${selectionMode === "catalog" ? "bg-white text-[#0877D9] shadow-sm" : "text-slate-500 hover:text-slate-800"}`}>
                    <CarFront size={16} /> Vehicle catalog
                </button>
                <button type="button" disabled={disabled} onClick={() => switchSelectionMode("manual")} className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${selectionMode === "manual" ? "bg-white text-[#0877D9] shadow-sm" : "text-slate-500 hover:text-slate-800"}`}>
                    <Pencil size={15} /> Enter manually
                </button>
            </div>

            {selectionMode === "manual" && (
                <VehicleManualEntryFields
                    value={manualValue}
                    onChange={onManualVehicleChange}
                    disabled={disabled}
                />
            )}

            {selectionMode === "catalog" && (<>
            {/* GENERAL CATALOG ERROR */}

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
                            className="mt-2 text-xs font-semibold text-[#0877D9] hover:underline disabled:opacity-50"
                        >
                            Try again
                        </button>
                    </div>
                </div>
            )}

            {/* SEARCH SECTION */}

            <div className="space-y-3">
                <div>
                    <label
                        htmlFor="vehicle-catalog-search"
                        className="block text-sm font-medium text-slate-700"
                    >
                        Search vehicle catalog
                    </label>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                        Search by make, model, year or
                        variant name.
                    </p>
                </div>

                <div className="relative">
                    <Search
                        size={18}
                        strokeWidth={1.8}
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

                            /*
                             * Editing a selected search result
                             * clears the old catalog selection.
                             */
                            clearSearchSelection();

                            if (selectedVariant) {
                                setSelectedVariant(null);
                                onChange("");
                                clearVehicleDetails();
                            }

                            setSearchQuery(nextValue);
                            setCatalogError(null);

                            if (
                                nextValue.trim() === "/"
                            ) {
                                void openAllMakes();
                                return;
                            }

                            setShowAllMakes(false);
                        }}
                        placeholder="e.g. Toyota Camry 2020"
                        autoComplete="off"
                        className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-11 text-sm text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-slate-300 focus:border-[#1491FF] focus:ring-4 focus:ring-[#1491FF]/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-60"
                    />

                    {searchRequest.loading && (
                        <LoaderCircle
                            size={17}
                            className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-[#1491FF]"
                        />
                    )}
                </div>

                <p className="text-xs leading-5 text-slate-400">
                    You can also enter / to browse all
                    active vehicle makes.
                </p>

                {/* SEARCH ERROR */}

                {searchRequest.error && (
                    <div className="flex items-center justify-between gap-3 rounded-lg bg-red-50 px-3 py-2.5">
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
                            className="shrink-0 text-xs font-semibold text-red-700 hover:underline disabled:opacity-50"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* ALL MAKES */}

                <AnimatePresence>
                    {showAllMakes && (
                        <motion.div
                            {...fadeIn}
                            className="overflow-hidden rounded-xl border border-slate-200 bg-white"
                        >
                            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                                <div>
                                    <p className="text-sm font-semibold text-slate-900">
                                        All vehicle makes
                                    </p>

                                    <p className="mt-0.5 text-xs text-slate-500">
                                        Browse the complete catalog
                                    </p>
                                </div>

                                {makesRequest.loading && (
                                    <LoaderCircle
                                        size={17}
                                        className="animate-spin text-[#1491FF]"
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
                                        className="mt-3 text-sm font-semibold text-[#0877D9] hover:underline disabled:opacity-50"
                                    >
                                        Try again
                                    </button>
                                </div>
                            )}

                            {selectionMode === "catalog" && !makesRequest.loading &&
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
                                                    setCatalogMarket(false);
                                                    setShowAllMakes(false);

                                                    setSearchQuery("");
                                                    setSearchResults([]);

                                                    setSelectedMakeId(
                                                        make.id,
                                                    );

                                                    setSelectedModelId("");
                                                    setSelectedGenerationId("");
                                                    setSelectedYear("");

                                                    setSelectedVariant(null);
                                                    setSearchSelection(null);

                                                    onChange("");
                                                    onVehicleSelected?.(null);
                                                }}
                                                className="flex w-full items-center justify-between border-b border-slate-100 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-[#F4F9FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#1491FF]/30 disabled:opacity-50"
                                            >
                                                <span className="text-sm font-medium text-slate-800">
                                                    {make.name}
                                                </span>

                                                <span className="text-xs font-medium text-[#0877D9]">
                                                    Select
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* SEARCH RESULTS */}

                <AnimatePresence>
                    {searchResults.length > 0 &&
                        !showAllMakes && (
                            <motion.div
                                {...fadeIn}
                                className="overflow-hidden rounded-xl border border-slate-200 bg-white"
                            >
                                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                                    <p className="text-xs font-semibold text-slate-500">
                                        MATCHING VEHICLES
                                    </p>

                                    <span className="text-xs text-slate-400">
                                        {searchResults.length} results
                                    </span>
                                </div>

                                <div className="max-h-72 overflow-y-auto">
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
                                            className="group flex w-full items-start gap-3 border-b border-slate-100 px-4 py-3.5 text-left transition-colors last:border-b-0 hover:bg-[#F4F9FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#1491FF]/30 disabled:opacity-50"
                                        >
                                            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 transition-colors group-hover:bg-[#EAF5FF]">
                                                <CarFront
                                                    size={17}
                                                    strokeWidth={1.8}
                                                    className="text-slate-500 transition-colors group-hover:text-[#1491FF]"
                                                />
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-medium leading-5 text-slate-900">
                                                    {getSearchResultLabel(
                                                        result,
                                                    )}
                                                </p>

                                                {getSearchResultDetails(
                                                    result,
                                                ) && (
                                                    <p className="mt-1 text-xs leading-5 text-slate-500">
                                                        {getSearchResultDetails(
                                                            result,
                                                        )}
                                                    </p>
                                                )}
                                            </div>

                                            <span className="mt-1 shrink-0 text-xs font-medium text-[#0877D9] opacity-0 transition-opacity group-hover:opacity-100">
                                                Select
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                </AnimatePresence>

                {/* NO SEARCH RESULTS */}

                {searchQuery.trim().length >= 2 &&
                    searchQuery.trim() !== "/" &&
                    !showAllMakes &&
                    !searchRequest.loading &&
                    !searchRequest.error &&
                    searchResults.length === 0 &&
                    !searchSelection && (
                        <motion.p
                            {...fadeIn}
                            className="rounded-lg bg-slate-50 px-3 py-3 text-xs leading-5 text-slate-500"
                        >
                            No matching vehicles found.
                            Try another make, model or year.
                        </motion.p>
                    )}

                {/* SEARCH-SELECTED VEHICLE */}

                <AnimatePresence mode="wait">
                    {hasSearchSelection &&
                        searchSelection && (
                            <motion.div
                                key={searchSelection.variantId}
                                {...fadeIn}
                                className="rounded-xl border border-[#1491FF]/20 bg-[#F4F9FF] p-4"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#1491FF] shadow-sm shadow-blue-900/5">
                                        <Check
                                            size={19}
                                            strokeWidth={2.2}
                                        />
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className="text-sm font-semibold text-slate-900">
                                                Vehicle selected
                                            </p>

                                            <span className="rounded-md bg-[#1491FF]/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#0877D9]">
                                                Catalog match
                                            </span>
                                        </div>

                                        <p className="mt-1.5 text-sm font-medium leading-6 text-slate-800">
                                            {getSearchResultLabel(
                                                searchSelection,
                                            )}
                                        </p>

                                        {getSearchResultDetails(
                                            searchSelection,
                                        ) && (
                                            <p className="mt-1 text-xs leading-5 text-slate-500">
                                                {getSearchResultDetails(
                                                    searchSelection,
                                                )}
                                            </p>
                                        )}

                                        <p className="mt-2 text-xs font-medium text-[#0877D9]">
                                            Exact vehicle variant selected
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        disabled={disabled}
                                        onClick={resetSelection}
                                        className="shrink-0 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:border-[#1491FF]/40 hover:bg-[#EAF5FF] hover:text-[#0877D9] disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Change
                                    </button>
                                </div>
                            </motion.div>
                        )}
                </AnimatePresence>
            </div>

            </>)}

            {/* CATALOG CASCADING SELECTORS */}

            {selectionMode === "catalog" && (
            <AnimatePresence initial={false}>
                {!hasSearchSelection && (
                    <motion.div
                        key="manual-selection"
                        initial={{
                            opacity: 0,
                            height: 0,
                        }}
                        animate={{
                            opacity: 1,
                            height: "auto",
                        }}
                        exit={{
                            opacity: 0,
                            height: 0,
                        }}
                        transition={{
                            duration: 0.25,
                            ease: "easeInOut",
                        }}
                        className="overflow-hidden"
                    >
                        <div className="space-y-5 pt-1">

                            {/* DIVIDER */}

                            <div className="flex items-center gap-3">
                                <div className="h-px flex-1 bg-slate-200" />

                                <span className="text-[11px] font-semibold tracking-wider text-slate-400">
                                    SELECT VEHICLE DETAILS
                                </span>

                                <div className="h-px flex-1 bg-slate-200" />
                            </div>

                            {/* MANUAL FIELDS */}

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
                                        onVehicleSelected?.(null);
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
                                    error={
                                        generationsRequest.error
                                    }
                                    onChange={(generationId) => {
                                        setSelectedGenerationId(
                                            generationId,
                                        );

                                        setSelectedYear("");

                                        setSelectedVariant(null);
                                        setSearchSelection(null);

                                        onChange("");
                                        onVehicleSelected?.(null);
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
                                        onVehicleSelected?.(null);
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
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            )}

            {/* MANUALLY SELECTED VARIANT */}

            <AnimatePresence>
                {selectionMode === "catalog" && selectedVariant && (
                    <motion.div
                        {...fadeIn}
                        className="rounded-xl border border-[#1491FF]/20 bg-[#F4F9FF] p-4"
                    >
                        <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#1491FF] shadow-sm shadow-blue-900/5">
                                <Check
                                    size={19}
                                    strokeWidth={2.2}
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

                                <p className="mt-2 text-xs font-medium text-[#0877D9]">
                                    Vehicle variant selected
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* FORM VALIDATION ERROR */}

            {error && (
                <p
                    role="alert"
                    className="flex items-center gap-2 text-sm text-red-600"
                >
                    <AlertCircle size={16} />
                    {error}
                </p>
            )}

            {/* EMPTY CATALOG WARNING */}

            {selectionMode === "catalog" &&
                !makesRequest.loading &&
                !makesRequest.error &&
                makes.length === 0 && (
                    <p
                        role="status"
                        className="text-xs leading-5 text-amber-700"
                    >
                        The vehicle catalog has no active
                        makes yet. Please try again later.
                    </p>
                )}

            {selectionMode === "catalog" && makesRequest.error &&
                makes.length === 0 && (
                    <button
                        type="button"
                        onClick={retryCatalog}
                        disabled={disabled}
                        className="text-sm font-semibold text-[#0877D9] hover:underline disabled:opacity-50"
                    >
                        Retry loading vehicle makes
                    </button>
                )}

            {/* HELPER TEXT */}

            {selectionMode === "catalog" && !hasSelectedVehicle && (
                <p className="border-t border-slate-100 pt-4 text-xs leading-5 text-slate-500">
                    Select the exact variant of your
                    vehicle. Accurate vehicle details help
                    buyers find your listing more easily.
                </p>
            )}
        </section>
    );
}