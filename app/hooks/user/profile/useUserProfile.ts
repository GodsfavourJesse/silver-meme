"use client";

import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";

import { queryKeys } from "@/app/lib/query/query-keys";

import { profileService } from "@/app/services/user/profile/profile.service";

import type {
    UpdateUserPrivacyInput,
    UpdateUserProfileInput,
    UserPrivacySettings,
    UserProfile,
} from "@/app/types/user/profile/profile.types";

/* ============================================================
   PROFILE QUERY
============================================================ */

/**
 * Fetch the authenticated user's profile.
 */
export function useUserProfile() {
    return useQuery<UserProfile>({
        queryKey: queryKeys.profile.details(),

        queryFn: async () => {
            const response =
                await profileService.getProfile();

            return response.data.user;
        },

        staleTime: 30_000,

        retry: 1,

        refetchOnWindowFocus: true,
    });
}

/* ============================================================
   UPDATE PROFILE
============================================================ */


/* ============================================================
   PRIVACY QUERY
============================================================ */



/* ============================================================
   UPDATE PRIVACY SETTINGS
============================================================ */


/* ============================================================
   DELETE ACCOUNT
============================================================ */
