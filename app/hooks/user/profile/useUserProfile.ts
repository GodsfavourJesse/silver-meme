"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/app/lib/query/query-keys";

import { profileService } from "@/app/services/user/profile/profile.service";

import type {
    UserProfileWithMembership,
} from "@/app/types/user/profile/profile.types";

// PROFILE QUERY
// Fetch the authenticated user's profile, listing credits,
// and current subscription.
export function useUserProfile() {
    return useQuery<UserProfileWithMembership>({
        queryKey: queryKeys.profile.details(),

        queryFn: async () => {
            const response =
                await profileService.getProfile();

            const data = response.data;

            return {
                ...data.user,
                credits: data.credits,
                currentSubscription: data.currentSubscription,
            };
        },

        staleTime: 30_000,

        retry: 1,

        refetchOnWindowFocus: true,
    });
}