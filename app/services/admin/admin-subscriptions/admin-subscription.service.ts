import { apiRequest } from "@/app/lib/api/api-client";
import { AdminApiResponse, AdminSubscription, AdminSubscriptionFilters, AdminSubscriptionPagination, AdminSubscriptionPlan, CreateAdminSubscriptionPlanPayload, CreateAdminSubscriptionPlanResponse, UpdateAdminSubscriptionPlanPayload, UpdateAdminSubscriptionPlanResponse } from "@/app/types/admin/admin-subscription.types";

const ADMIN_SUBSCRIPTION_ENDPOINT = "/admin/subscriptions";

/* =========================================
   FETCH ADMIN SUBSCRIPTIONS
========================================= */

interface AdminSubscriptionsApiResponse {
    items: AdminSubscription[];
    pagination: AdminSubscriptionPagination;
}

/**
 * Fetch subscription records for the admin dashboard.
 *
 * Supports:
 * - Pagination
 * - Status filtering
 *
 * GET /api/v1/admin/subscriptions
 */
export async function getAdminSubscriptions(
    filters: AdminSubscriptionFilters = {},
) {
    const page = Math.max(
        1,
        Math.floor(filters.page ?? 1),
    );

    const limit = Math.min(
        100,
        Math.max(1, Math.floor(filters.limit ?? 20)),
    );

    const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
    });

    if (filters.status) {
        params.set("status", filters.status);
    }

    const response = await apiRequest<
        AdminApiResponse<AdminSubscriptionsApiResponse>
    >(
        `${ADMIN_SUBSCRIPTION_ENDPOINT}?${params.toString()}`,
        {
            method: "GET",
        },
    );

    if (!response.success) {
        throw new Error(
            response.message ?? "Unable to load subscriptions.",
        );
    }

    return {
        items: response.data.items,
        pagination: response.data.pagination,
    };
}

/* =========================================
   FETCH SUBSCRIPTION PLANS
========================================= */

/**
 * Fetch all subscription plans and their versions.
 *
 * Includes inactive plans because administrators
 * need to manage their availability.
 *
 * GET /api/v1/admin/subscriptions/subscription-plans
 */
export async function getAdminSubscriptionPlans(): Promise<
    AdminSubscriptionPlan[]
> {
    const response = await apiRequest<
        AdminApiResponse<{
            plans: AdminSubscriptionPlan[];
        }>
    >(
        `${ADMIN_SUBSCRIPTION_ENDPOINT}/subscription-plans`,
        {
            method: "GET",
        },
    );

    if (!response.success) {
        throw new Error(
            response.message ?? "Unable to load subscription plans.",
        );
    }

    return response.data.plans;
}

/* =========================================
   CREATE SUBSCRIPTION PLAN
========================================= */

/**
 * Create a new subscription plan.
 *
 * The backend creates the plan and its first
 * immutable version inside a database transaction.
 *
 * POST /api/v1/admin/subscriptions/subscription-plans
 */
export async function createAdminSubscriptionPlan(
    payload: CreateAdminSubscriptionPlanPayload,
): Promise<AdminSubscriptionPlan> {
    const response = await apiRequest<
        AdminApiResponse<CreateAdminSubscriptionPlanResponse>
    >(
        `${ADMIN_SUBSCRIPTION_ENDPOINT}/subscription-plans`,
        {
            method: "POST",
            body: {
                ...payload,
                price: Number(payload.price),
            },
        },
    );

    if (!response.success || !response.data?.plan) {
        throw new Error(
            response.message ?? "Unable to create subscription plan.",
        );
    }

    return response.data.plan;
}

/* =========================================
   UPDATE SUBSCRIPTION PLAN
========================================= */

/**
 * Update an existing subscription plan.
 *
 * Configuration changes such as price, duration,
 * listing credits and dealer discount create a
 * new immutable plan version in the backend.
 *
 * PATCH /api/v1/admin/subscriptions/subscription-plans/:planId
 */
export async function updateAdminSubscriptionPlan(
    planId: string,
    payload: UpdateAdminSubscriptionPlanPayload,
): Promise<AdminSubscriptionPlan> {
    if (!planId.trim()) {
        throw new Error("A valid subscription plan ID is required.");
    }

    if (Object.keys(payload).length === 0) {
        throw new Error("Provide at least one field to update.");
    }

    const response = await apiRequest<
        AdminApiResponse<UpdateAdminSubscriptionPlanResponse>
    >(
        `${ADMIN_SUBSCRIPTION_ENDPOINT}/subscription-plans/${encodeURIComponent(planId)}`,
        {
            method: "PATCH",
            body: {
                ...payload,
                ...(payload.price !== undefined
                    ? { price: Number(payload.price) }
                    : {}),
            },
        },
    );

    if (!response.success || !response.data?.plan) {
        throw new Error(
            response.message ?? "Unable to update subscription plan.",
        );
    }

    return response.data.plan;
}