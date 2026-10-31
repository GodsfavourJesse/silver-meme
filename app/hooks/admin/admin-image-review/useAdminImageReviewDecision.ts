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

import type {
    AdminImageReviewDecisionPayload,
} from "@/app/types/admin/adminImageReview.types";

// ============================================================
// MUTATION VARIABLES
// ============================================================

interface DecisionVariables {
    imageId: string;
    payload: AdminImageReviewDecisionPayload;
}

// ============================================================
// ADMIN IMAGE REVIEW DECISION
// ============================================================

export function useAdminImageReviewDecision() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            imageId,
            payload,
        }: DecisionVariables) =>
            adminImageReviewService.submitDecision(
                imageId,
                payload,
            ),

        onSuccess: async (response, variables) => {
            toast.success(
                response.message ||
                "Image review decision recorded successfully.",
            );

            // Refresh queue and detail queries.
            await queryClient.invalidateQueries({
                queryKey: adminImageReviewKeys.all,
            });

            await queryClient.invalidateQueries({
                queryKey: adminImageReviewKeys.detail(
                    variables.imageId,
                ),
            });
        },

        onError: (error: Error) => {
            toast.error(
                error.message ||
                "Failed to submit image review decision.",
            );
        },
    });
}