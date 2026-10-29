import { apiRequest } from "@/app/lib/api/api-client";

const AUTH_ENDPOINT = "/auth";

interface CsrfTokenResponse {
    success: boolean;
    data: {
        csrfToken: string;
    };
    message?: string;
}

export async function getUserCsrfToken(): Promise<string> {
    const response = await apiRequest<CsrfTokenResponse>(
        `${AUTH_ENDPOINT}/csrf-token`,
        {
            method: "GET",
        },
    );

    if (
        !response.success
        || !response.data?.csrfToken
    ) {
        throw new Error(
            response.message
                ?? "Unable to verify your session. Please sign in again.",
        );
    }

    return response.data.csrfToken;
}