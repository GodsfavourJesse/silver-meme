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
    Check,
    RotateCcw,
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

const BRAND = "#1491FF";

const INPUT_CLASS = [
    "min-w-0 w-full rounded-xl border border-slate-200 bg-white",
    "px-3.5 py-3 text-sm text-slate-900 placeholder:text-slate-400",
    "outline-none transition duration-150",
    "hover:border-slate-300",
    "focus:border-[#1491FF] focus:ring-4 focus:ring-[#1491FF]/10",
    "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400",
].join(" ");

const SELECT_CLASS = [
    "w-full appearance-none rounded-xl border border-slate-200 bg-white",
    "px-3.5 py-3 pr-10 text-sm text-slate-800",
    "outline-none transition duration-150",
    "hover:border-slate-300",
    "focus:border-[#1491FF] focus:ring-4 focus:ring-[#1491FF]/10",
    "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400",
].join(" ");

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

function formatOption(option: string): string {
    return option
        .toLowerCase()
        .replaceAll("_", " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function SectionHeading({
    title,
    description,
}: {
    title: string;
    description?: string;
}) {
    return (
        <div className="mb-3.5">
            <h3 className="text-sm font-semibold tracking-tight text-slate-900">
                {title}
            </h3>

            {description && (
                <p className="mt-1 text-xs leading-5 text-slate-500">
                    {description}
                </p>
            )}
        </div>
    );
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

    const selectId = `marketplace-filter-${label
        .toLowerCase()
        .replace(/\s+/g, "-")}`;

    return (
        <div className="min-w-0">
            <label
                htmlFor={selectId}
                className="mb-2 block text-xs font-medium text-slate-700"
            >
                {label}
            </label>

            <div className="relative">
                <select
                    id={selectId}
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
                        size={16}
                        aria-hidden="true"
                        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 animate-spin text-[#1491FF]"
                    />
                ) : (
                    <ChevronDown
                        size={16}
                        aria-hidden="true"
                        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                )}
            </div>

            {error && (
                <div className="mt-2.5 flex items-start justify-between gap-2 rounded-lg bg-red-50 px-3 py-2">
                    <p
                        role="alert"
                        className="text-xs leading-5 text-red-700"
                    >
                        {error}
                    </p>

                    {onRetry && (
                        <button
                            type="button"
                            onClick={onRetry}
                            className="inline-flex shrink-0 items-center gap-1.5 rounded-md px-1 py-0.5 text-xs font-semibold text-red-700 transition hover:text-red-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
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
    const selectId = `marketplace-filter-${label
        .toLowerCase()
        .replace(/\s+/g, "-")}`;

    return (
        <div className="min-w-0">
            <label
                htmlFor={selectId}
                className="mb-2 block text-xs font-medium text-slate-700"
            >
                {label}
            </label>

            <div className="relative">
                <select
                    id={selectId}
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    className={SELECT_CLASS}
                >
                    <option value="">
                        Any {label.toLowerCase()}
                    </option>

                    {options.map((option) => (
                        <option key={option} value={option}>
                            {formatOption(option)}
                        </option>
                    ))}
                </select>

                <ChevronDown
                    size={16}
                    aria-hidden="true"
                    className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
            </div>
        </div>
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
        <section className="min-w-0">
            <SectionHeading title={title} />

            <div className="grid grid-cols-2 gap-2.5">
                <div className="min-w-0">
                    <label className="sr-only" htmlFor={minLabel}>
                        {minLabel}
                    </label>

                    <input
                        id={minLabel}
                        type="number"
                        inputMode="numeric"
                        min={min}
                        {...(max !== undefined ? { max } : {})}
                        value={minValue}
                        onChange={(event) => onMinChange(event.target.value)}
                        placeholder={minPlaceholder}
                        aria-label={minLabel}
                        className={INPUT_CLASS}
                    />
                </div>

                <div className="min-w-0">
                    <label className="sr-only" htmlFor={maxLabel}>
                        {maxLabel}
                    </label>

                    <input
                        id={maxLabel}
                        type="number"
                        inputMode="numeric"
                        min={min}
                        {...(max !== undefined ? { max } : {})}
                        value={maxValue}
                        onChange={(event) => onMaxChange(event.target.value)}
                        placeholder={maxPlaceholder}
                        aria-label={maxLabel}
                        className={INPUT_CLASS}
                    />
                </div>
            </div>
        </section>
    );
}

function ToggleFilter({
    title,
    description,
    checked,
    onChange,
}: {
    title: string;
    description: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}) {
    return (
        <label className="flex cursor-pointer items-start gap-3 rounded-xl p-2.5 transition hover:bg-slate-50">
            <span className="relative mt-0.5 grid size-[18px] shrink-0 place-items-center">
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={(event) => onChange(event.target.checked)}
                    className="peer absolute inset-0 size-full cursor-pointer appearance-none rounded-[5px] border border-slate-300 bg-white transition checked:border-[#1491FF] checked:bg-[#1491FF] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#1491FF]/15"
                />

                {checked && (
                    <Check
                        size={12}
                        strokeWidth={3}
                        aria-hidden="true"
                        className="pointer-events-none relative text-white"
                    />
                )}
            </span>

            <span className="min-w-0">
                <span className="block text-sm font-medium text-slate-800">
                    {title}
                </span>

                <span className="mt-1 block text-xs leading-5 text-slate-500">
                    {description}
                </span>
            </span>
        </label>
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

    const loadingMakes = vehicleCatalogLoading;
    const makesError = vehicleCatalogError;

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
            aria-label="Vehicle search filters"
            className={
                isModal
                    ? "flex h-full min-h-0 flex-col overflow-hidden bg-white"
                    : [
                          "flex min-h-0 flex-col overflow-hidden rounded-2xl",
                          "border border-slate-200 bg-white shadow-sm",
                          "lg:sticky lg:top-4 lg:max-h-[calc(100dvh-2rem)]",
                      ].join(" ")
            }
        >
            {/* Header */}
            <div className="relative z-10 flex shrink-0 items-center justify-between gap-3 border-b border-slate-100 bg-white px-4 py-4 sm:px-5">
                <div className="flex min-w-0 items-center gap-3">
                    <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#1491FF]/10 text-[#1491FF]">
                        <SlidersHorizontal size={19} strokeWidth={2} />
                    </div>

                    <div className="min-w-0">
                        <h2 className="text-sm font-semibold text-slate-900 sm:text-base">
                            Filters
                        </h2>

                        <p className="mt-0.5 text-xs text-slate-500">
                            Refine your car search
                        </p>
                    </div>

                    {activeFilterCount > 0 && (
                        <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[#1491FF]/10 text-xs font-bold text-[#0876D1]">
                            {activeFilterCount}
                        </span>
                    )}
                </div>

                <div className="flex shrink-0 items-center gap-2">
                    <button
                        type="button"
                        onClick={handleClear}
                        disabled={activeFilterCount === 0}
                        className="inline-flex items-center gap-1.5 rounded-lg px-2 py-2 text-xs font-semibold text-slate-500 transition hover:bg-slate-50 hover:text-[#0876D1] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <RotateCcw size={13} />
                        Clear
                    </button>

                    {isModal && onClose && (
                        <button
                            ref={closeButtonRef}
                            type="button"
                            onClick={onClose}
                            aria-label="Close filters"
                            className="grid size-10 shrink-0 place-items-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#1491FF]/15"
                        >
                            <X size={19} />
                        </button>
                    )}
                </div>
            </div>

            {/* Filter content */}
            <div
                className={
                    isModal
                        ? "min-h-0 flex-1 overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                        : "min-h-0 lg:flex-1 lg:overflow-y-auto lg:overscroll-contain lg:[scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                }
            >
                <div className="p-4 sm:p-5">
                    {!isModal && (
                        <button
                            type="button"
                            onClick={() =>
                                setShowFilters((current) => !current)
                            }
                            aria-expanded={showFilters}
                            className="mb-4 flex min-h-11 w-full items-center justify-between rounded-xl border border-slate-200 px-3.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 lg:hidden"
                        >
                            <span>
                                {showFilters
                                    ? "Hide filter options"
                                    : "Show filter options"}
                            </span>

                            <ChevronDown
                                size={17}
                                className={`transition-transform duration-200 ${
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
                        {/* Vehicle */}
                        <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 sm:p-4">
                            <SectionHeading
                                title="Vehicle"
                                description="Choose the details of the car you're looking for."
                            />

                            <div className="space-y-4">
                                <CatalogSelect
                                    label="Make"
                                    value={filters.makeId}
                                    items={makes}
                                    placeholder="All makes"
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
                                    placeholder="All models"
                                    disabled={!filters.makeId}
                                    loading={loadingModels}
                                    getLabel={getCatalogItemLabel}
                                    onChange={handleModelChange}
                                />

                                <CatalogSelect
                                    label="Generation"
                                    value={filters.generationId}
                                    items={generations}
                                    placeholder="All generations"
                                    disabled={!filters.modelId}
                                    loading={loadingGenerations}
                                    getLabel={getCatalogItemLabel}
                                    onChange={handleGenerationChange}
                                />

                                <CatalogSelect
                                    label="Variant"
                                    value={filters.variantId}
                                    items={variants}
                                    placeholder="All variants"
                                    disabled={!filters.generationId}
                                    loading={loadingVariants}
                                    getLabel={getCatalogItemLabel}
                                    onChange={(value) =>
                                        onFilterChange("variantId", value)
                                    }
                                />
                            </div>
                        </section>

                        {/* Price */}
                        <RangeFilter
                            title="Price range (₦)"
                            minValue={filters.minPrice}
                            maxValue={filters.maxPrice}
                            minPlaceholder="Min. price"
                            maxPlaceholder="Max. price"
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

                        {/* Year */}
                        <RangeFilter
                            title="Model year"
                            minValue={filters.minYear}
                            maxValue={filters.maxYear}
                            minPlaceholder="From year"
                            maxPlaceholder="To year"
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

                        {/* Mileage */}
                        <RangeFilter
                            title="Mileage (km)"
                            minValue={filters.minMileage}
                            maxValue={filters.maxMileage}
                            minPlaceholder="Min. km"
                            maxPlaceholder="Max. km"
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

                        {/* Vehicle details */}
                        <section className="space-y-4">
                            <SectionHeading
                                title="Vehicle details"
                                description="Narrow the results to match your preferences."
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
                        </section>

                        {/* Location */}
                        <section>
                            <SectionHeading
                                title="Location"
                                description="Find vehicles closer to you."
                            />

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
                                    autoComplete="address-level1"
                                    className={INPUT_CLASS}
                                />

                                <input
                                    value={filters.city}
                                    onChange={(event) =>
                                        onFilterChange(
                                            "city",
                                            event.target.value,
                                        )
                                    }
                                    placeholder="City or town"
                                    aria-label="Filter by city"
                                    autoComplete="address-level2"
                                    className={INPUT_CLASS}
                                />
                            </div>
                        </section>

                        {/* Seller preferences */}
                        <section className="border-t border-slate-100 pt-4">
                            <SectionHeading title="Seller preferences" />

                            <div className="-mx-2 space-y-1">
                                <ToggleFilter
                                    title="Dealer listings"
                                    description="Show vehicles listed by dealers."
                                    checked={filters.dealerOnly}
                                    onChange={(checked) =>
                                        onFilterChange("dealerOnly", checked)
                                    }
                                />

                                <ToggleFilter
                                    title="Verified dealers only"
                                    description="Only show listings from verified dealers."
                                    checked={filters.verifiedDealerOnly}
                                    onChange={(checked) =>
                                        onFilterChange(
                                            "verifiedDealerOnly",
                                            checked,
                                        )
                                    }
                                />
                            </div>
                        </section>
                    </div>
                </div>
            </div>

            {/* Mobile modal action bar */}
            {isModal && (
                <div className="shrink-0 border-t border-slate-200 bg-white p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:p-5">
                    <button
                        type="button"
                        onClick={onApply}
                        className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#1491FF] px-4 py-3.5 text-sm font-semibold text-white shadow-sm shadow-[#1491FF]/20 transition hover:bg-[#0876D1] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#1491FF]/20"
                    >
                        Show matching vehicles
                        <span aria-hidden="true">→</span>
                    </button>

                    <p className="mt-2 text-center text-xs text-slate-500">
                        {activeFilterCount > 0
                            ? `${activeFilterCount} filter${activeFilterCount === 1 ? "" : "s"} selected`
                            : "Choose your preferences to narrow the results."}
                    </p>
                </div>
            )}

            {/* Desktop sidebar action */}
            {!isModal && (
                <div className="hidden shrink-0 border-t border-slate-100 bg-white p-4 lg:block">
                    <button
                        type="button"
                        onClick={onApply}
                        className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#1491FF] px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-[#1491FF]/15 transition hover:bg-[#0876D1] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#1491FF]/20"
                    >
                        Apply filters
                        {activeFilterCount > 0 && (
                            <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs">
                                {activeFilterCount}
                            </span>
                        )}
                    </button>
                </div>
            )}
        </aside>
    );
}