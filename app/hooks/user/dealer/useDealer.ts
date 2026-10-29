"use client";

import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";

import { queryKeys } from "@/app/lib/query/query-keys";
import { dealerService } from "@/app/services/user/dealer/dealer.service";

import type {
    ApplyAsDealerInput,
    PublicDealersQuery,
    UploadDealerDocumentInput,
} from "@/app/types/user/dealer/dealer.types";

// ============================================================
// APPLY AS DEALER
// ============================================================

export function useApplyAsDealer() {
    return useMutation({
        mutationFn: (input: ApplyAsDealerInput) =>
            dealerService.applyAsDealer(input),
    });
}

// ============================================================
// DEALER DOCUMENTS
// ============================================================

export function useDealerDocuments(
    applicationId: string | undefined,
) {
    return useQuery({
        queryKey: queryKeys.dealer.documents(
            applicationId ?? "",
        ),

        queryFn: async () => {
            const response =
                await dealerService.getDealerDocuments(
                    applicationId!,
                );

            return response.data.documents;
        },

        enabled: Boolean(applicationId),
    });
}

export function useUploadDealerDocument() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: UploadDealerDocumentInput) =>
            dealerService.uploadDealerDocument(input),

        onSuccess: async (_response, variables) => {
            await queryClient.invalidateQueries({
                queryKey: queryKeys.dealer.documents(
                    variables.applicationId,
                ),
            });
        },
    });
}

export function useGetDealerDocumentUrl() {
    return useMutation({
        mutationFn: (documentId: string) =>
            dealerService.getDealerDocumentUrl(documentId),
    });
}

export function useDeleteDealerDocument(
    applicationId: string,
) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (documentId: string) =>
            dealerService.deleteDealerDocument(documentId),

        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: queryKeys.dealer.documents(
                    applicationId,
                ),
            });
        },
    });
}

// ============================================================
// DEALER ANALYTICS
// ============================================================

export function useDealerAnalytics() {
    return useQuery({
        queryKey: queryKeys.dealer.analytics(),
        queryFn: () => dealerService.getDealerAnalytics(),
    });
}

// ============================================================
// PUBLIC DEALER PROFILE
// ============================================================

export function usePublicDealerProfile(
    dealerId: string | undefined,
) {
    return useQuery({
        queryKey: queryKeys.dealer.publicProfile(
            dealerId ?? "",
        ),

        queryFn: () =>
            dealerService.getPublicDealerProfile(dealerId!),

        enabled: Boolean(dealerId),

        staleTime: 30_000,

        refetchOnWindowFocus: true,

        refetchOnReconnect: true,
    });
}

export function usePublicDealers(
    query: PublicDealersQuery = {},
) {
    const search = query.search?.trim() ?? "";
    const page = query.page ?? 1;
    const limit = query.limit ?? 12;

    return useQuery({
        queryKey: queryKeys.dealer.publicDirectory(
            search,
            page,
            limit,
        ),

        queryFn: () =>
            dealerService.getPublicDealers({
                search,
                page,
                limit,
            }),

        staleTime: 30_000,

        refetchOnWindowFocus: true,

        refetchOnReconnect: true,
    });
}


// ============================================================
// PUBLIC DEALER LISTINGS
// ============================================================

export function usePublicDealerListings(
    dealerId: string | undefined,
    page = 1,
    limit = 12,
) {
    return useQuery({
        queryKey: queryKeys.dealer.publicListings(
            dealerId ?? "",
            page,
            limit,
        ),
        queryFn: () =>
            dealerService.getPublicDealerListings(
                dealerId!,
                page,
                limit,
            ),
        enabled: Boolean(dealerId),
    });
}