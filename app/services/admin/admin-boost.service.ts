import {
    adminFetch,
} from "@/app/lib/api/api-client";

import type {
    ApiEnvelope,
} from "@/app/lib/api/api-client";

import type {
    AdminBoostDetails,
    AdminBoostListItem,
    AdminBoostListParams,
    AdminBoostListResponse,
    AdminBoostPagination,
    AdminBoostRejectInput,
    AdminBoostReviewInput,
} from "@/app/types/admin/admin-boosts/admin-boost.types";
import { AdminBoostPlan, CreateAdminBoostPlanInput, UpdateAdminBoostPlanInput } from "@/app/types/admin/admin-boosts/adminBoostPlan.types";

/**
 * The backend list response has pagination
 * outside the data property.
 */
type AdminBoostListEnvelope =
    ApiEnvelope<AdminBoostListItem[]> & {
        pagination: AdminBoostPagination;
    };

/**
 * GET /admin/boosts
 */
export async function getAdminBoosts(
    params: AdminBoostListParams = {},
): Promise<AdminBoostListResponse> {
    const response = await adminFetch<
        AdminBoostListItem[]
    >("/boosts", {
        method: "GET",
        query: {
            status: params.status,
            page: params.page ?? 1,
            limit: params.limit ?? 20,
        },
    });

    const result =
        response as AdminBoostListEnvelope;

    return {
        items: result.data,
        pagination: result.pagination,
    };
}

/**
 * GET /admin/boosts/:boostId
 */
export async function getAdminBoostDetails(
    boostId: string,
): Promise<AdminBoostDetails> {
    const response = await adminFetch<
        AdminBoostDetails
    >(
        `/boosts/${encodeURIComponent(boostId)}`,
        {
            method: "GET",
        },
    );

    return response.data;
}

/**
 * PATCH /admin/boosts/:boostId/approve
 */
export async function approveAdminBoost(
    input: AdminBoostReviewInput,
): Promise<AdminBoostDetails> {
    const response = await adminFetch<
        AdminBoostDetails
    >(
        `/boosts/${encodeURIComponent(input.boostId)}/approve`,
        {
            method: "PATCH",
            body: {
                ...(input.reviewNote !== undefined
                    ? {
                        reviewNote: input.reviewNote,
                    }
                    : {}),
            },
        },
    );

    return response.data;
}

/**
 * PATCH /admin/boosts/:boostId/reject
 */
export async function rejectAdminBoost(
    input: AdminBoostRejectInput,
): Promise<AdminBoostDetails> {
    const response = await adminFetch<
        AdminBoostDetails
    >(
        `/boosts/${encodeURIComponent(input.boostId)}/reject`,
        {
            method: "PATCH",
            body: {
                reviewNote: input.reviewNote,
            },
        },
    );

    return response.data;
}

/**
 * GET /admin/boosts/plans
 *
 * Retrieves all boost plans, including inactive plans.
 */
export async function getAdminBoostPlans(): Promise<AdminBoostPlan[]> {
    const response = await adminFetch<AdminBoostPlan[]>(
        "/boosts/plans",
        {
            method: "GET",
        },
    );

    return response.data;
}

/**
 * POST /admin/boosts/plans
 *
 * Creates a new boost plan.
 */
export async function createAdminBoostPlan(
    input: CreateAdminBoostPlanInput,
): Promise<AdminBoostPlan> {
    const response = await adminFetch<AdminBoostPlan>(
        "/boosts/plans",
        {
            method: "POST",
            body: input,
        },
    );

    return response.data;
}

/**
 * PATCH /admin/boosts/plans/:planId
 *
 * Updates an existing boost plan.
 */
export async function updateAdminBoostPlan(
    planId: string,
    input: UpdateAdminBoostPlanInput,
): Promise<AdminBoostPlan> {
    const response = await adminFetch<AdminBoostPlan>(
        `/boosts/plans/${encodeURIComponent(planId)}`,
        {
            method: "PATCH",
            body: input,
        },
    );

    return response.data;
}

/**
 * DELETE /admin/boosts/plans/:planId
 *
 * Soft-deactivates a boost plan.
 */
export async function deactivateAdminBoostPlan(
    planId: string,
): Promise<AdminBoostPlan> {
    const response = await adminFetch<AdminBoostPlan>(
        `/boosts/plans/${encodeURIComponent(planId)}`,
        {
            method: "DELETE",
        },
    );

    return response.data;
}