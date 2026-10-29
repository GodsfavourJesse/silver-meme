import type { ApiResponse } from "@/app/types/api.types";
import { apiRequest } from "@/app/lib/api/api-client";
import { StartAdminSecurityChallengeResponse, SubmitAdminSecurityChallengeAnswerResponse } from "@/app/types/admin/admin-security-challenge.types";

const ADMIN_CHALLENGE_BASE = "/admin/auth/security-challenge";

function unwrapResponse<T>(response: ApiResponse<T>, fallback: string): T {
    if (!response.success) {
        throw new Error(
            response.error?.message ?? response.message ?? fallback,
        );
    }

    return response.data;
}

export const adminSecurityChallengeService = {
    async start(): Promise<StartAdminSecurityChallengeResponse> {
        const response = await apiRequest<ApiResponse<StartAdminSecurityChallengeResponse>>(
            `${ADMIN_CHALLENGE_BASE}/start`,
            {
                method: "POST",
                body: {},
            },
        );

        return unwrapResponse(
            response,
            "Unable to start the administrator security challenge.",
        );
    },

    async submitAnswer(input: {
        challengeToken: string;
        answer: string;
    }): Promise<SubmitAdminSecurityChallengeAnswerResponse> {
        const response = await apiRequest<ApiResponse<SubmitAdminSecurityChallengeAnswerResponse>>(
            `${ADMIN_CHALLENGE_BASE}/answer`,
            {
                method: "POST",
                body: input,
            },
        );

        return unwrapResponse(
            response,
            "Your answer could not be verified.",
        );
    },
};
