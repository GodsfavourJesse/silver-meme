import { apiRequest } from "@/app/lib/api/api-client";

import { getUserCsrfToken } from "../auth/csrf.service";

import type {
    BoostPlan,
    ListingBoost,
    BoostHistoryItem,
    BoostPagination,
    CreateBoostInput,
    BoostHistoryParams,
} from "@/app/types/user/boost/boost.types";

const BOOST_ENDPOINT = "/boosts";

// ============================================
// API RESPONSE TYPES
// ============================================

interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data: T;
}

interface BoostPlansData {
    plans: BoostPlan[];
}

interface CreateBoostData {
    boost: ListingBoost;
}

interface CancelBoostData {
    boost: ListingBoost;
}

// ============================================
// GET BOOST PLANS
// ============================================

/**
 * Retrieve active boost plans.
 *
 * GET /api/v1/boosts/plans
 */

export async function getBoostPlans(): Promise<BoostPlan[]> {
    const response = await apiRequest<
        ApiResponse<BoostPlansData>
    >(`${BOOST_ENDPOINT}/plans`);

    if (!response.success) {
        throw new Error(
            response.message ??
            "Unable to retrieve boost plans.",
        );
    }

    if (!Array.isArray(response.data?.plans)) {
        throw new Error(
            "Invalid boost plans response.",
        );
    }

    return response.data.plans;
}

// ============================================
// CREATE LISTING BOOST
// ============================================

/**
 * Create a pending boost for one specific listing.
 *
 * POST /api/v1/boosts
 *
 * This endpoint:
 * - Does not initialize payment.
 * - Does not activate the boost.
 * - Only creates the pending boost request.
 */

export async function createListingBoost(
    input: CreateBoostInput,
): Promise<ListingBoost> {
    if (!input.listingId?.trim()) {
        throw new Error(
            "A valid listing is required.",
        );
    }

    if (!input.boostPlanId?.trim()) {
        throw new Error(
            "Please select a boost plan.",
        );
    }

    const csrfToken = await getUserCsrfToken();

    const response = await apiRequest<
        ApiResponse<CreateBoostData>
    >(BOOST_ENDPOINT, {
        method: "POST",
        csrfToken,
        body: {
            listingId: input.listingId,
            boostPlanId: input.boostPlanId,
        },
    });

    if (!response.success || !response.data?.boost) {
        throw new Error(
            response.message ??
            "Unable to create boost request.",
        );
    }

    return response.data.boost;
}

// ============================================
// CANCEL LISTING BOOST
// ============================================

/**
 * Cancel a pending boost request.
 *
 * POST /api/v1/boosts/:boostId/cancel
 */

export async function cancelListingBoost(
    boostId: string,
): Promise<ListingBoost> {
    if (!boostId?.trim()) {
        throw new Error(
            "A valid boost ID is required.",
        );
    }

    const csrfToken = await getUserCsrfToken();

    const response = await apiRequest<
        ApiResponse<CancelBoostData>
    >(
        `${BOOST_ENDPOINT}/${encodeURIComponent(boostId)}/cancel`,
        {
            method: "POST",
            csrfToken,
        },
    );

    if (!response.success || !response.data?.boost) {
        throw new Error(
            response.message ??
            "Unable to cancel boost request.",
        );
    }

    return response.data.boost;
}

// ============================================
// BOOST HISTORY
// ============================================

/**
 * Retrieve authenticated seller boost history.
 *
 * GET /api/v1/boosts/history
 *
 * Expected backend response:
 *
 * {
 *   success: true,
 *   data: [...],
 *   pagination: {...}
 * }
 */

export async function getUserBoostHistory(
    params: BoostHistoryParams = {},
): Promise<{
    items: BoostHistoryItem[];
    pagination: BoostPagination;
}> {
    const page = Math.max(
        1,
        Math.floor(params.page ?? 1),
    );

    const limit = Math.min(
        100,
        Math.max(
            1,
            Math.floor(params.limit ?? 20),
        ),
    );

    const response = await apiRequest<
        ApiResponse<BoostHistoryItem[]> & {
            pagination: BoostPagination;
        }
    >(`${BOOST_ENDPOINT}/history`, {
        query: {
            page,
            limit,
        },
    });

    if (!response.success) {
        throw new Error(
            response.message ??
            "Unable to retrieve boost history.",
        );
    }

    if (!Array.isArray(response.data)) {
        throw new Error(
            "Invalid boost history response.",
        );
    }

    if (!response.pagination) {
        throw new Error(
            "Boost history pagination is missing.",
        );
    }

    return {
        items: response.data,
        pagination: response.pagination,
    };
}