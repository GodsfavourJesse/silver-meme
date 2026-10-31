"use client";

import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import {
    toast,
} from "sonner";

import {
    adminImageReviewKeys,
} from "./useAdminImageReviews";

import {
    adminImageReviewService,
} from "@/app/services/admin/admin-image-review.service";

// ============================================================
// RETRY IMAGE ANALYSIS
// ============================================================

export function useRetryAdminImageAnalysis() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (imageId: string) =>
            adminImageReviewService.retryAnalysis(
                imageId,
            ),

        onSuccess: async (response, imageId) => {
            toast.success(
                response.message ||
                "Image analysis queued successfully.",
            );

            await queryClient.invalidateQueries({
                queryKey: adminImageReviewKeys.all,
            });

            await queryClient.invalidateQueries({
                queryKey: adminImageReviewKeys.detail(
                    imageId,
                ),
            });
        },

        onError: (error: Error) => {
            toast.error(
                error.message ||
                "Unable to retry image analysis.",
            );
        },
    });
}