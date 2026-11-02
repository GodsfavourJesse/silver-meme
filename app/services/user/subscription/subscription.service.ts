import { apiRequest } from "@/app/lib/api/api-client";
import { ApiResponse } from "@/app/types/api.types";
import { CurrentSubscriptionResponse, SubscriptionPlansResponse, SubscriptionPriceResponse } from "@/app/types/user/subscription/subscription.types";

const SUBSCRIPTION_ENDPOINT = "/subscriptions";

/**
 * Fetch all publicly available subscription plans.
 *
 * GET /api/v1/subscriptions/plans
 */
export async function getSubscriptionPlans() {
    const response = await apiRequest<
        ApiResponse<SubscriptionPlansResponse>
    >(`${SUBSCRIPTION_ENDPOINT}/plans`, {
        method: "GET",
    });

    if (!response.success) {
        throw new Error(
            response.message ?? "Unable to load subscription plans.",
        );
    }

    return response.data.plans;
}

/**
 * Fetch the authenticated user's current subscription
 * and available listing credit balance.
 *
 * GET /api/v1/subscriptions/current
 */
export async function getCurrentSubscription() {
    const response = await apiRequest<
        ApiResponse<CurrentSubscriptionResponse>
    >(`${SUBSCRIPTION_ENDPOINT}/current`, {
        method: "GET",
    });

    if (!response.success) {
        throw new Error(
            response.message ?? "Unable to load your subscription.",
        );
    }

    return response.data;
}

/**
 * Fetch personalized pricing for a subscription plan.
 *
 * The backend determines dealer eligibility and applies
 * the appropriate discount for verified dealers.
 *
 * GET /api/v1/subscriptions/plans/:planId/price
 */
export async function getSubscriptionPlanPrice(
    planId: string,
) {
    if (!planId.trim()) {
        throw new Error("A valid subscription plan is required.");
    }

    const response = await apiRequest<
        ApiResponse<SubscriptionPriceResponse>
    >(
        `${SUBSCRIPTION_ENDPOINT}/plans/${encodeURIComponent(planId)}/price`,
        {
            method: "GET",
        },
    );

    if (!response.success) {
        throw new Error(
            response.message ?? "Unable to calculate subscription pricing.",
        );
    }

    return response.data.price;
}