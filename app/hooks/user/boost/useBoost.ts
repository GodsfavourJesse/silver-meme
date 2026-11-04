import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";

import {
    cancelListingBoost,
    createListingBoost,
    getBoostPlans,
    getUserBoostHistory,
} from "@/app/services/user/boost/boost.service";

import type {
    BoostHistoryParams,
    CreateBoostInput,
} from "@/app/types/user/boost/boost.types";

// ============================================
// QUERY KEYS
// ============================================

export const boostKeys = {
    all: ["boosts"] as const,

    plans: () =>
        [...boostKeys.all, "plans"] as const,

    history: () =>
        [...boostKeys.all, "history"] as const,

    historyList: (params: Required<BoostHistoryParams>) =>
        [...boostKeys.history(), params] as const,
};

// ============================================
// BOOST PLANS
// ============================================

export function useBoostPlans(enabled = true) {
    return useQuery({
        queryKey: boostKeys.plans(),

        queryFn: getBoostPlans,

        enabled,

        staleTime: 5 * 60 * 1000,

        gcTime: 30 * 60 * 1000,

        refetchOnWindowFocus: false,

        retry: 1,
    });
}

// ============================================
// BOOST HISTORY
// ============================================

interface UseBoostHistoryOptions {
    page?: number;
    limit?: number;
    enabled?: boolean;
}

export function useBoostHistory({
    page = 1,
    limit = 20,
    enabled = true,
}: UseBoostHistoryOptions = {}) {
    const safePage = Math.max(
        1,
        Math.floor(page),
    );

    const safeLimit = Math.min(
        100,
        Math.max(1, Math.floor(limit)),
    );

    return useQuery({
        queryKey: boostKeys.historyList({
            page: safePage,
            limit: safeLimit,
        }),

        queryFn: () =>
            getUserBoostHistory({
                page: safePage,
                limit: safeLimit,
            }),

        enabled,

        staleTime: 30 * 1000,

        gcTime: 10 * 60 * 1000,

        refetchOnWindowFocus: true,

        retry: 1,
    });
}

// ============================================
// CREATE LISTING BOOST
// ============================================

export function useCreateListingBoost() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: [
            "boosts",
            "create",
        ],

        mutationFn: (
            input: CreateBoostInput,
        ) => createListingBoost(input),

        retry: false,

        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: boostKeys.all,
            });
        },
    });
}

// ============================================
// CANCEL LISTING BOOST
// ============================================

export function useCancelListingBoost() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: [
            "boosts",
            "cancel",
        ],

        mutationFn: (boostId: string) =>
            cancelListingBoost(boostId),

        retry: false,

        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: boostKeys.all,
            });
        },
    });
}