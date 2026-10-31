import { apiRequest } from "@/app/lib/api/api-client";
import type {
    AdminImageAnalysisRetryResponse,
    AdminImageReviewDecisionPayload,
    AdminImageReviewDecisionResponse,
    AdminImageReviewDetailResponse,
    AdminImageReviewListResponse,
    AdminImageReviewQuery,
} from "@/app/types/admin/adminImageReview.types";

// ============================================================
// API RESPONSE TYPES
// ============================================================

interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data: T;
}

// ============================================================
// ADMIN IMAGE REVIEW SERVICE
// ============================================================

class AdminImageReviewService {
    private readonly endpoint = "/api/v1/admin/image-review";

    /**
     * Get paginated image review queue.
     */
    async findAll(
        params: AdminImageReviewQuery,
    ): Promise<AdminImageReviewListResponse> {
        const searchParams = new URLSearchParams({
            status: params.status,
            page: String(params.page),
            limit: String(params.limit),
            sort: params.sort,
        });

        const response = await apiRequest<
            ApiResponse<AdminImageReviewListResponse>
        >(
            `${this.endpoint}?${searchParams.toString()}`,
            {
                method: "GET",
            },
        );

        return response.data;
    }

    /**
     * Get complete image review details.
     *
     * Includes:
     * - Image information
     * - Listing information
     * - Vehicle specifications
     * - Seller information
     * - Automated analysis
     * - Review history
     */
    async findById(
        imageId: string,
    ): Promise<AdminImageReviewDetailResponse> {
        const response = await apiRequest<
            ApiResponse<AdminImageReviewDetailResponse>
        >(
            `${this.endpoint}/${encodeURIComponent(imageId)}`,
            {
                method: "GET",
            },
        );

        return response.data;
    }

    /**
     * Submit administrator review decision.
     *
     * APPROVED
     * REJECTED
     * NEEDS_REVIEW
     */
    async submitDecision(
        imageId: string,
        payload: AdminImageReviewDecisionPayload,
    ): Promise<ApiResponse<AdminImageReviewDecisionResponse>> {
        return apiRequest<
            ApiResponse<AdminImageReviewDecisionResponse>
        >(
            `${this.endpoint}/${encodeURIComponent(imageId)}/decision`,
            {
                method: "POST",
                body: payload,
            },
        );
    }

    /**
     * Retry automated image analysis.
     */
    async retryAnalysis(
        imageId: string,
    ): Promise<ApiResponse<AdminImageAnalysisRetryResponse>> {
        return apiRequest<
            ApiResponse<AdminImageAnalysisRetryResponse>
        >(
            `${this.endpoint}/${encodeURIComponent(imageId)}/retry`,
            {
                method: "POST",
            },
        );
    }
}

// ============================================================
// SERVICE INSTANCE
// ============================================================

export const adminImageReviewService =
    new AdminImageReviewService();