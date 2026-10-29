import { queryKeys } from "@/app/lib/query/query-keys";
import { profileService } from "@/app/services/user/profile/profile.service";
import { UpdateUserProfileInput } from "@/app/types/user/profile/profile.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

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
            /*
             * Update the profile cache immediately when the
             * backend returns the updated user.
             */
            if (response.data?.user) {
                queryClient.setQueryData(
                    queryKeys.profile.details(),
                    response.data.user,
                );
            }

            /*
             * Refresh the authenticated-user cache so other
             * dashboard components receive updated information.
             */
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