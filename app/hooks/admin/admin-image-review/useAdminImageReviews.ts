"use client";

import {
    useQuery,
} from "@tanstack/react-query";

import {
    adminImageReviewService,
} from "@/app/services/admin/admin-image-review.service";

import type {
    AdminImageReviewQuery,
} from "@/app/types/admin/adminImageReview.types";

// ============================================================
// QUERY KEYS
// ============================================================

export const adminImageReviewKeys = {
    all: ["admin", "image-reviews"] as const,

    lists: () =>
        [...adminImageReviewKeys.all, "list"] as const,

    list: (params: AdminImageReviewQuery) =>
        [...adminImageReviewKeys.lists(), params] as const,

    details: () =>
        [...adminImageReviewKeys.all, "detail"] as const,

    detail: (imageId: string) =>
        [...adminImageReviewKeys.details(), imageId] as const,
};

// ============================================================
// IMAGE REVIEW QUEUE
// ============================================================

export function useAdminImageReviews(
    params: AdminImageReviewQuery,
) {
    return useQuery({
        queryKey: adminImageReviewKeys.list(params),

        queryFn: () =>
            adminImageReviewService.findAll(params),

        staleTime: 30_000,

        retry: 1,

        refetchOnWindowFocus: true,
    });
}