import { getUserPaymentHistory } from "@/app/services/user/payment/payment.service";
import { useQuery } from "@tanstack/react-query";

export const paymentHistoryKeys = {
    all: ["payments", "history"] as const,

    list: (page: number, limit: number) =>
        [...paymentHistoryKeys.all, { page, limit }] as const,
};

interface UsePaymentHistoryOptions {
    page?: number;
    limit?: number;
    enabled?: boolean;
}

export function usePaymentHistory({
    page = 1,
    limit = 20,
    enabled = true,
}: UsePaymentHistoryOptions = {}) {
    const safePage = Math.max(1, Math.floor(page));

    const safeLimit = Math.min(
        100,
        Math.max(1, Math.floor(limit)),
    );

    return useQuery({
        queryKey: paymentHistoryKeys.list(
            safePage,
            safeLimit,
        ),

        queryFn: () =>
            getUserPaymentHistory(
                safePage,
                safeLimit,
            ),

        enabled,

        staleTime: 30 * 1000,

        gcTime: 10 * 60 * 1000,

        refetchOnWindowFocus: true,

        retry: 1,
    });
}