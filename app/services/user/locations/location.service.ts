import { apiRequest } from "@/app/lib/api/api-client";

interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data: T;
}

export interface NigerianStateLgas {
    state: string;
    lgas: string[];
}

const LOCATIONS_ENDPOINT = "/locations";

/**
 * Retrieves all Nigerian states and the FCT.
 */
export async function getNigerianStates(
    signal?: AbortSignal,
): Promise<string[]> {
    const response = await apiRequest<ApiResponse<string[]>>(
        `${LOCATIONS_ENDPOINT}/states`,
        {
            method: "GET",
            signal,
        },
    );

    if (!response?.success || !Array.isArray(response.data)) {
        throw new Error(
            response?.message || "Unable to retrieve Nigerian states.",
        );
    }

    return response.data;
}

/**
 * Retrieves all LGAs belonging to a selected Nigerian state.
 */
export async function getLgasByState(
    state: string,
    signal?: AbortSignal,
): Promise<string[]> {
    const normalizedState = state.trim();

    if (!normalizedState) {
        return [];
    }

    const response = await apiRequest<ApiResponse<NigerianStateLgas>>(
        `${LOCATIONS_ENDPOINT}/states/${encodeURIComponent(normalizedState)}/lgas`,
        {
            method: "GET",
            signal,
        },
    );

    if (
        !response?.success ||
        !response.data ||
        !Array.isArray(response.data.lgas)
    ) {
        throw new Error(
            response?.message || "Unable to retrieve LGAs.",
        );
    }

    return response.data.lgas;
}