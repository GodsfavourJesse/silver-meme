import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/app/lib/query/query-keys";
import { profileService } from "@/app/services/user/profile/profile.service";

import type {
    UpdateUserProfileInput,
    UserProfileWithMembership,
} from "@/app/types/user/profile/profile.types";

/**
 * Update the user's profile and refresh cached user information.
 */
export function useUpdateUserProfile() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (
            input: UpdateUserProfileInput,
        ) => profileService.updateProfile(input),

        onSuccess: async (response) => {
            if (response.data?.user) {
                queryClient.setQueryData<UserProfileWithMembership>(
                    queryKeys.profile.details(),
                    (current) => {
                        if (!current) return current;

                        return {
                            ...current,
                            ...response.data!.user,
                        };
                    },
                );
            }

            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: queryKeys.profile.details(),
                }),

                queryClient.invalidateQueries({
                    queryKey: queryKeys.auth.currentUser(),
                }),
            ]);
        },
    });
}