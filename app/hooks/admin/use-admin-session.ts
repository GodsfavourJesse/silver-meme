import { useQuery } from "@tanstack/react-query";

import { adminFetch } from "@/app/lib/admin/admin-fetch";
import type { AdminSession } from "@/app/types/admin/admin-dashboard.types";
import { adminDashboardKeys } from "./admin-dashboard/admin-dashboard-query-keys";

export function useAdminSession() {
    return useQuery({
        queryKey: adminDashboardKeys.session(),
        retry: false,
        staleTime: 5 * 60_000,
        queryFn: async (): Promise<AdminSession> => {
            const response = await adminFetch<
                AdminSession | { admin: AdminSession }
            >("/auth/me");

            const payload = response.data;

            return "admin" in payload ? payload.admin : payload;
        },
    });
}