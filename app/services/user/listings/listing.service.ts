import { apiRequest } from "@/app/lib/api/api-client";

import type {
    CreateListingPayload,
} from "@/app/types/user/listings/listing-form.types";

import type {
    ListingDashboardParams,
    ListingMutationResponse,
    ListingRecord,
    ListingStatus,
    SellerListingsResponse,
} from "@/app/types/user/listings/listing.types";
import type { ImageAnalysisEnqueueResponse, ImageAnalysisStatusResponse, ListingImageUploadResponse } from "@/app/types/user/listings/listing-image.types";
import type { ListingSubmitResponse, SellerListingDetailResponse } from "@/app/types/user/listings/listing-editor.types";
import { SELLER_LISTING_ACTIONS, type SellerListingAction } from "@/app/types/user/listings/listing-actions.types";
import { getUserCsrfToken } from "../auth/csrf.service";

const LISTINGS_ENDPOINT = "/listings";

/**
 * Creates a draft listing.
 *
 * The Idempotency-Key prevents duplicate creation when a request
 * is retried using the same key.
 */
export async function createSellerListing(
    payload: CreateListingPayload,
    idempotencyKey: string = crypto.randomUUID(),
): Promise<ListingMutationResponse> {
    const csrfToken = await getUserCsrfToken();

    const normalizedKey = idempotencyKey.trim();

    if (!normalizedKey) {
        throw new Error(
            "An idempotency key is required to create a listing.",
        );
    }

    return apiRequest<ListingMutationResponse>(
        LISTINGS_ENDPOINT,
        {
            method: "POST",
            csrfToken,
            headers: {
                "Idempotency-Key": normalizedKey,
            },
            body: payload,
        },
    );
}

function buildDashboardQuery(
    params: ListingDashboardParams = {},
): string {
    const query = new URLSearchParams();

    query.set(
        "page",
        String(params.page ?? 1),
    );

    query.set(
        "limit",
        String(params.limit ?? 20),
    );

    if (params.status) {
        query.set(
            "status",
            params.status,
        );
    }

    // Request deleted listings only when explicitly enabled.
    if (params.includeDeleted) {
        query.set(
            "status",
            "DELETED",
        );
    }

    return query.toString();
}

export async function getSellerListings(
    params: ListingDashboardParams = {},
): Promise<SellerListingsResponse> {
    const query = buildDashboardQuery(params);

    return apiRequest<SellerListingsResponse>(
        `${LISTINGS_ENDPOINT}/dashboard?${query}`,
        {
            method: "GET",
        },
    );
}

async function postListingAction(
    listingId: string,
    action: "submit" | "sold" | "reactivate" | "restore",
): Promise<ListingMutationResponse> {
    const csrfToken = await getUserCsrfToken();

    return apiRequest<ListingMutationResponse>(
        `${LISTINGS_ENDPOINT}/${encodeURIComponent(listingId)}/${action}`,
        {
            method: "POST",
            csrfToken,
        },
    );
}

export async function submitListingForReview(
    listingId: string,
): Promise<ListingMutationResponse> {
    return postListingAction(listingId, "submit");
}

export async function markListingAsSold(
    listingId: string,
): Promise<ListingMutationResponse> {
    return postListingAction(listingId, "sold");
}

export async function reactivateListing(
    listingId: string,
): Promise<ListingMutationResponse> {
    return postListingAction(listingId, "reactivate");
}

export async function restoreListing(
    listingId: string,
): Promise<ListingMutationResponse> {
    return postListingAction(listingId, "restore");
}

export async function updateSellerListing(
    listingId: string,
    input: Partial<Pick<
        ListingRecord,
        | "vehicleVariantId"
        | "title"
        | "description"
        | "price"
        | "currency"
        | "mileage"
        | "condition"
        | "country"
        | "state"
        | "city"
    >>,
): Promise<ListingMutationResponse> {
    const csrfToken = await getUserCsrfToken();

    return apiRequest<ListingMutationResponse>(
        `${LISTINGS_ENDPOINT}/${encodeURIComponent(listingId)}`,
        {
            method: "PATCH",
            csrfToken,
            body: input,
        },
    );
}

export async function deleteSellerListing(
    listingId: string,
): Promise<ListingMutationResponse> {
    const csrfToken = await getUserCsrfToken();

    return apiRequest<ListingMutationResponse>(
        `${LISTINGS_ENDPOINT}/${encodeURIComponent(listingId)}`,
        {
            method: "DELETE",
            csrfToken,
        },
    );
}

export type { ListingStatus };


/* =========================================================
   LISTING IMAGE UPLOAD
========================================================= */

/**
 * Uploads a vehicle photo to an existing draft listing.
 *
 * The browser generates the multipart Content-Type header.
 * Do not manually set Content-Type when using FormData.
 */
export async function uploadListingImage(
    listingId: string,
    file: File,
    sortOrder: number,
): Promise<ListingImageUploadResponse> {
    if (!listingId.trim()) {
        throw new Error(
            "A listing ID is required to upload a photo.",
        );
    }

    if (!(file instanceof File)) {
        throw new Error(
            "Select a valid image before uploading.",
        );
    }

    if (!Number.isInteger(sortOrder) || sortOrder < 0) {
        throw new Error(
            "The image position is invalid.",
        );
    }

    const formData = new FormData();

    formData.append("file", file);
    formData.append("sortOrder", String(sortOrder));

    const csrfToken = await getUserCsrfToken();

    return apiRequest<ListingImageUploadResponse>(
        `${LISTINGS_ENDPOINT}/${encodeURIComponent(listingId)}/images`,
        {
            method: "POST",
            csrfToken,
            body: formData,
        },
    );
}

/**
 * Requests image analysis using the backend's image-intelligence
 * job system.
 *
 * This endpoint queues analysis; it does not mean the analysis
 * has already completed.
 */
export async function requestListingImageAnalysis(
    listingId: string,
    imageId: string,
): Promise<ImageAnalysisEnqueueResponse> {
    if (!listingId.trim() || !imageId.trim()) {
        throw new Error(
            "Both the listing ID and image ID are required.",
        );
    }

    const csrfToken = await getUserCsrfToken();

    return apiRequest<ImageAnalysisEnqueueResponse>(
        `/image-intelligence/listings/${encodeURIComponent(listingId)}/images/${encodeURIComponent(imageId)}/analyze`,
        {
            method: "POST",
            csrfToken,
        },
    );
}

/**
 * Retrieves the latest analysis job, run, and individual
 * intelligence results for a listing image.
 */
export async function getListingImageAnalysis(
    listingId: string,
    imageId: string,
): Promise<ImageAnalysisStatusResponse> {
    if (!listingId.trim() || !imageId.trim()) {
        throw new Error(
            "Both the listing ID and image ID are required.",
        );
    }

    return apiRequest<ImageAnalysisStatusResponse>(
        `/image-intelligence/listings/${encodeURIComponent(listingId)}/images/${encodeURIComponent(imageId)}/analysis`,
        {
            method: "GET",
        },
    );
}


/* =========================================================
   LISTING EDITOR
========================================================= */


/**
 * Loads a single listing for the authenticated seller.
 *
 * The backend must enforce ownership; the frontend must not
 * rely on hiding listing IDs as an authorization mechanism.
 */
// export async function getSellerListingDetail(
//     listingId: string,
// ): Promise<SellerListingDetailResponse> {
//     if (!listingId.trim()) {
//         throw new Error("A listing ID is required.");
//     }

//     return apiRequest<SellerListingDetailResponse>(
//         `${LISTINGS_ENDPOINT}/${encodeURIComponent(listingId)}`,
//         {
//             method: "GET",
//         },
//     );
// }

export async function getSellerListingDetail(
    listingId: string,
): Promise<SellerListingDetailResponse> {
    if (!listingId.trim()) {
        throw new Error("A listing ID is required.");
    }

    const response = await apiRequest<SellerListingDetailResponse>(
        `${LISTINGS_ENDPOINT}/${encodeURIComponent(listingId)}`,
        {
            method: "GET",
        },
    );

    console.log(
        "[getSellerListingDetail] Response:",
        response,
    );

    return response;
}

/**
 * Submits a listing for administrative review.
 *
 * The backend remains responsible for checking listing status,
 * required fields, image requirements, and other eligibility rules.
 */
export async function submitSellerListing(
    listingId: string,
): Promise<ListingSubmitResponse> {
    if (!listingId.trim()) {
        throw new Error("A listing ID is required.");
    }

    const csrfToken = await getUserCsrfToken();

    return apiRequest<ListingSubmitResponse>(
        `${LISTINGS_ENDPOINT}/${encodeURIComponent(listingId)}/submit`,
        {
            method: "POST",
            csrfToken,
        },
    );
}


/* =========================================================
   MY LISTINGS DASHBOARD ACTIONS
========================================================= */


/**
 * Performs a listing lifecycle action.
 *
 * The backend determines whether the action is permitted
 * for the listing's current status and authenticated owner.
 */
export async function performSellerListingAction(
    listingId: string,
    action: SellerListingAction,
): Promise<ListingMutationResponse> {
    if (!listingId.trim()) {
        throw new Error("A listing ID is required.");
    }

    const endpointAction = SELLER_LISTING_ACTIONS[action];

    const csrfToken = await getUserCsrfToken();

    return apiRequest<ListingMutationResponse>(
        `${LISTINGS_ENDPOINT}/${encodeURIComponent(listingId)}/${endpointAction}`,
        {
            method: "POST",
            csrfToken,
        },
    );
}

/**

* Retries image analysis after a confirmed automated-analysis failure.
*
* The backend validates listing ownership, image status,
* and retry eligibility before queuing another job.
  */
export async function retrySellerImageAnalysis(
    listingId: string,
    imageId: string,
): Promise<ImageAnalysisEnqueueResponse> {
    if (!listingId.trim() || !imageId.trim()) {
        throw new Error(
            "Both the listing ID and image ID are required.",
        );
    }

    const csrfToken = await getUserCsrfToken();

    return apiRequest<ImageAnalysisEnqueueResponse>(
        `${LISTINGS_ENDPOINT}/${encodeURIComponent(listingId)}/images/${encodeURIComponent(imageId)}/retry-analysis`,
        {
            method: "POST",
            csrfToken,
        },
    );
}
