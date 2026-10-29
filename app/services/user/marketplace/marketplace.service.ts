import { apiRequest } from "@/app/lib/api/api-client";

import type {
    MarketplaceSearchParams,
    MarketplaceSearchResponse,
} from "@/app/types/user/marketplace.types";

import type {
    VehicleDetailsApiResponse,
    VehicleDetailsActionResponse,
    VehicleDetailsFavoriteStatusResponse,
    VehicleContactResponse,
    VehicleReportReason,
    VehicleSharePlatform,
} from "@/app/types/user/vehicle-details.types";
import { getUserCsrfToken } from "../auth/csrf.service";

const MARKETPLACE_ENDPOINT = "/marketplace/search";

const MARKETPLACE_LISTING_DETAILS_ENDPOINT =
    "/marketplace/listings";

const LISTINGS_ENDPOINT = "/listings";

function getListingEndpoint(
    listingId: string,
): string {
    if (!listingId.trim()) {
        throw new Error("A listing ID is required.");
    }

    return `${LISTINGS_ENDPOINT}/${encodeURIComponent(listingId)}`;
}

export async function searchMarketplace(
    params: MarketplaceSearchParams = {},
): Promise<MarketplaceSearchResponse> {
    const searchParams = new URLSearchParams();

    for (const [key, value] of Object.entries(params)) {
        if (
            value === undefined
            || value === null
            || value === ""
        ) {
            continue;
        }

        searchParams.set(key, String(value));
    }

    const queryString = searchParams.toString();

    const endpoint = queryString
        ? `${MARKETPLACE_ENDPOINT}?${queryString}`
        : MARKETPLACE_ENDPOINT;

    return apiRequest<MarketplaceSearchResponse>(
        endpoint,
        {
            method: "GET",
        },
    );
}

export async function getMarketplaceListingDetails(
    listingId: string,
): Promise<VehicleDetailsApiResponse> {
    if (!listingId.trim()) {
        throw new Error("A listing ID is required.");
    }

    return apiRequest<VehicleDetailsApiResponse>(
        `${MARKETPLACE_LISTING_DETAILS_ENDPOINT}/${encodeURIComponent(listingId)}`,
        {
            method: "GET",
        },
    );
}


export async function getListingFavoriteStatus(
    listingId: string,
): Promise<VehicleDetailsFavoriteStatusResponse> {
    return apiRequest<VehicleDetailsFavoriteStatusResponse>(
        `${getListingEndpoint(listingId)}/favorite`,
        {
            method: "GET",
        },
    );
}

export async function addListingToFavorites(
    listingId: string,
): Promise<VehicleDetailsActionResponse<{
    favorited: boolean;
}>> {
    const csrfToken = await getUserCsrfToken();

    return apiRequest(
        `${getListingEndpoint(listingId)}/favorite`,
        {
            method: "POST",
            csrfToken,
        },
    );
}

export async function removeListingFromFavorites(
    listingId: string,
): Promise<VehicleDetailsActionResponse<{
    favorited: boolean;
}>> {
    const csrfToken = await getUserCsrfToken();

    return apiRequest(
        `${getListingEndpoint(listingId)}/favorite`,
        {
            method: "DELETE",
            csrfToken,
        },
    );
}

export async function reportMarketplaceListing(
    listingId: string,
    input: {
        reason: VehicleReportReason;
        details?: string;
    },
): Promise<VehicleDetailsActionResponse<{
    report: {
        id: string;
        listingId: string;
        reason: VehicleReportReason;
        status: string;
        createdAt: string;
    };
}>> {
    const csrfToken = await getUserCsrfToken();

    return apiRequest(
        `${getListingEndpoint(listingId)}/report`,
        {
            method: "POST",
            csrfToken,
            body: input,
        },
    );
}

export async function contactMarketplaceSeller(
    listingId: string,
    message?: string,
): Promise<VehicleContactResponse> {
    const csrfToken = await getUserCsrfToken();

    const trimmedMessage = message?.trim();

    return apiRequest<VehicleContactResponse>(
        `${getListingEndpoint(listingId)}/contact`,
        {
            method: "POST",
            csrfToken,
            body: trimmedMessage
                ? {
                      message: trimmedMessage,
                  }
                : {},
        },
    );
}

export async function recordMarketplaceListingShare(
    listingId: string,
    platform: VehicleSharePlatform,
): Promise<void> {
    const csrfToken = await getUserCsrfToken();

    await apiRequest(
        `${getListingEndpoint(listingId)}/share`,
        {
            method: "POST",
            csrfToken,
            body: {
                platform,
            },
        },
    );
}