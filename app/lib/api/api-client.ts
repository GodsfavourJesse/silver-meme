import { ApiError } from "./api-error";

/**
 * API configuration
 *
 * NEXT_PUBLIC_API_BASE_URL must include /api/v1.
 *
 * Development:
 * http://localhost:4000/api/v1
 *
 * Production:
 * https://your-karmass-backend.onrender.com/api/v1
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(
    /\/+$/,
    "",
);

function getApiBaseUrl(): string {
    if (API_BASE_URL) {
        return API_BASE_URL;
    }

    if (process.env.NODE_ENV === "development") {
        return "http://localhost:4000/api/v1";
    }

    throw new Error(
        "NEXT_PUBLIC_API_BASE_URL is not configured.",
    );
}

// ============================================
// TYPES
// ============================================

export interface ApiEnvelope<T> {
    success: boolean;
    message?: string;
    data: T;
}

export interface ApiRequestOptions
    extends Omit<RequestInit, "body"> {
    body?: unknown;

    query?: Record<
        string,
        string | number | boolean | undefined | null
    >;

    csrfToken?: string;

    /**
     * Automatically retrieve a CSRF token
     * before making a request.
     */
    csrf?: boolean;

    /**
     * CSRF endpoint used for automatic retrieval.
     */
    csrfPath?: string;

    /**
     * HTTP statuses that should not throw an error.
     */
    okStatuses?: number[];
}

// ============================================
// CSRF TOKEN MANAGEMENT
// ============================================

const csrfTokenCache = new Map<string, string>();

export function clearCsrfTokenCache(): void {
    csrfTokenCache.clear();
}

/**
 * Backward-compatible alias.
 */
export const clearAdminCsrfCache = clearCsrfTokenCache;

async function getCsrfToken(
    csrfPath: string,
): Promise<string> {
    const cachedToken = csrfTokenCache.get(csrfPath);

    if (cachedToken) {
        return cachedToken;
    }

    let response: Response;

    try {
        response = await fetch(
            `${getApiBaseUrl()}${csrfPath.startsWith("/") ? csrfPath : `/${csrfPath}`}`,
            {
                method: "GET",
                credentials: "include",
                headers: {
                    Accept: "application/json",
                },
                cache: "no-store",
            },
        );
    } catch {
        throw new ApiError(
            "Unable to connect to the server. Please try again.",
            {
                status: 0,
                code: "NETWORK_ERROR",
            },
        );
    }

    const payload = await response.json().catch(() => null);

    const token = payload?.data?.csrfToken;

    if (!response.ok || typeof token !== "string") {
        throw new ApiError(
            payload?.error?.message ??
                payload?.message ??
                "Unable to verify your session.",
            {
                status: response.status,
                ...(typeof payload?.error?.code === "string"
                    ? { code: payload.error.code }
                    : {}),
            },
        );
    }

    csrfTokenCache.set(csrfPath, token);

    return token;
}

// ============================================
// RESPONSE HELPERS
// ============================================

function isJsonContentType(
    contentType: string | null,
): boolean {
    return Boolean(
        contentType?.includes("application/json"),
    );
}

function buildRequestUrl(
    path: string,
    query?: ApiRequestOptions["query"],
): string {
    const normalizedPath = path.startsWith("/")
        ? path
        : `/${path}`;

    const url = new URL(
        `${getApiBaseUrl()}${normalizedPath}`,
    );

    if (query) {
        for (const [key, value] of Object.entries(query)) {
            if (value !== undefined && value !== null) {
                url.searchParams.set(key, String(value));
            }
        }
    }

    return url.toString();
}

function createApiError(
    message: string,
    status: number,
    details: {
        code?: string;
        requestId?: string;
    } = {},
): ApiError {
    return new ApiError(message, {
        status,
        ...details,
    });
}

// ============================================
// SHARED API REQUEST
// ============================================

export async function apiRequest<T>(
    path: string,
    options: ApiRequestOptions = {},
): Promise<T> {
    const {
        body,
        query,
        csrfToken,
        csrf = false,
        csrfPath = "/admin/auth/csrf-token",
        okStatuses = [],
        headers: suppliedHeaders,
        method = "GET",
        ...requestOptions
    } = options;

    const headers = new Headers(suppliedHeaders);

    headers.set("Accept", "application/json");

    if (
        body !== undefined &&
        !(body instanceof FormData)
    ) {
        headers.set(
            "Content-Type",
            "application/json",
        );
    }

    if (csrfToken) {
        headers.set("X-CSRF-Token", csrfToken);
    } else if (csrf && method !== "GET" && method !== "HEAD") {
        const token = await getCsrfToken(csrfPath);

        headers.set("X-CSRF-Token", token);
    }

    let response: Response;

    try {
        response = await fetch(
            buildRequestUrl(path, query),
            {
                ...requestOptions,
                method,
                headers,
                body:
                    body === undefined
                        ? undefined
                        : body instanceof FormData
                          ? body
                          : JSON.stringify(body),
                credentials: "include",
                cache: "no-store",
            },
        );
    } catch (error) {
        if (
            error instanceof DOMException &&
            error.name === "AbortError"
        ) {
            throw error;
        }

        throw createApiError(
            "Unable to connect to the KARMASS server. Check your connection and try again.",
            0,
            {
                code: "NETWORK_ERROR",
            },
        );
    }

    // ========================================
    // PARSE RESPONSE
    // ========================================

    let responseBody: unknown;

    if (response.status !== 204) {
        if (isJsonContentType(
            response.headers.get("content-type"),
        )) {
            try {
                responseBody = await response.json();
            } catch {
                throw createApiError(
                    "The server returned an invalid response.",
                    response.status,
                    {
                        code: "INVALID_RESPONSE",
                    },
                );
            }
        } else {
            const text = await response.text();

            responseBody = text
                ? { message: text }
                : undefined;
        }
    }

    // ========================================
    // HANDLE ERRORS
    // ========================================

    if (
        !response.ok &&
        !okStatuses.includes(response.status)
    ) {
        const payload =
            typeof responseBody === "object" &&
            responseBody !== null
                ? responseBody as {
                      message?: unknown;
                      requestId?: unknown;
                      error?: {
                          code?: unknown;
                          message?: unknown;
                      };
                  }
                : undefined;

        const code =
            typeof payload?.error?.code === "string"
                ? payload.error.code
                : undefined;

        const requestId =
            typeof payload?.requestId === "string"
                ? payload.requestId
                : undefined;

        const message =
            typeof payload?.error?.message === "string"
                ? payload.error.message
                : typeof payload?.message === "string"
                  ? payload.message
                  : "The request could not be completed.";

        throw createApiError(
            message,
            response.status,
            {
                ...(code ? { code } : {}),
                ...(requestId ? { requestId } : {}),
            },
        );
    }

    return responseBody as T;
}

// ============================================
// ADMIN API REQUEST
// ============================================

export async function adminFetch<T>(
    path: string,
    options: Omit<
        ApiRequestOptions,
        "csrfToken" | "csrf" | "csrfPath"
    > = {},
): Promise<ApiEnvelope<T>> {
    const {
        method = "GET",
        ...requestOptions
    } = options;

    return apiRequest<ApiEnvelope<T>>(
        `/admin${path.startsWith("/") ? path : `/${path}`}`,
        {
            ...requestOptions,
            method,
            csrf: method !== "GET" && method !== "HEAD",
            csrfPath: "/admin/auth/csrf-token",
        },
    );
}