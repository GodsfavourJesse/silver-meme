export type AdminBoostStatus =
    | "PENDING"
    | "AWAITING_APPROVAL"
    | "ACTIVE"
    | "REJECTED"
    | "EXPIRED"
    | "CANCELLED";

export interface AdminBoostPagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface AdminBoostListParams {
    status?: AdminBoostStatus;
    page?: number;
    limit?: number;
}

export interface AdminBoostListItem {
    id: string;
    listingId: string;
    boostPlanId: string;

    status: AdminBoostStatus;

    paymentVerifiedAt: string | null;

    reviewedBy: string | null;
    reviewedAt: string | null;
    reviewNote: string | null;

    startsAt: string | null;
    expiresAt: string | null;

    createdAt: string;

    durationDays: number;
    price: string;
    currency: string;

    listingTitle: string;
    listingStatus: string;

    sellerId: string;
    sellerEmail: string;
}

/**
 * Payment information returned with boost details.
 *
 * Additional fields can be added here to match
 * the exact payment schema returned by the service.
 */
export interface AdminBoostPayment {
    id: string;
    reference: string;
    amount: string;
    currency: string;
    status: string;

    paidAt: string | null;
    createdAt: string;

    [key: string]: unknown;
}

export interface AdminBoostDetails
    extends AdminBoostListItem {
    payments: AdminBoostPayment[];
}

export interface AdminBoostReviewInput {
    boostId: string;
    reviewNote?: string;
}

export interface AdminBoostRejectInput {
    boostId: string;
    reviewNote: string;
}

export interface AdminBoostListResponse {
    items: AdminBoostListItem[];
    pagination: AdminBoostPagination;
}