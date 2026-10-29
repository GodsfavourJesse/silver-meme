"use client";

import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import { useRouter } from "next/navigation";

import { adminAuthService } from "../../../services/admin/admin-auth.service";

export function useAdminLogout() {
    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation({
        mutationFn: async () => {
            // Step 1: Obtain a CSRF token for the authenticated admin.
            const csrfResponse =
                await adminAuthService.getCsrfToken();

            // Step 2: Send the token with the logout request.
            return adminAuthService.logout(
                csrfResponse.csrfToken,
            );
        },

        onSuccess: async () => {
            // Clear cached user and dashboard information.
            queryClient.clear();

            // Redirect to the admin login page.
            router.replace("/ops-center-7k9x/login");
        },
    });
}