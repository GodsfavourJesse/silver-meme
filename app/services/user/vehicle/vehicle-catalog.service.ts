import { apiRequest } from "@/app/lib/api/api-client";

import type {
    MarketplaceMake,
    MarketplaceModel,
    MarketplaceGeneration,
    MarketplaceVariant,
} from "@/app/types/user/marketplace.types";

interface VehicleCatalogResponse<T> {
    success: boolean;
    data: T[];
}

const VEHICLE_ENDPOINT = "/api/v1/vehicles";

async function fetchCatalogItems<T>(
    endpoint: string,
): Promise<T[]> {
    const response = await apiRequest<
        VehicleCatalogResponse<T>
    >(endpoint, {
        method: "GET",
    });

    if (
        !response ||
        response.success !== true ||
        !Array.isArray(response.data)
    ) {
        throw new Error(
            "The vehicle catalog returned an invalid response.",
        );
    }

    return response.data;
}

export async function getVehicleMakes(): Promise<
    MarketplaceMake[]
> {
    return fetchCatalogItems<MarketplaceMake>(
        `${VEHICLE_ENDPOINT}/makes?market=true`,
    );
}

export async function getVehicleModels(
    makeId: string,
): Promise<MarketplaceModel[]> {
    return fetchCatalogItems<MarketplaceModel>(
        `${VEHICLE_ENDPOINT}/makes/${encodeURIComponent(makeId)}/models`,
    );
}

export async function getVehicleGenerations(
    modelId: string,
): Promise<MarketplaceGeneration[]> {
    return fetchCatalogItems<MarketplaceGeneration>(
        `${VEHICLE_ENDPOINT}/models/${encodeURIComponent(modelId)}/generations`,
    );
}

export async function getVehicleVariants(
    generationId: string,
): Promise<MarketplaceVariant[]> {
    return fetchCatalogItems<MarketplaceVariant>(
        `${VEHICLE_ENDPOINT}/generations/${encodeURIComponent(generationId)}/variants`,
    );
}