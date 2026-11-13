import { getSubscriptionPlanPrice } from "@/app/services/user/subscription/subscription.service";
import { useAuth } from "@/app/hooks/user/auth/useAuth";
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
    const { user, isLoading: isUserLoading } = useAuth();

    return useQuery({
        // Pricing is personalized by account eligibility. Keep each user's
        // result isolated in the cache when accounts change in one browser.
        queryKey: [...subscriptionPriceKeys.detail(planId), user?.id ?? "signed-out"],
        queryFn: () => getSubscriptionPlanPrice(planId),
        enabled: enabled && Boolean(planId && user?.id) && !isUserLoading,
        staleTime: 60 * 1000,
        gcTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
        retry: 1,
    });
}
