import { ApiError } from "./api-error";

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace(
        /\/+$/,
        "",
    );

export interface ApiRequestOptions
    extends Omit<RequestInit, "body"> {
    body?: unknown;
    csrfToken?: string;
}

function getApiBaseUrl(): string {
    if (!API_BASE_URL) {
        throw new Error(
            "NEXT_PUBLIC_API_BASE_URL is not configured.",
        );
    }

    return API_BASE_URL;
}

function isJsonContentType(
    contentType: string | null,
): boolean {
    return Boolean(
        contentType?.includes("application/json"),
    );
}

export async function apiRequest<T>(
    path: string,
    options: ApiRequestOptions = {},
): Promise<T> {
    const {
        body,
        csrfToken,
        headers: suppliedHeaders,
        ...requestOptions
    } = options;

    const headers = new Headers(
        suppliedHeaders,
    );

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
        headers.set(
            "X-CSRF-Token",
            csrfToken,
        );
    }

    headers.set(
        "Accept",
        "application/json",
    );

    let response: Response;

    try {
        response = await fetch(
            `${getApiBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`,
            {
                ...requestOptions,
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
    } catch {
        throw new ApiError(
            "Unable to connect to the KARMASS server. Check your connection and try again.",
            {
                status: 0,
                code: "NETWORK_ERROR",
            },
        );
    }

    const contentType =
        response.headers.get("content-type");

    let responseBody: unknown;

    if (response.status !== 204) {
        if (isJsonContentType(contentType)) {
            try {
                responseBody =
                    await response.json();
            } catch {
                throw new ApiError(
                    "The server returned an invalid response.",
                    {
                        status: response.status,
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

    if (!response.ok) {
        const payload =
            typeof responseBody === "object" &&
            responseBody !== null
                ? responseBody as {
                      message?: unknown;
                      error?: {
                          code?: unknown;
                          message?: unknown;
                      };
                  }
                : undefined;

        const message =
            typeof payload?.error?.message === "string"
                ? payload.error.message
                : typeof payload?.message === "string"
                  ? payload.message
                  : "The request could not be completed.";

        const code =
            typeof payload?.error?.code === "string"
                ? payload.error.code
                : undefined;

        throw new ApiError(
            message,
            {
                status: response.status,
                ...(code !== undefined
                    ? { code }
                    : {}),
            },
        );
    }

    return responseBody as T;
}