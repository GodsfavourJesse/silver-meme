"use client";

import {
    createAdminBoostPlan,
    deactivateAdminBoostPlan,
    getAdminBoostPlans,
    updateAdminBoostPlan,
} from "@/app/services/admin/admin-boost.service";

import type {
    AdminBoostPlan,
    CreateAdminBoostPlanInput,
    UpdateAdminBoostPlanInput,
} from "@/app/types/admin/admin-boosts/adminBoostPlan.types";

import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";

export const ADMIN_BOOST_PLAN_QUERY_KEY = [
    "admin",
    "boost-plans",
] as const;

/**

* Fetch all boost plans.
  */
export function useAdminBoostPlans() {
    return useQuery({
        queryKey: ADMIN_BOOST_PLAN_QUERY_KEY,
        queryFn: getAdminBoostPlans,
        staleTime: 30 * 1000,
    });
}

/**

* Create a boost plan.
  */
export function useCreateAdminBoostPlan() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (
        input: CreateAdminBoostPlanInput,
    ) => createAdminBoostPlan(input),

    onSuccess: async () => {
        await queryClient.invalidateQueries({
            queryKey: ADMIN_BOOST_PLAN_QUERY_KEY,
        });
    },

    });
}

/**

* Update a boost plan.
  */
export function useUpdateAdminBoostPlan() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            planId,
            input,
        }: {
            planId: string;
            input: UpdateAdminBoostPlanInput;
        }) => updateAdminBoostPlan(planId, input),

        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ADMIN_BOOST_PLAN_QUERY_KEY,
            });
        },

    });
}

/**

* Activate a boost plan.
*
* This uses the same update endpoint and React Query mutation.
  */
export function useActivateAdminBoostPlan() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (plan: AdminBoostPlan) =>
            updateAdminBoostPlan(plan.id, {
            active: 1,
        }),

        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ADMIN_BOOST_PLAN_QUERY_KEY,
            });
        },

    });
}

/**

* Deactivate a boost plan.
  */
export function useDeactivateAdminBoostPlan() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (planId: string) =>
        deactivateAdminBoostPlan(planId),

        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ADMIN_BOOST_PLAN_QUERY_KEY,
            });
        },

    });
}
