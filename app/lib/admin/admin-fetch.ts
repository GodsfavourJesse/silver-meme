import { ApiError } from "@/app/lib/api/api-error";

const API_ORIGIN =
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export const ADMIN_API_URL = `${API_ORIGIN}/api/v1/admin`;

export interface ApiEnvelope<T> {
    success: boolean;
    message?: string;
    data: T;
}

interface AdminFetchOptions {
    method?: "GET" | "POST" | "PATCH" | "DELETE";
    query?: Record<string, string | number | undefined>;
    body?: unknown;
    okStatuses?: number[];
    signal?: AbortSignal;
}

let csrfTokenCache: string | null = null;

export function clearAdminCsrfCache(): void {
    csrfTokenCache = null;
}

function createApiError(
    message: string,
    status: number,
    details: { code?: string; requestId?: string } = {},
): ApiError {
    return new ApiError(message, {
        status,
        ...details,
    });
}

async function getCsrfToken(): Promise<string> {
    if (csrfTokenCache) {
        return csrfTokenCache;
    }

    let response: Response;

    try {
        response = await fetch(
            `${ADMIN_API_URL}/auth/csrf-token`,
            {
                credentials: "include",
                headers: {
                    Accept: "application/json",
                },
            },
        );
    } catch {
        throw createApiError(
            "Unable to connect to the server. Please try again.",
            0,
        );
    }

    const payload = await response.json().catch(() => null);
    const token = payload?.data?.csrfToken;

    if (!response.ok || typeof token !== "string") {
        throw createApiError(
            payload?.error?.message ??
                payload?.message ??
                "Unable to verify your session.",
            response.status,
        );
    }

    csrfTokenCache = token;

    return token;
}

export async function adminFetch<T>(
    path: string,
    options: AdminFetchOptions = {},
): Promise<ApiEnvelope<T>> {
    const {
        method = "GET",
        query,
        body,
        okStatuses = [],
        signal,
    } = options;

    const url = new URL(`${ADMIN_API_URL}${path}`);

    if (query) {
        for (const [key, value] of Object.entries(query)) {
            if (value !== undefined) {
                url.searchParams.set(key, String(value));
            }
        }
    }

    const headers: Record<string, string> = {
        Accept: "application/json",
    };

    if (body !== undefined) {
        headers["Content-Type"] = "application/json";
    }

    if (method !== "GET") {
        headers["X-CSRF-Token"] = await getCsrfToken();
    }

    let response: Response;

    try {
        response = await fetch(url, {
            method,
            headers,
            credentials: "include",
            ...(body !== undefined
                ? { body: JSON.stringify(body) }
                : {}),
            ...(signal ? { signal } : {}),
        });
    } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
            throw error;
        }

        throw createApiError(
            "Unable to connect to the server. Please try again.",
            0,
        );
    }

    const payload = await response.json().catch(() => null);

    if (!response.ok && !okStatuses.includes(response.status)) {
        const requestId =
            typeof payload?.requestId === "string"
                ? payload.requestId
                : undefined;

        const code =
            typeof payload?.error?.code === "string"
                ? payload.error.code
                : undefined;

        const message =
            response.status >= 500
                ? "The server could not complete this request. Please try again."
                : payload?.error?.message ??
                  payload?.message ??
                  "The request could not be completed.";

        throw createApiError(message, response.status, {
            ...(code ? { code } : {}),
            ...(requestId ? { requestId } : {}),
        });
    }

    return payload as ApiEnvelope<T>;
}