import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import {
    adminSubscriptionPlanKeys,
} from "./useAdminSubscriptionPlans";
import { createAdminSubscriptionPlan } from "@/app/services/admin/admin-subscriptions/admin-subscription.service";

export interface CreateSubscriptionPlanPayload {
    name: string;
    price: number;
    currency?: string;
    durationDays: number;
    listingCredits: number;
    dealerDiscountPercent?: number;
}

export function useCreateSubscriptionPlan() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: [
            "admin",
            "subscriptions",
            "create-plan",
        ],

        mutationFn: (
            payload: CreateSubscriptionPlanPayload,
        ) => createAdminSubscriptionPlan(payload),

        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: adminSubscriptionPlanKeys.all,
            });
        },
    });
}