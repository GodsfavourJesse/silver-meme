"use client";

import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";

import { toast } from "sonner";

import { dealerService } from "@/app/services/user/dealer/dealer.service";

import type {
    DealerProfileMutationResponse,
    DealerProfileResponse,
} from "@/app/types/user/dealer/dealer.types";

const DEALER_PROFILE_QUERY_KEY = ["dealer", "my-profile"] as const;

export function useMyDealerProfile() {
    return useQuery<DealerProfileResponse>({
        queryKey: DEALER_PROFILE_QUERY_KEY,
        queryFn: () => dealerService.getMyProfile(),
        staleTime: 1000 * 60 * 5,
    });
}

export function useUpdateDealerBio() {
    const queryClient = useQueryClient();

    return useMutation<
        DealerProfileMutationResponse,
        Error,
        string
    >({
        mutationFn: (bio) => dealerService.updateMyBio(bio),

        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: DEALER_PROFILE_QUERY_KEY,
            });

            await queryClient.invalidateQueries({
                queryKey: ["dealer"],
            });

            toast.success("Dealer bio updated successfully.");
        },

        onError: (error) => {
            toast.error(error.message || "Failed to update dealer bio.");
        },
    });
}

export function useUploadDealerProfilePicture() {
    const queryClient = useQueryClient();

    return useMutation<
        DealerProfileMutationResponse,
        Error,
        File
    >({
        mutationFn: (file) =>
            dealerService.uploadMyProfilePicture(file),

        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: DEALER_PROFILE_QUERY_KEY,
            });

            await queryClient.invalidateQueries({
                queryKey: ["dealer"],
            });

            toast.success("Profile picture updated successfully.");
        },

        onError: (error) => {
            toast.error(
                error.message || "Failed to upload profile picture.",
            );
        },
    });
}

export function useUploadDealerCoverPhoto() {
    const queryClient = useQueryClient();

    return useMutation<
        DealerProfileMutationResponse,
        Error,
        File
    >({
        mutationFn: (file) =>
            dealerService.uploadMyCoverPhoto(file),

        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: DEALER_PROFILE_QUERY_KEY,
            });

            await queryClient.invalidateQueries({
                queryKey: ["dealer"],
            });

            toast.success("Cover photo updated successfully.");
        },

        onError: (error) => {
            toast.error(
                error.message || "Failed to upload cover photo.",
            );
        },
    });
}