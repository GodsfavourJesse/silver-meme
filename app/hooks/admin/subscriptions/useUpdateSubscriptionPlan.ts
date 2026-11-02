import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import {
    adminSubscriptionPlanKeys,
} from "./useAdminSubscriptionPlans";
import { updateAdminSubscriptionPlan } from "@/app/services/admin/admin-subscriptions/admin-subscription.service";

export interface UpdateSubscriptionPlanPayload {
    planId: string;

    data: {
        name?: string;
        description?: string | null;
        price?: number;
        currency?: string;
        durationDays?: number;
        listingCredits?: number;
        dealerDiscountPercent?: number;
        active?: boolean;
    };
}

export function useUpdateSubscriptionPlan() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: [
            "admin",
            "subscriptions",
            "update-plan",
        ],

        mutationFn: ({
            planId,
            data,
        }: UpdateSubscriptionPlanPayload) =>
            updateAdminSubscriptionPlan(planId, data),

        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: adminSubscriptionPlanKeys.all,
            });
        },
    });
}