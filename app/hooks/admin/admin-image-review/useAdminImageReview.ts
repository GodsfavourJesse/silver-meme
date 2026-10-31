"use client";

import {
    useQuery,
} from "@tanstack/react-query";

import {
    adminImageReviewKeys,
} from "./useAdminImageReviews";

import {
    adminImageReviewService,
} from "@/app/services/admin/admin-image-review.service";

// ============================================================
// IMAGE REVIEW DETAILS
// ============================================================

export function useAdminImageReview(
    imageId: string,
) {
    return useQuery({
        queryKey: adminImageReviewKeys.detail(imageId),

        queryFn: () =>
            adminImageReviewService.findById(imageId),

        enabled: Boolean(imageId),

        staleTime: 15_000,

        retry: 1,

        refetchOnWindowFocus: true,
    });
}