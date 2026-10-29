import { apiRequest } from "@/app/lib/api/api-client";
import { getUserCsrfToken } from "../auth/csrf.service";

import type {
    ApplyAsDealerInput,
    ApplyAsDealerResponse,
    DealerAnalyticsResponse,
    DealerDocumentUrlResponse,
    DeleteDealerDocumentResponse,
    DealerEditableProfile,
    DealerProfileMutationResponse,
    DealerProfileResponse,
    GetDealerDocumentsResponse,
    PublicDealerListingsResponse,
    PublicDealerProfileResponse,
    UploadDealerDocumentInput,
    UploadDealerDocumentResponse,
    PublicDealersQuery,
    PublicDealersResponse,
} from "@/app/types/user/dealer/dealer.types";

const DEALERS_ENDPOINT = "/dealers";

// ============================================================
// DEALER APPLICATION
// ============================================================

async function applyAsDealer(
    input: ApplyAsDealerInput,
): Promise<ApplyAsDealerResponse> {
    const csrfToken = await getUserCsrfToken();

    return apiRequest<ApplyAsDealerResponse>(
        `${DEALERS_ENDPOINT}/apply`,
        {
            method: "POST",
            csrfToken,
            body: input,
        },
    );
}

// ============================================================
// DEALER DOCUMENTS
// ============================================================

async function uploadDealerDocument(
    input: UploadDealerDocumentInput,
): Promise<UploadDealerDocumentResponse> {
    const csrfToken = await getUserCsrfToken();

    const formData = new FormData();

    formData.append("file", input.file);
    formData.append("documentType", input.documentType);

    return apiRequest<UploadDealerDocumentResponse>(
        `${DEALERS_ENDPOINT}/applications/${encodeURIComponent(input.applicationId)}/documents`,
        {
            method: "POST",
            csrfToken,
            body: formData,
        },
    );
}

async function getDealerDocuments(
    applicationId: string,
): Promise<GetDealerDocumentsResponse> {
    return apiRequest<GetDealerDocumentsResponse>(
        `${DEALERS_ENDPOINT}/applications/${encodeURIComponent(applicationId)}/documents`,
        {
            method: "GET",
        },
    );
}

async function getDealerDocumentUrl(
    documentId: string,
): Promise<DealerDocumentUrlResponse> {
    return apiRequest<DealerDocumentUrlResponse>(
        `${DEALERS_ENDPOINT}/documents/${encodeURIComponent(documentId)}/url`,
        {
            method: "GET",
        },
    );
}

async function deleteDealerDocument(
    documentId: string,
): Promise<DeleteDealerDocumentResponse> {
    const csrfToken = await getUserCsrfToken();

    return apiRequest<DeleteDealerDocumentResponse>(
        `${DEALERS_ENDPOINT}/documents/${encodeURIComponent(documentId)}`,
        {
            method: "DELETE",
            csrfToken,
        },
    );
}

// ============================================================
// DEALER ANALYTICS
// ============================================================

async function getDealerAnalytics(): Promise<DealerAnalyticsResponse> {
    return apiRequest<DealerAnalyticsResponse>(
        `${DEALERS_ENDPOINT}/me/analytics`,
        {
            method: "GET",
        },
    );
}

// ============================================================
// PUBLIC DEALER PROFILE
// ============================================================

async function getPublicDealerProfile(
    dealerId: string,
): Promise<PublicDealerProfileResponse> {
    return apiRequest<PublicDealerProfileResponse>(
        `${DEALERS_ENDPOINT}/${encodeURIComponent(dealerId)}`,
        {
            method: "GET",
        },
    );
}

async function getPublicDealers(
    query: PublicDealersQuery = {},
): Promise<PublicDealersResponse> {
    const params = new URLSearchParams({
        page: String(query.page ?? 1),
        limit: String(query.limit ?? 12),
    });

    const search = query.search?.trim();

    if (search) {
        params.set("search", search);
    }

    return apiRequest<PublicDealersResponse>(
        `${DEALERS_ENDPOINT}?${params.toString()}`,
        {
            method: "GET",
        },
    );
}


async function getPublicDealerListings(
    dealerId: string,
    page = 1,
    limit = 12,
): Promise<PublicDealerListingsResponse> {
    const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
    });

    return apiRequest<PublicDealerListingsResponse>(
        `${DEALERS_ENDPOINT}/${encodeURIComponent(dealerId)}/listings?${params.toString()}`,
        {
            method: "GET",
        },
    );
}

// ============================================================
// DEALER PROFILE SETTINGS
// ============================================================

async function getMyProfile(): Promise<DealerProfileResponse> {
    return apiRequest<DealerProfileResponse>(
        `${DEALERS_ENDPOINT}/me/profile`,
        {
            method: "GET",
        },
    );
}

async function updateMyBio(
    bio: string,
): Promise<DealerProfileMutationResponse> {
    const csrfToken = await getUserCsrfToken();

    return apiRequest<DealerProfileMutationResponse>(
        `${DEALERS_ENDPOINT}/me/profile`,
        {
            method: "PATCH",
            csrfToken,
            body: {
                bio,
            },
        },
    );
}

async function uploadMyProfilePicture(
    file: File,
): Promise<DealerProfileMutationResponse> {
    const csrfToken = await getUserCsrfToken();

    const formData = new FormData();

    formData.append("file", file);

    return apiRequest<DealerProfileMutationResponse>(
        `${DEALERS_ENDPOINT}/me/profile-picture`,
        {
            method: "POST",
            csrfToken,
            body: formData,
        },
    );
}

async function uploadMyCoverPhoto(
    file: File,
): Promise<DealerProfileMutationResponse> {
    const csrfToken = await getUserCsrfToken();

    const formData = new FormData();

    formData.append("file", file);

    return apiRequest<DealerProfileMutationResponse>(
        `${DEALERS_ENDPOINT}/me/cover-photo`,
        {
            method: "POST",
            csrfToken,
            body: formData,
        },
    );
}
// ============================================================
// EXPORT
// ============================================================

export const dealerService = {
    applyAsDealer,

    uploadDealerDocument,
    getDealerDocuments,
    getDealerDocumentUrl,
    deleteDealerDocument,

    getDealerAnalytics,

    // Public dealer directory and profile
    getPublicDealers,
    getPublicDealerProfile,
    getPublicDealerListings,

    // Dealer profile settings
    getMyProfile,
    updateMyBio,
    uploadMyProfilePicture,
    uploadMyCoverPhoto,
};