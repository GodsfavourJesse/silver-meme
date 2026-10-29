import { useQuery } from "@tanstack/react-query";

import { adminFetch } from "@/app/lib/admin/admin-fetch";
import { ApiError } from "@/app/lib/api/api-error";
import type { AdminDashboardData } from "@/app/types/admin/admin-dashboard.types";
import { adminDashboardKeys } from "./admin-dashboard-query-keys";

export function useAdminDashboard() {
    return useQuery({
        queryKey: adminDashboardKeys.summary(),
        refetchInterval: (query) => (query.state.status === "error" ? false : 60_000),
        retry: (failureCount, error) => {
            if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
                return false;
            }

            return failureCount < 1;
        },
        queryFn: async (): Promise<AdminDashboardData> => {
            const response = await adminFetch<AdminDashboardData>("/dashboard");

            return response.data;
        },
    });
}