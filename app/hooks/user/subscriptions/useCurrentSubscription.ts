import { getCurrentSubscription } from "@/app/services/user/subscription/subscription.service";
import { useQuery } from "@tanstack/react-query";

export const currentSubscriptionKeys = {
    all: ["subscriptions", "current"] as const,
};

export function useCurrentSubscription(enabled = true) {
    return useQuery({
        queryKey: currentSubscriptionKeys.all,
        queryFn: getCurrentSubscription,
        enabled,
        staleTime: 60 * 1000,
        gcTime: 10 * 60 * 1000,
        refetchOnWindowFocus: true,
        retry: 1,
    });
}