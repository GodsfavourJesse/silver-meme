"use client";

import { useQuery } from "@tanstack/react-query";

import {
    getAdminSubscriptionHistory,
    type AdminSubscriptionHistoryFilters,
} from "@/app/services/admin/admin-subscriptions/admin-subscription-history.service";

export function useAdminSubscriptionHistory(
    subscriptionId: string,
    filters: AdminSubscriptionHistoryFilters = {},
) {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 10;

    return useQuery({
        queryKey: [
            "admin",
            "subscription-history",
            subscriptionId,
            page,
            limit,
        ],

        queryFn: () =>
            getAdminSubscriptionHistory(subscriptionId, {
                page,
                limit,
            }),

        enabled: Boolean(subscriptionId),

        staleTime: 30 * 1000,

        retry: 1,
    });
}