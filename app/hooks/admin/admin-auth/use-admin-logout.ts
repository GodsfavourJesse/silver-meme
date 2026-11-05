"use client";

import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { adminAuthService } from "../../../services/admin/admin-auth.service";
import { clearAdminCsrfCache } from "@/app/lib/api/api-client";

export function useAdminLogout() {
    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation({
        mutationFn: async () => {
            const csrfResponse = await adminAuthService.getCsrfToken();
            return adminAuthService.logout(csrfResponse.csrfToken);
        },
        onSettled: async () => {
            // Always discard private admin data locally, even if the network fails.
            await queryClient.cancelQueries();
            queryClient.clear();
            clearAdminCsrfCache();
            router.replace("/ops-center-7k9x/login");
            router.refresh();
        },
    });
}
