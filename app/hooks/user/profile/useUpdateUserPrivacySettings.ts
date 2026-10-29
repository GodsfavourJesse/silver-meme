import { queryKeys } from "@/app/lib/query/query-keys";
import { profileService } from "@/app/services/user/profile/profile.service";
import { UpdateUserPrivacyInput } from "@/app/types/user/profile/profile.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * Update privacy preferences and refresh the privacy cache.
 */
export function useUpdateUserPrivacySettings() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (
            input: UpdateUserPrivacyInput,
        ) => profileService.updatePrivacySettings(input),

        onSuccess: async (response) => {
            /*
             * Cache the returned privacy settings when available.
             */
            if (response.data?.privacy) {
                queryClient.setQueryData(
                    queryKeys.profile.privacy(),
                    response.data.privacy,
                );
            }

            await queryClient.invalidateQueries({
                queryKey: queryKeys.profile.privacy(),
            });
        },
    });
}