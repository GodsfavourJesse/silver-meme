"use client";

import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";

import {
    approveAdminBoost,
    getAdminBoostDetails,
    getAdminBoosts,
    rejectAdminBoost,
} from "@/app/services/admin/admin-boost.service";

import type {
    AdminBoostListParams,
    AdminBoostRejectInput,
    AdminBoostReviewInput,
} from "@/app/types/admin/admin-boost.types";

/* -------------------------------------------------------------------------- */
/* Query Keys                                                                 */
/* -------------------------------------------------------------------------- */

export const adminBoostKeys = {
    all: ["admin", "boosts"] as const,

    lists: () =>
        [...adminBoostKeys.all, "list"] as const,

    list: (params: AdminBoostListParams) =>
        [...adminBoostKeys.lists(), params] as const,

    details: () =>
        [...adminBoostKeys.all, "detail"] as const,

    detail: (boostId: string) =>
        [...adminBoostKeys.details(), boostId] as const,
};

/* -------------------------------------------------------------------------- */
/* List Boost Requests                                                        */
/* -------------------------------------------------------------------------- */

export function useAdminBoosts(
    params: AdminBoostListParams = {},
) {
    return useQuery({
        queryKey: adminBoostKeys.list(params),

        queryFn: () => getAdminBoosts(params),

        staleTime: 30_000,

        retry: 1,

        enabled: true,
    });
}

/* -------------------------------------------------------------------------- */
/* Boost Details                                                              */
/* -------------------------------------------------------------------------- */

export function useAdminBoostDetails(
    boostId: string,
) {
    return useQuery({
        queryKey: adminBoostKeys.detail(boostId),

        queryFn: () => getAdminBoostDetails(boostId),

        enabled: Boolean(boostId),

        staleTime: 30_000,

        retry: 1,
    });
}

/* -------------------------------------------------------------------------- */
/* Approve Boost                                                              */
/* -------------------------------------------------------------------------- */

export function useApproveAdminBoost() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (
            input: AdminBoostReviewInput,
        ) => approveAdminBoost(input),

        onSuccess: async (data, variables) => {
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: adminBoostKeys.all,
                }),

                queryClient.invalidateQueries({
                    queryKey: adminBoostKeys.detail(
                        variables.boostId,
                    ),
                }),

                queryClient.invalidateQueries({
                    queryKey: ["admin", "dashboard"],
                }),
            ]);

            queryClient.setQueryData(
                adminBoostKeys.detail(variables.boostId),
                data,
            );
        },
    });
}

/* -------------------------------------------------------------------------- */
/* Reject Boost                                                               */
/* -------------------------------------------------------------------------- */

export function useRejectAdminBoost() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (
            input: AdminBoostRejectInput,
        ) => rejectAdminBoost(input),

        onSuccess: async (data, variables) => {
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: adminBoostKeys.all,
                }),

                queryClient.invalidateQueries({
                    queryKey: adminBoostKeys.detail(
                        variables.boostId,
                    ),
                }),

                queryClient.invalidateQueries({
                    queryKey: ["admin", "dashboard"],
                }),
            ]);

            queryClient.setQueryData(
                adminBoostKeys.detail(variables.boostId),
                data,
            );
        },
    });
}