import { getAdminSubscriptions } from "@/app/services/admin/admin-subscriptions/admin-subscription.service";
import { useQuery } from "@tanstack/react-query";

export type AdminSubscriptionStatus =
    | "PENDING"
    | "ACTIVE"
    | "EXPIRED"
    | "CANCELLED";

export interface AdminSubscriptionFilters {
    page?: number;
    limit?: number;
    status?: AdminSubscriptionStatus;
}

export const adminSubscriptionKeys = {
    all: ["admin", "subscriptions"] as const,

    lists: () =>
        [...adminSubscriptionKeys.all, "list"] as const,

    list: (filters: Required<Pick<AdminSubscriptionFilters, "page" | "limit">> & {
        status?: AdminSubscriptionStatus;
    }) =>
        [...adminSubscriptionKeys.lists(), filters] as const,
};

export function useAdminSubscriptions(
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

    const status = filters.status;

    return useQuery({
        queryKey: adminSubscriptionKeys.list({
            page,
            limit,
            ...(status ? { status } : {}),
        }),

        queryFn: () =>
            getAdminSubscriptions({
                page,
                limit,
                ...(status ? { status } : {}),
            }),

        staleTime: 30 * 1000,
        gcTime: 10 * 60 * 1000,
        refetchOnWindowFocus: true,
        retry: 1,
    });
}