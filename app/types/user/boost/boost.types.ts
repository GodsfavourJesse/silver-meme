// ============================================
// BOOST STATUS
// ============================================

export type BoostStatus =
    | "PENDING"
    | "AWAITING_APPROVAL"
    | "ACTIVE"
    | "REJECTED"
    | "EXPIRED"
    | "CANCELLED";

// ============================================
// BOOST PLAN
// ============================================

export interface BoostPlan {
    id: string;
    durationDays: number;
    price: string | number;
    currency: string;
    active: number;
    createdAt: string;
}

// ============================================
// LISTING BOOST
// ============================================

/**
 * A boost belongs to one specific vehicle listing.
 *
 * listingId identifies the exact vehicle being promoted.
 * Dealer inventory is never boosted as a whole.
 */

export interface ListingBoost {
    id: string;
    listingId: string;
    boostPlanId: string;

    status: BoostStatus;

    paymentVerifiedAt: string | null;

    reviewedBy: string | null;
    reviewedAt: string | null;
    reviewNote: string | null;

    startsAt: string | null;
    expiresAt: string | null;

    createdAt: string;
}

// ============================================
// BOOST HISTORY
// ============================================

export interface BoostHistoryItem extends ListingBoost {
    durationDays: number;
    price: string | number;
    currency: string;
    listingTitle: string;
}

// ============================================
// PAGINATION
// ============================================

export interface BoostPagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

// ============================================
// API RESPONSES
// ============================================

export interface BoostPlansResponse {
    success: boolean;
    message?: string;

    data: {
        plans: BoostPlan[];
    };
}

export interface CreateBoostResponse {
    success: boolean;
    message?: string;

    data: {
        boost: ListingBoost;
    };
}

export interface CancelBoostResponse {
    success: boolean;
    message?: string;

    data: {
        boost: ListingBoost;
    };
}

export interface BoostHistoryResponse {
    success: boolean;
    message?: string;

    data: BoostHistoryItem[];

    pagination: BoostPagination;
}

// ============================================
// REQUEST INPUTS
// ============================================

export interface CreateBoostInput {
    listingId: string;
    boostPlanId: string;
}

export interface BoostHistoryParams {
    page?: number;
    limit?: number;
}

// ============================================
// BOOST PAYMENT
// ============================================

export interface BoostPaymentResult {
    paymentId: string;
    reference: string;

    amount: number;
    currency: string;

    authorizationUrl?: string;
    accessCode?: string;
}