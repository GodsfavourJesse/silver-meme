import { getSubscriptionPlans } from "@/app/services/user/subscription/subscription.service";
import { useQuery } from "@tanstack/react-query";

export const subscriptionPlanKeys = {
    all: ["subscriptions", "plans"] as const,
};

export function useSubscriptionPlans() {
    return useQuery({
        queryKey: subscriptionPlanKeys.all,
        queryFn: getSubscriptionPlans,
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        refetchOnWindowFocus: false,
        retry: 1,
    });
}