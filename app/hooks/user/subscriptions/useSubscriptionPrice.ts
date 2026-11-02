import { getSubscriptionPlanPrice } from "@/app/services/user/subscription/subscription.service";
import { useQuery } from "@tanstack/react-query";

export const subscriptionPriceKeys = {
    all: ["subscriptions", "price"] as const,

    detail: (planId: string) =>
        [...subscriptionPriceKeys.all, planId] as const,
};

export function useSubscriptionPrice(
    planId: string,
    enabled = true,
) {
    return useQuery({
        queryKey: subscriptionPriceKeys.detail(planId),
        queryFn: () => getSubscriptionPlanPrice(planId),
        enabled: enabled && Boolean(planId),
        staleTime: 60 * 1000,
        gcTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
        retry: 1,
    });
}