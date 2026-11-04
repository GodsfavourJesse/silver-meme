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
} from "@/app/types/admin/admin-boost.types";

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