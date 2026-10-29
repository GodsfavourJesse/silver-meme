import { apiRequest } from "@/app/lib/api/api-client";

import type {
    AdminDealerDocumentPreview,
    DealerApplicationFilter,
    DealerApplicationReviewResponse,
    DealerApplicationsResponse,
    DealerDocumentPreviewResponse,
    DealerDocumentReviewResponse,
    ReviewDealerPayload,
} from "@/app/types/admin/admin-dealers.types";

const BASE_PATH = "/admin/dealers";

export const adminDealerService = {
    // ========================================================
    // GET DEALER APPLICATIONS
    // ========================================================

    /**
     * Retrieve dealer applications.
     *
     * Defaults to pending applications.
     * Pass ALL to retrieve all statuses.
     *
     * Pagination is handled by the backend.
     */
    async getApplications(
        status: DealerApplicationFilter = "PENDING",
        page = 1,
        limit = 20,
    ): Promise<DealerApplicationsResponse> {
        const params = new URLSearchParams({
            status,
            page: String(page),
            limit: String(limit),
        });

        return apiRequest<DealerApplicationsResponse>(
            `${BASE_PATH}/applications?${params.toString()}`,
            {
                method: "GET",
            },
        );
    },

    // ========================================================
    // REVIEW DEALER APPLICATION
    // ========================================================

    /**
     * Approve or reject a dealer application.
     *
     * Rejection requires a reason.
     */
    async reviewApplication(
        applicationId: string,
        payload: ReviewDealerPayload,
        csrfToken: string,
    ): Promise<DealerApplicationReviewResponse> {
        return apiRequest<DealerApplicationReviewResponse>(
            `${BASE_PATH}/applications/${encodeURIComponent(
                applicationId,
            )}`,
            {
                method: "PATCH",
                body: payload,
                csrfToken,
            },
        );
    },

    // ========================================================
    // REVIEW DEALER DOCUMENT
    // ========================================================

    /**
     * Approve or reject an individual verification document.
     *
     * Rejection requires a reason.
     */
    async reviewDocument(
        documentId: string,
        payload: ReviewDealerPayload,
        csrfToken: string,
    ): Promise<DealerDocumentReviewResponse> {
        return apiRequest<DealerDocumentReviewResponse>(
            `${BASE_PATH}/documents/${encodeURIComponent(
                documentId,
            )}/review`,
            {
                method: "PATCH",
                body: payload,
                csrfToken,
            },
        );
    },

    // ========================================================
    // GET DOCUMENT PREVIEW
    // ========================================================

    /**
     * Retrieve a temporary, authorized document preview URL.
     *
     * The apiRequest client should handle the API base URL,
     * including the /api/v1 prefix, consistently with the
     * rest of your application.
     */
    async getDocumentPreview(
        documentId: string,
    ): Promise<DealerDocumentPreviewResponse> {
        return apiRequest<DealerDocumentPreviewResponse>(
            `${BASE_PATH}/documents/${encodeURIComponent(
                documentId,
            )}/url`,
            {
                method: "GET",
            },
        );
    },
};

/**
 * Convenience helper for components that need the preview
 * document directly instead of the complete API response.
 */
export async function getDocumentPreview(
    documentId: string,
): Promise<AdminDealerDocumentPreview> {
    const response =
        await adminDealerService.getDocumentPreview(documentId);

    return response.data.document;
}