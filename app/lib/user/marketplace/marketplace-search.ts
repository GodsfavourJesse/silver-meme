import type { MarketplaceSearchParams } from "@/app/types/user/marketplace.types";

/*
 * ============================================================
 * CONSTANTS
 * ============================================================
 */

export const PAGE_SIZE = 12;

export type SortOption = NonNullable<MarketplaceSearchParams["sort"]>;

export const SORT_OPTIONS: {
    label: string;
    value: SortOption;
}[] = [
    {
        label: "Newest first",
        value: "newest",
    },
    {
        label: "Price: low to high",
        value: "price_asc",
    },
    {
        label: "Price: high to low",
        value: "price_desc",
    },
    {
        label: "Most relevant",
        value: "relevance",
    },
];

export const CONDITION_OPTIONS = [
    "NEW",
    "FOREIGN_USED",
    "NIGERIAN_USED",
];

export const FUEL_OPTIONS = [
    "PETROL",
    "DIESEL",
    "ELECTRIC",
    "HYBRID",
];

export const TRANSMISSION_OPTIONS = [
    "AUTOMATIC",
    "MANUAL",
    "CVT",
];

export const BODY_STYLE_OPTIONS = [
    "SUV",
    "SEDAN",
    "HATCHBACK",
    "COUPE",
    "TRUCK",
    "VAN",
    "WAGON",
    "CONVERTIBLE",
];

/*
 * ============================================================
 * FILTER STATE
 * ============================================================
 */

export type MarketplaceFilterState = {
    makeId: string;
    modelId: string;
    generationId: string;
    variantId: string;

    minPrice: string;
    maxPrice: string;

    minMileage: string;
    maxMileage: string;

    minYear: string;
    maxYear: string;

    condition: string;
    fuelType: string;
    transmission: string;
    bodyStyle: string;

    state: string;
    city: string;

    dealerOnly: boolean;
    verifiedDealerOnly: boolean;
};

export const INITIAL_FILTERS: MarketplaceFilterState = {
    makeId: "",
    modelId: "",
    generationId: "",
    variantId: "",

    minPrice: "",
    maxPrice: "",

    minMileage: "",
    maxMileage: "",

    minYear: "",
    maxYear: "",

    condition: "",
    fuelType: "",
    transmission: "",
    bodyStyle: "",

    state: "",
    city: "",

    dealerOnly: false,
    verifiedDealerOnly: false,
};

export type MarketplaceFilterKey = keyof MarketplaceFilterState;

export function countActiveFilters(
    filters: MarketplaceFilterState,
): number {
    return Object.entries(filters).filter(([key, value]) => {
        if (
            key === "dealerOnly" ||
            key === "verifiedDealerOnly"
        ) {
            return value === true;
        }

        return (
            typeof value === "string" &&
            value.trim() !== ""
        );
    }).length;
}

/*
 * ============================================================
 * FILTER LABELS
 * ============================================================
 */

function formatOptionLabel(value: string): string {
    const labels: Record<string, string> = {
        NEW: "Brand new",
        FOREIGN_USED: "Foreign used",
        NIGERIAN_USED: "Nigerian used",

        PETROL: "Petrol",
        DIESEL: "Diesel",
        ELECTRIC: "Electric",
        HYBRID: "Hybrid",

        AUTOMATIC: "Automatic",
        MANUAL: "Manual",
        CVT: "CVT",

        SUV: "SUV",
        SEDAN: "Sedan",
        HATCHBACK: "Hatchback",
        COUPE: "Coupe",
        TRUCK: "Truck",
        VAN: "Van",
        WAGON: "Wagon",
        CONVERTIBLE: "Convertible",
    };

    return (
        labels[value] ??
        value
            .toLowerCase()
            .replaceAll("_", " ")
            .replace(/\b\w/g, (letter) =>
                letter.toUpperCase(),
            )
    );
}

function formatNaira(value: string): string {
    const amount = Number(value);

    if (!Number.isFinite(amount)) {
        return value;
    }

    return `₦${amount.toLocaleString("en-NG", {
        maximumFractionDigits: 2,
    })}`;
}

function formatMileage(value: string): string {
    const mileage = Number(value);

    if (!Number.isFinite(mileage)) {
        return value;
    }

    return `${mileage.toLocaleString("en-NG")} km`;
}

/*
 * ============================================================
 * ACTIVE FILTER CHIPS
 * ============================================================
 */

export interface ActiveMarketplaceFilter {
    key: MarketplaceFilterKey;
    label: string;
}

export interface MarketplaceVehicleFilterLabels {
    make?: string;
    model?: string;
    generation?: string;
    variant?: string;
}

export function getActiveMarketplaceFilters(
    filters: MarketplaceFilterState,
    vehicleLabels: MarketplaceVehicleFilterLabels = {},
): ActiveMarketplaceFilter[] {
    const activeFilters: ActiveMarketplaceFilter[] = [];

    /*
     * Vehicle catalog selections.
     *
     * Use actual catalog names when available.
     * Fall back to descriptive labels while catalog data loads.
     */

    if (filters.makeId) {
        activeFilters.push({
            key: "makeId",
            label: vehicleLabels.make || "Make selected",
        });
    }

    if (filters.modelId) {
        activeFilters.push({
            key: "modelId",
            label: vehicleLabels.model || "Model selected",
        });
    }

    if (filters.generationId) {
        activeFilters.push({
            key: "generationId",
            label: vehicleLabels.generation || "Generation selected",
        });
    }

    if (filters.variantId) {
        activeFilters.push({
            key: "variantId",
            label: vehicleLabels.variant || "Variant selected",
        });
    }

    /*
     * Price range.
     */

    if (filters.minPrice && filters.maxPrice) {
        activeFilters.push({
            key: "minPrice",
            label: `${formatNaira(filters.minPrice)} – ${formatNaira(filters.maxPrice)}`,
        });
    } else {
        if (filters.minPrice) {
            activeFilters.push({
                key: "minPrice",
                label: `From ${formatNaira(filters.minPrice)}`,
            });
        }

        if (filters.maxPrice) {
            activeFilters.push({
                key: "maxPrice",
                label: `Up to ${formatNaira(filters.maxPrice)}`,
            });
        }
    }

    /*
     * Mileage range.
     */

    if (filters.minMileage && filters.maxMileage) {
        activeFilters.push({
            key: "minMileage",
            label: `${formatMileage(filters.minMileage)} – ${formatMileage(filters.maxMileage)}`,
        });
    } else {
        if (filters.minMileage) {
            activeFilters.push({
                key: "minMileage",
                label: `From ${formatMileage(filters.minMileage)}`,
            });
        }

        if (filters.maxMileage) {
            activeFilters.push({
                key: "maxMileage",
                label: `Up to ${formatMileage(filters.maxMileage)}`,
            });
        }
    }

    /*
     * Model year range.
     */

    if (filters.minYear && filters.maxYear) {
        activeFilters.push({
            key: "minYear",
            label: `${filters.minYear} – ${filters.maxYear}`,
        });
    } else {
        if (filters.minYear) {
            activeFilters.push({
                key: "minYear",
                label: `From ${filters.minYear}`,
            });
        }

        if (filters.maxYear) {
            activeFilters.push({
                key: "maxYear",
                label: `Up to ${filters.maxYear}`,
            });
        }
    }

    /*
     * Vehicle condition and specifications.
     */

    const optionFilters: {
        key: MarketplaceFilterKey;
        value: string;
    }[] = [
        {
            key: "condition",
            value: filters.condition,
        },
        {
            key: "fuelType",
            value: filters.fuelType,
        },
        {
            key: "transmission",
            value: filters.transmission,
        },
        {
            key: "bodyStyle",
            value: filters.bodyStyle,
        },
    ];

    for (const filter of optionFilters) {
        if (!filter.value) {
            continue;
        }

        activeFilters.push({
            key: filter.key,
            label: formatOptionLabel(filter.value),
        });
    }

    /*
     * Location.
     */

    if (filters.state.trim()) {
        activeFilters.push({
            key: "state",
            label: filters.state.trim(),
        });
    }

    if (filters.city.trim()) {
        activeFilters.push({
            key: "city",
            label: filters.city.trim(),
        });
    }

    /*
     * Dealer filters.
     */

    if (filters.dealerOnly) {
        activeFilters.push({
            key: "dealerOnly",
            label: "Dealers only",
        });
    }

    if (filters.verifiedDealerOnly) {
        activeFilters.push({
            key: "verifiedDealerOnly",
            label: "Verified dealers",
        });
    }

    return activeFilters;
}

/*
 * ============================================================
 * QUERY BUILDING
 * ============================================================
 */

function toNumber(
    value: string,
): number | undefined {
    if (!value.trim()) {
        return undefined;
    }

    const number = Number(value);

    return Number.isFinite(number)
        ? number
        : undefined;
}

export function buildSearchParams(
    query: string,
    filters: MarketplaceFilterState,
    sort: SortOption,
    page: number,
): MarketplaceSearchParams {
    const params: MarketplaceSearchParams = {
        page,
        limit: PAGE_SIZE,
        sort,
    };

    const trimmedQuery = query.trim();

    if (trimmedQuery) {
        params.q = trimmedQuery;
    }

    /*
     * Vehicle catalog IDs.
     *
     * generationId is intentionally not submitted because
     * MarketplaceSearchParams does not currently support it.
     */

    if (filters.makeId) {
        params.makeId = filters.makeId;
    }

    if (filters.modelId) {
        params.modelId = filters.modelId;
    }

    if (filters.variantId) {
        params.variantId = filters.variantId;
    }

    /*
     * Numeric filters.
     */

    const numericFilters: {
        key:
            | "minPrice"
            | "maxPrice"
            | "minMileage"
            | "maxMileage"
            | "minYear"
            | "maxYear";
        value: string;
    }[] = [
        {
            key: "minPrice",
            value: filters.minPrice,
        },
        {
            key: "maxPrice",
            value: filters.maxPrice,
        },
        {
            key: "minMileage",
            value: filters.minMileage,
        },
        {
            key: "maxMileage",
            value: filters.maxMileage,
        },
        {
            key: "minYear",
            value: filters.minYear,
        },
        {
            key: "maxYear",
            value: filters.maxYear,
        },
    ];

    for (const filter of numericFilters) {
        const value = toNumber(filter.value);

        if (value !== undefined) {
            params[filter.key] = value;
        }
    }

    /*
     * Vehicle specifications.
     */

    if (filters.condition) {
        params.condition = filters.condition;
    }

    if (filters.fuelType) {
        params.fuelType = filters.fuelType;
    }

    if (filters.transmission) {
        params.transmission = filters.transmission;
    }

    if (filters.bodyStyle) {
        params.bodyStyle = filters.bodyStyle;
    }

    /*
     * Location.
     */

    if (filters.state.trim()) {
        params.state = filters.state.trim();
    }

    if (filters.city.trim()) {
        params.city = filters.city.trim();
    }

    /*
     * Dealer filters.
     */

    if (filters.dealerOnly) {
        params.dealerOnly = true;
    }

    if (filters.verifiedDealerOnly) {
        params.verifiedDealerOnly = true;
    }

    return params;
}

/*
 * ============================================================
 * URL SYNCHRONIZATION
 * ============================================================
 */

export function readFiltersFromUrl(): {
    query: string;
    filters: MarketplaceFilterState;
    sort: SortOption;
    page: number;
} {
    const params = new URLSearchParams(
        window.location.search,
    );

    const filters: MarketplaceFilterState = {
        makeId: params.get("makeId") ?? "",
        modelId: params.get("modelId") ?? "",
        generationId: params.get("generationId") ?? "",
        variantId: params.get("variantId") ?? "",

        minPrice: params.get("minPrice") ?? "",
        maxPrice: params.get("maxPrice") ?? "",

        minMileage: params.get("minMileage") ?? "",
        maxMileage: params.get("maxMileage") ?? "",

        minYear: params.get("minYear") ?? "",
        maxYear: params.get("maxYear") ?? "",

        condition: params.get("condition") ?? "",
        fuelType: params.get("fuelType") ?? "",
        transmission: params.get("transmission") ?? "",
        bodyStyle: params.get("bodyStyle") ?? "",

        state: params.get("state") ?? "",
        city: params.get("city") ?? "",

        dealerOnly: params.get("dealerOnly") === "true",
        verifiedDealerOnly:
            params.get("verifiedDealerOnly") === "true",
    };

    const requestedSort = params.get("sort");

    const validSort = SORT_OPTIONS.some(
        (option) => option.value === requestedSort,
    );

    const requestedPage = Number(
        params.get("page") ?? "1",
    );

    return {
        query: params.get("q") ?? "",
        filters,
        sort: validSort
            ? (requestedSort as SortOption)
            : "newest",
        page:
            Number.isInteger(requestedPage) &&
            requestedPage > 0
                ? requestedPage
                : 1,
    };
}