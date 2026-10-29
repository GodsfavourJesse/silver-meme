"use client";

import {
    useCallback,
    useState,
    type RefObject,
} from "react";

import {
    ChevronDown,
    LoaderCircle,
    RefreshCw,
    SlidersHorizontal,
    X,
} from "lucide-react";

import {
    BODY_STYLE_OPTIONS,
    CONDITION_OPTIONS,
    FUEL_OPTIONS,
    TRANSMISSION_OPTIONS,
    countActiveFilters,
    type MarketplaceFilterState,
} from "@/app/lib/user/marketplace/marketplace-search";

import { useSharedMarketplaceSearch } from "@/app/context/user/MarketplaceSearchProvider";

import type {
    MarketplaceMake,
    MarketplaceModel,
    MarketplaceGeneration,
    MarketplaceVariant,
} from "@/app/types/user/marketplace.types";

interface MarketplaceFiltersProps {
    filters: MarketplaceFilterState;
    onFilterChange: <K extends keyof MarketplaceFilterState>(
        key: K,
        value: MarketplaceFilterState[K],
    ) => void;
    onClear: () => void;
    onApply: () => void;
    variant?: "sidebar" | "modal";
    onClose?: () => void;
    closeButtonRef?: RefObject<HTMLButtonElement | null>;
}

const INPUT_CLASS =
    "min-w-0 rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100";

const SELECT_CLASS =
    "w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-3 pr-9 text-sm text-slate-800 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400";

function getCatalogItemLabel(
    item:
        | MarketplaceMake
        | MarketplaceModel
        | MarketplaceGeneration
        | MarketplaceVariant,
): string {
    const name = "name" in item ? item.name : undefined;
    const year = "year" in item ? item.year : undefined;

    if (name && year) {
        return `${year} ${name}`;
    }

    if (name) {
        return name;
    }

    if (year) {
        return String(year);
    }

    return "Unnamed vehicle option";
}

function CatalogSelect<T extends { id: string }>({
    label,
    value,
    items,
    placeholder,
    disabled,
    loading,
    error,
    getLabel,
    onChange,
    onRetry,
}: {
    label: string;
    value: string;
    items: T[];
    placeholder: string;
    disabled?: boolean;
    loading?: boolean;
    error?: string;
    getLabel: (item: T) => string;
    onChange: (value: string) => void;
    onRetry?: () => void;
}) {
    const isDisabled = disabled === true || loading === true;

    return (
        <div className="min-w-0">
            <label className="mb-2 block text-xs font-semibold text-slate-700">
                {label}
            </label>

            <div className="relative">
                <select
                    value={value}
                    disabled={isDisabled}
                    onChange={(event) => onChange(event.target.value)}
                    className={SELECT_CLASS}
                >
                    <option value="">
                        {loading
                            ? `Loading ${label.toLowerCase()}...`
                            : placeholder}
                    </option>

                    {items.map((item) => (
                        <option key={item.id} value={item.id}>
                            {getLabel(item)}
                        </option>
                    ))}
                </select>

                {loading ? (
                    <LoaderCircle
                        size={15}
                        aria-hidden="true"
                        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-violet-600"
                    />
                ) : (
                    <ChevronDown
                        size={15}
                        aria-hidden="true"
                        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                )}
            </div>

            {error && (
                <div className="mt-2 flex items-start justify-between gap-2">
                    <p
                        role="alert"
                        className="text-xs leading-5 text-red-600"
                    >
                        {error}
                    </p>

                    {onRetry && (
                        <button
                            type="button"
                            onClick={onRetry}
                            className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-violet-700 transition hover:text-violet-900"
                        >
                            <RefreshCw size={12} />
                            Retry
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

function FilterSelect({
    label,
    value,
    options,
    onChange,
}: {
    label: string;
    value: string;
    options: string[];
    onChange: (value: string) => void;
}) {
    return (
        <label className="block">
            <span className="mb-2 block text-xs font-semibold text-slate-700">
                {label}
            </span>

            <span className="relative block">
                <select
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    className={SELECT_CLASS}
                >
                    <option value="">
                        Any {label.toLowerCase()}
                    </option>

                    {options.map((option) => (
                        <option key={option} value={option}>
                            {option
                                .toLowerCase()
                                .replaceAll("_", " ")
                                .replace(/\b\w/g, (letter) =>
                                    letter.toUpperCase(),
                                )}
                        </option>
                    ))}
                </select>

                <ChevronDown
                    size={15}
                    aria-hidden="true"
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
            </span>
        </label>
    );
}

function RangeFilter({
    title,
    minValue,
    maxValue,
    minPlaceholder,
    maxPlaceholder,
    minLabel,
    maxLabel,
    min,
    max,
    onMinChange,
    onMaxChange,
}: {
    title: string;
    minValue: string;
    maxValue: string;
    minPlaceholder: string;
    maxPlaceholder: string;
    minLabel: string;
    maxLabel: string;
    min: string;
    max?: string;
    onMinChange: (value: string) => void;
    onMaxChange: (value: string) => void;
}) {
    return (
        <div>
            <h3 className="mb-3 text-sm font-semibold">
                {title}
            </h3>

            <div className="grid grid-cols-2 gap-2">
                <input
                    type="number"
                    min={min}
                    {...(max !== undefined ? { max } : {})}
                    value={minValue}
                    onChange={(event) =>
                        onMinChange(event.target.value)
                    }
                    placeholder={minPlaceholder}
                    aria-label={minLabel}
                    className={INPUT_CLASS}
                />

                <input
                    type="number"
                    min={min}
                    {...(max !== undefined ? { max } : {})}
                    value={maxValue}
                    onChange={(event) =>
                        onMaxChange(event.target.value)
                    }
                    placeholder={maxPlaceholder}
                    aria-label={maxLabel}
                    className={INPUT_CLASS}
                />
            </div>
        </div>
    );
}

export function MarketplaceFilters({
    filters,
    onFilterChange,
    onClear,
    onApply,
    variant = "sidebar",
    onClose,
    closeButtonRef,
}: MarketplaceFiltersProps) {
    const [showFilters, setShowFilters] = useState(true);

    const {
        makes,
        models,
        generations,
        variants,
        vehicleCatalogLoading,
        vehicleCatalogError,
        retryVehicleCatalog,
    } = useSharedMarketplaceSearch();

    const activeFilterCount = countActiveFilters(filters);
    const isModal = variant === "modal";

    /*
     * The shared hook currently exposes a general catalog loading/error
     * state. Use it for make loading and catalog-wide retry feedback.
     */
    const loadingMakes = vehicleCatalogLoading;
    const makesError = vehicleCatalogError;

    /*
     * The dependent collections are populated by the shared hook.
     * Their empty state is expected when their parent selection is empty.
     */
    const loadingModels = Boolean(
        filters.makeId && models.length === 0,
    );

    const loadingGenerations = Boolean(
        filters.modelId && generations.length === 0,
    );

    const loadingVariants = Boolean(
        filters.generationId && variants.length === 0,
    );

    const handleMakeChange = useCallback(
        (makeId: string) => {
            onFilterChange("makeId", makeId);
        },
        [onFilterChange],
    );

    const handleModelChange = useCallback(
        (modelId: string) => {
            onFilterChange("modelId", modelId);
        },
        [onFilterChange],
    );

    const handleGenerationChange = useCallback(
        (generationId: string) => {
            onFilterChange("generationId", generationId);
        },
        [onFilterChange],
    );

    const handleClear = useCallback(() => {
        onClear();
    }, [onClear]);

    return (
        <aside
            className={
                isModal
                    ? "flex h-full min-h-0 flex-col overflow-hidden bg-white"
                    : "flex min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)]"
            }
        >
            {/* Header */}
            <div className="relative z-10 flex shrink-0 items-center justify-between border-b border-slate-100 bg-white px-5 py-4 sm:p-5">
                <div className="flex items-center gap-2">
                    <SlidersHorizontal
                        size={17}
                        className="text-violet-700"
                    />

                    <h2 className="font-semibold">
                        Filters
                    </h2>

                    {activeFilterCount > 0 && (
                        <span className="grid size-5 place-items-center rounded-full bg-violet-100 text-[10px] font-bold text-violet-700">
                            {activeFilterCount}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={handleClear}
                        className="text-xs font-semibold text-violet-700 transition hover:text-violet-900"
                    >
                        Clear all
                    </button>

                    {isModal && onClose && (
                        <button
                            ref={closeButtonRef}
                            type="button"
                            onClick={onClose}
                            aria-label="Close filters"
                            className="grid size-9 place-items-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
                        >
                            <X size={19} />
                        </button>
                    )}
                </div>
            </div>

            {/* Scrollable filter options */}
            <div
                className={
                    isModal
                        ? "min-h-0 flex-1 overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                        : "min-h-0 lg:flex-1 lg:overflow-y-auto lg:overscroll-contain lg:[scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                }
            >
                <div className="p-5">
                    {!isModal && (
                        <button
                            type="button"
                            onClick={() =>
                                setShowFilters((current) => !current)
                            }
                            aria-expanded={showFilters}
                            className="mb-5 flex w-full items-center justify-between text-sm font-semibold lg:hidden"
                        >
                            Filter options

                            <ChevronDown
                                size={17}
                                className={`transition-transform ${
                                    showFilters ? "rotate-180" : ""
                                }`}
                            />
                        </button>
                    )}

                    <div
                        className={
                            isModal || showFilters
                                ? "space-y-6"
                                : "hidden space-y-6 lg:block"
                        }
                    >
                        {/* Vehicle catalog */}
                        <div className="space-y-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                            <div>
                                <h3 className="text-sm font-semibold text-slate-900">
                                    Vehicle
                                </h3>

                                <p className="mt-1 text-xs leading-5 text-slate-500">
                                    Narrow your search by make, model, generation, and variant.
                                </p>
                            </div>

                            <CatalogSelect
                                label="Make"
                                value={filters.makeId}
                                items={makes}
                                placeholder="Any make"
                                loading={loadingMakes}
                                error={makesError}
                                getLabel={getCatalogItemLabel}
                                onChange={handleMakeChange}
                                onRetry={() => void retryVehicleCatalog()}
                            />

                            <CatalogSelect
                                label="Model"
                                value={filters.modelId}
                                items={models}
                                placeholder="Any model"
                                disabled={!filters.makeId}
                                loading={loadingModels}
                                getLabel={getCatalogItemLabel}
                                onChange={handleModelChange}
                            />

                            <CatalogSelect
                                label="Generation"
                                value={filters.generationId}
                                items={generations}
                                placeholder="Any generation"
                                disabled={!filters.modelId}
                                loading={loadingGenerations}
                                getLabel={getCatalogItemLabel}
                                onChange={handleGenerationChange}
                            />

                            <CatalogSelect
                                label="Variant"
                                value={filters.variantId}
                                items={variants}
                                placeholder="Any variant"
                                disabled={!filters.generationId}
                                loading={loadingVariants}
                                getLabel={getCatalogItemLabel}
                                onChange={(value) =>
                                    onFilterChange("variantId", value)
                                }
                            />
                        </div>

                        <RangeFilter
                            title="Price range (₦)"
                            minValue={filters.minPrice}
                            maxValue={filters.maxPrice}
                            minPlaceholder="Minimum"
                            maxPlaceholder="Maximum"
                            minLabel="Minimum price"
                            maxLabel="Maximum price"
                            min="0"
                            onMinChange={(value) =>
                                onFilterChange("minPrice", value)
                            }
                            onMaxChange={(value) =>
                                onFilterChange("maxPrice", value)
                            }
                        />

                        <RangeFilter
                            title="Model year"
                            minValue={filters.minYear}
                            maxValue={filters.maxYear}
                            minPlaceholder="From"
                            maxPlaceholder="To"
                            minLabel="Minimum model year"
                            maxLabel="Maximum model year"
                            min="1900"
                            max="2100"
                            onMinChange={(value) =>
                                onFilterChange("minYear", value)
                            }
                            onMaxChange={(value) =>
                                onFilterChange("maxYear", value)
                            }
                        />

                        <RangeFilter
                            title="Mileage (km)"
                            minValue={filters.minMileage}
                            maxValue={filters.maxMileage}
                            minPlaceholder="Minimum"
                            maxPlaceholder="Maximum"
                            minLabel="Minimum mileage"
                            maxLabel="Maximum mileage"
                            min="0"
                            onMinChange={(value) =>
                                onFilterChange("minMileage", value)
                            }
                            onMaxChange={(value) =>
                                onFilterChange("maxMileage", value)
                            }
                        />

                        <FilterSelect
                            label="Condition"
                            value={filters.condition}
                            options={CONDITION_OPTIONS}
                            onChange={(value) =>
                                onFilterChange("condition", value)
                            }
                        />

                        <FilterSelect
                            label="Fuel type"
                            value={filters.fuelType}
                            options={FUEL_OPTIONS}
                            onChange={(value) =>
                                onFilterChange("fuelType", value)
                            }
                        />

                        <FilterSelect
                            label="Transmission"
                            value={filters.transmission}
                            options={TRANSMISSION_OPTIONS}
                            onChange={(value) =>
                                onFilterChange("transmission", value)
                            }
                        />

                        <FilterSelect
                            label="Body style"
                            value={filters.bodyStyle}
                            options={BODY_STYLE_OPTIONS}
                            onChange={(value) =>
                                onFilterChange("bodyStyle", value)
                            }
                        />

                        <div>
                            <h3 className="mb-3 text-sm font-semibold">
                                Location
                            </h3>

                            <div className="space-y-3">
                                <input
                                    value={filters.state}
                                    onChange={(event) =>
                                        onFilterChange(
                                            "state",
                                            event.target.value,
                                        )
                                    }
                                    placeholder="State (e.g. Lagos)"
                                    aria-label="Filter by state"
                                    className={`w-full ${INPUT_CLASS}`}
                                />

                                <input
                                    value={filters.city}
                                    onChange={(event) =>
                                        onFilterChange(
                                            "city",
                                            event.target.value,
                                        )
                                    }
                                    placeholder="City (optional)"
                                    aria-label="Filter by city"
                                    className={`w-full ${INPUT_CLASS}`}
                                />
                            </div>
                        </div>

                        <div className="space-y-4 border-t border-slate-100 pt-5">
                            <label className="flex cursor-pointer items-start gap-3">
                                <input
                                    type="checkbox"
                                    checked={filters.dealerOnly}
                                    onChange={(event) =>
                                        onFilterChange(
                                            "dealerOnly",
                                            event.target.checked,
                                        )
                                    }
                                    className="mt-0.5 size-4 accent-violet-700"
                                />

                                <span>
                                    <span className="block text-sm font-semibold">
                                        Dealer listings
                                    </span>

                                    <span className="mt-1 block text-xs leading-5 text-slate-500">
                                        Show vehicles listed by dealers.
                                    </span>
                                </span>
                            </label>

                            <label className="flex cursor-pointer items-start gap-3">
                                <input
                                    type="checkbox"
                                    checked={filters.verifiedDealerOnly}
                                    onChange={(event) =>
                                        onFilterChange(
                                            "verifiedDealerOnly",
                                            event.target.checked,
                                        )
                                    }
                                    className="mt-0.5 size-4 accent-violet-700"
                                />

                                <span>
                                    <span className="block text-sm font-semibold">
                                        Verified dealers only
                                    </span>

                                    <span className="mt-1 block text-xs leading-5 text-slate-500">
                                        Narrow results to verified dealers.
                                    </span>
                                </span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal-only bottom action bar */}
            {isModal && (
                <div className="shrink-0 border-t border-slate-100 bg-white p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:p-5">
                    <button
                        type="button"
                        onClick={onApply}
                        className="w-full rounded-xl bg-violet-700 px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition duration-200 hover:bg-violet-800 active:scale-[0.99]"
                    >
                        Show matching vehicles
                    </button>

                    <p className="mt-2 text-center text-xs text-slate-500">
                        Your selections will be applied to the marketplace.
                    </p>
                </div>
            )}

            {/* Sidebar-only action */}
            {!isModal && (
                <div className="shrink-0 border-t border-slate-100 bg-white p-5">
                    <button
                        type="button"
                        onClick={onApply}
                        className="w-full rounded-xl bg-violet-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-800"
                    >
                        Apply filters
                    </button>
                </div>
            )}
        </aside>
    );
}