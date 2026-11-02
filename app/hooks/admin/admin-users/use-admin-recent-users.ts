import { useQuery } from "@tanstack/react-query";
import type { AdminListedUser } from "@/app/types/admin/admin-dashboard.types";
import { adminDashboardKeys } from "../admin-dashboard/admin-dashboard-query-keys";
import { adminFetch } from "@/app/lib/api/api-client";

export function useAdminRecentUsers() {
    return useQuery({
        queryKey: adminDashboardKeys.recentUsers(),
        refetchInterval: 30_000,
        queryFn: async (): Promise<AdminListedUser[]> => {
            const response = await adminFetch<AdminListedUser[]>("/users", {
                query: {
                    limit: 6,
                    sort: "newest",
                    type: "ALL",
                    status: "ALL",
                },
            });

            return response.data;
        },
    });
}