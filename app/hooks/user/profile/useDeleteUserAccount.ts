import { queryKeys } from "@/app/lib/query/query-keys";
import { profileService } from "@/app/services/user/profile/profile.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * Delete the authenticated user's account.
 *
 * The page is responsible for redirecting the user after
 * the deletion request succeeds.
 */
export function useDeleteUserAccount() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => profileService.deleteAccount(),

        onSuccess: () => {
            /*
             * Ensure the deleted user is no longer represented
             * as authenticated in the client-side cache.
             */
            queryClient.setQueryData(
                queryKeys.auth.currentUser(),
                null,
            );

            /*
             * Remove the user's cached profile information.
             */
            queryClient.removeQueries({
                queryKey: queryKeys.profile.all,
            });

            /*
             * Refresh other components that depend on the
             * authenticated user's information.
             */
            void queryClient.invalidateQueries({
                queryKey: queryKeys.auth.all,
            });
        },
    });
}