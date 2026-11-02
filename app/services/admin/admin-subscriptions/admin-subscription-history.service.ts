import { apiRequest } from "@/app/lib/api/api-client";

import type {
    AdminSubscriptionPagination,
    AdminSubscriptionStatus,
} from "@/app/types/admin/admin-subscription.types";

export type AdminSubscriptionHistoryEvent =
    | "CREATED"
    | "PAYMENT_PENDING"
    | "PAYMENT_SUCCESS"
    | "PAYMENT_FAILED"
    | "ACTIVATED"
    | "RENEWED"
    | "CANCELLED"
    | "EXPIRED"
    | "REACTIVATED"
    | "REFUNDED"
    | "SUSPENDED"
    | "RESUMED"
    | "CREDIT_GRANTED"
    | "CREDIT_REVOKED";

export interface AdminSubscriptionHistoryItem {
    id: string;
    subscriptionId: string;
    userId: string;
    event: AdminSubscriptionHistoryEvent;
    previousStatus: AdminSubscriptionStatus | null;
    newStatus: AdminSubscriptionStatus | null;
    amount: string | null;
    currency: string | null;
    referenceId: string | null;
    reason: string | null;
    metadata: string | null;
    createdAt: string;
    createdBy: string | null;
}

export interface AdminSubscriptionHistoryResponse {
    items: AdminSubscriptionHistoryItem[];
    pagination: AdminSubscriptionPagination;
}

interface AdminSubscriptionHistoryApiResponse {
    success: boolean;
    message?: string;
    data: AdminSubscriptionHistoryResponse;
}

export interface AdminSubscriptionHistoryFilters {
    page?: number;
    limit?: number;
}

export async function getAdminSubscriptionHistory(
    subscriptionId: string,
    filters: AdminSubscriptionHistoryFilters = {},
): Promise<AdminSubscriptionHistoryResponse> {
    const params = new URLSearchParams({
        page: String(filters.page ?? 1),
        limit: String(filters.limit ?? 10),
    });

    const response =
        await apiRequest<AdminSubscriptionHistoryApiResponse>(
            `/admin/subscriptions/${subscriptionId}/history?${params.toString()}`,
            {
                method: "GET",
            },
        );

    return response.data;
}