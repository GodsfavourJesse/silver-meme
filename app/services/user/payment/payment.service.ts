import { apiRequest } from "@/app/lib/api/api-client";
import { FulfilledPaymentResult, SubscriptionPaymentResult } from "@/app/types/user/subscription/subscription.types";
import { getUserCsrfToken } from "../auth/csrf.service";
import { ApiResponse } from "@/app/types/api.types";
import { BoostPaymentResult } from "@/app/types/user/boost/boost.types";

const PAYMENT_ENDPOINT = "/payments";

/**
 * Initialize a subscription payment.
 *
 * Flow:
 * 1. Retrieve the user's CSRF token.
 * 2. Send the selected plan ID to the backend.
 * 3. Backend creates or retrieves the pending subscription.
 * 4. Backend initializes the Paystack transaction.
 * 5. Return the authorization URL and payment reference.
 *
 * POST /api/v1/payments/subscriptions/initialize
 */
export async function initializeSubscriptionPayment(
    planId: string,
): Promise<SubscriptionPaymentResult> {
    if (!planId.trim()) {
        throw new Error("Please select a subscription plan.");
    }

    const csrfToken = await getUserCsrfToken();

    const response = await apiRequest<
        ApiResponse<SubscriptionPaymentResult>
    >(`${PAYMENT_ENDPOINT}/subscriptions/initialize`, {
        method: "POST",
        csrfToken,
        body: {
            planId,
        },
    });

    if (!response.success || !response.data?.reference) {
        throw new Error(
            response.message ?? "Unable to initialize subscription payment.",
        );
    }

    return response.data;
}

/**
 * Verify a payment using its Paystack reference.
 *
 * Important:
 * Never activate a subscription from the Paystack redirect alone.
 * The backend verification endpoint is responsible for confirming
 * payment and fulfilling the subscription.
 *
 * POST /api/v1/payments/verify
 */
export async function verifySubscriptionPayment(
    reference: string,
): Promise<FulfilledPaymentResult> {
    if (!reference.trim()) {
        throw new Error("A valid payment reference is required.");
    }

    const csrfToken = await getUserCsrfToken();

    const response = await apiRequest<
        ApiResponse<FulfilledPaymentResult>
    >(`${PAYMENT_ENDPOINT}/verify`, {
        method: "POST",
        csrfToken,
        body: {
            reference,
        },
    });

    if (!response.success) {
        throw new Error(
            response.message ?? "Unable to verify your payment.",
        );
    }

    return response.data;
}

/**
 * Fetch the authenticated user's payment history.
 *
 * GET /api/v1/payments/history
 *
 * The backend's exact history response structure has not
 * yet been supplied, so this function deliberately avoids
 * assuming a pagination or transaction-item structure.
 */
export async function getUserPaymentHistory(
    page = 1,
    limit = 20,
): Promise<unknown> {
    const safePage = Math.max(1, Math.floor(page));
    const safeLimit = Math.min(100, Math.max(1, Math.floor(limit)));

    const params = new URLSearchParams({
        page: String(safePage),
        limit: String(safeLimit),
    });

    const response = await apiRequest<
        ApiResponse<unknown>
    >(`${PAYMENT_ENDPOINT}/history?${params.toString()}`, {
        method: "GET",
    });

    if (!response.success) {
        throw new Error(
            response.message ?? "Unable to load payment history.",
        );
    }

    return response.data;
}

export async function initializeBoostPayment(
    boostId: string,
): Promise<BoostPaymentResult> {
    const csrfToken = await getUserCsrfToken();

    const response = await apiRequest<
        ApiResponse<BoostPaymentResult>
    >("/payments/boosts/initialize", {
        method: "POST",
        csrfToken,
        body: {
            boostId,
        },
    });

    if (!response.success || !response.data) {
        throw new Error(
            response.message || "Unable to initialize boost payment.",
        );
    }

    return response.data;
}

export async function verifyBoostPayment(
    reference: string,
) {
    const csrfToken = await getUserCsrfToken();

    const response = await apiRequest<
        ApiResponse<unknown>
    >("/payments/verify", {
        method: "POST",
        csrfToken,
        body: {
            reference,
        },
    });

    if (!response.success || !response.data) {
        throw new Error(
            response.message || "Unable to verify boost payment.",
        );
    }

    return response.data;
}