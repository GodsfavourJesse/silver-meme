import { useQuery } from "@tanstack/react-query";
import { UserPrivacySettings } from "@/app/types/user/profile/profile.types";
import { queryKeys } from "@/app/lib/query/query-keys";
import { profileService } from "@/app/services/user/profile/profile.service";

/**
 * Fetch the user's privacy preferences.
 */
export function useUserPrivacySettings() {
    return useQuery<UserPrivacySettings>({
        queryKey: queryKeys.profile.privacy(),

        queryFn: async () => {
            const response =
                await profileService.getPrivacySettings();

            return response.data.privacy;
        },

        staleTime: 30_000,

        retry: 1,

        refetchOnWindowFocus: true,
    });
}