import { getAdminSubscriptionPlans } from "@/app/services/admin/admin-subscriptions/admin-subscription.service";
import { useQuery } from "@tanstack/react-query";

export const adminSubscriptionPlanKeys = {
    all: ["admin", "subscription-plans"] as const,
};

export function useAdminSubscriptionPlans(
    enabled = true,
) {
    return useQuery({
        queryKey: adminSubscriptionPlanKeys.all,

        queryFn: getAdminSubscriptionPlans,

        enabled,

        staleTime: 60 * 1000,
        gcTime: 15 * 60 * 1000,
        refetchOnWindowFocus: false,
        retry: 1,
    });
}