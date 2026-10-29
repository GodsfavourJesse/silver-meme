import { apiRequest } from "@/app/lib/api/api-client";

import type {
    VehicleCatalogResponse,
    VehicleGenerationOption,
    VehicleMakeOption,
    VehicleModelOption,
    VehicleSearchResult,
    VehicleVariantOption,
} from "@/app/types/user/listings/listing-form.types";

const VEHICLE_ENDPOINT = "/vehicles";

const DEFAULT_MARKET = true;
const DEFAULT_SEARCH_LIMIT = 50;

export interface VehicleModelYearOption {
    id: string;
    generationId: string;
    year: number;
    nigeriaMarket?: boolean;
    active?: boolean;
}

function buildQuery(
    params: Record<
        string,
        string | number | boolean | undefined
    >,
): string {
    const searchParams = new URLSearchParams();

    for (const [key, value] of Object.entries(params)) {
        if (value !== undefined) {
            searchParams.set(key, String(value));
        }
    }

    const query = searchParams.toString();

    return query ? `?${query}` : "";
}

function normalizeSearchQuery(query: string): string {
    return query.trim();
}

export async function getVehicleMakes(
    market = DEFAULT_MARKET,
): Promise<VehicleMakeOption[]> {
    const response = await apiRequest<
        VehicleCatalogResponse<{
            makes: VehicleMakeOption[];
        }>
    >(
        `${VEHICLE_ENDPOINT}/makes${buildQuery({
            market,
        })}`,
        {
            method: "GET",
        },
    );

    return response.data.makes;
}

export async function getVehicleModels(
    makeId: string,
    market = DEFAULT_MARKET,
): Promise<VehicleModelOption[]> {
    const normalizedMakeId = makeId.trim();

    if (!normalizedMakeId) {
        throw new Error("Select a vehicle make first.");
    }

    const response = await apiRequest<
        VehicleCatalogResponse<{
            models: VehicleModelOption[];
        }>
    >(
        `${VEHICLE_ENDPOINT}/makes/${encodeURIComponent(
            normalizedMakeId,
        )}/models${buildQuery({
            market,
        })}`,
        {
            method: "GET",
        },
    );

    return response.data.models;
}

export async function getVehicleGenerations(
    modelId: string,
    market = DEFAULT_MARKET,
): Promise<VehicleGenerationOption[]> {
    const normalizedModelId = modelId.trim();

    if (!normalizedModelId) {
        throw new Error("Select a vehicle model first.");
    }

    const response = await apiRequest<
        VehicleCatalogResponse<{
            generations: VehicleGenerationOption[];
        }>
    >(
        `${VEHICLE_ENDPOINT}/models/${encodeURIComponent(
            normalizedModelId,
        )}/generations${buildQuery({
            market,
        })}`,
        {
            method: "GET",
        },
    );

    return response.data.generations;
}

/**
 * Returns the actual model-year records belonging
 * to the selected vehicle generation.
 *
 * These records are independent of the variant list.
 */
export async function getVehicleModelYears(
    generationId: string,
    market = DEFAULT_MARKET,
): Promise<VehicleModelYearOption[]> {
    const normalizedGenerationId = generationId.trim();

    if (!normalizedGenerationId) {
        throw new Error(
            "Select a vehicle generation first.",
        );
    }

    const response = await apiRequest<
        VehicleCatalogResponse<{
            years: VehicleModelYearOption[];
        }>
    >(
        `${VEHICLE_ENDPOINT}/generations/${encodeURIComponent(
            normalizedGenerationId,
        )}/years${buildQuery({
            market,
        })}`,
        {
            method: "GET",
        },
    );

    return response.data.years;
}

/**
 * Returns variants belonging to the selected generation.
 *
 * When year is provided, the backend should return only
 * variants associated with that model year.
 */
export async function getVehicleVariants(
    generationId: string,
    options: {
        year?: number;
        market?: boolean;
    } = {},
): Promise<VehicleVariantOption[]> {
    const normalizedGenerationId = generationId.trim();

    if (!normalizedGenerationId) {
        throw new Error(
            "Select a vehicle generation first.",
        );
    }

    const response = await apiRequest<
        VehicleCatalogResponse<{
            variants: VehicleVariantOption[];
        }>
    >(
        `${VEHICLE_ENDPOINT}/generations/${encodeURIComponent(
            normalizedGenerationId,
        )}/variants${buildQuery({
            year: options.year,
            market: options.market ?? DEFAULT_MARKET,
        })}`,
        {
            method: "GET",
        },
    );

    return response.data.variants;
}

/**
 * Searches the vehicle catalog.
 */
export async function searchVehicleCatalog(
    query: string,
    options: {
        market?: boolean;
        limit?: number;
    } = {},
): Promise<VehicleSearchResult[]> {
    const normalizedQuery = normalizeSearchQuery(query);

    if (!normalizedQuery) {
        return [];
    }

    const requestedLimit =
        options.limit ?? DEFAULT_SEARCH_LIMIT;

    const limit = Math.min(
        Math.max(Math.trunc(requestedLimit), 1),
        100,
    );

    const response = await apiRequest<
        VehicleCatalogResponse<{
            vehicles: VehicleSearchResult[];
        }>
    >(
        `${VEHICLE_ENDPOINT}/search${buildQuery({
            q: normalizedQuery,
            market: options.market ?? DEFAULT_MARKET,
            limit,
        })}`,
        {
            method: "GET",
        },
    );

    return response.data.vehicles;
}