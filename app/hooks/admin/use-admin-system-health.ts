import { useQuery } from "@tanstack/react-query";

import { adminFetch } from "@/app/lib/admin/admin-fetch";
import type { AdminSystemHealth } from "@/app/types/admin/admin-dashboard.types";
import { adminDashboardKeys } from "./admin-dashboard/admin-dashboard-query-keys";

export function useAdminSystemHealth() {
    return useQuery({
        queryKey: adminDashboardKeys.health(),
        refetchInterval: 30_000,
        queryFn: async (): Promise<AdminSystemHealth> => {
            /*
             * The backend answers 503 with a full body when the
             * database is down. That is data, not a failure.
             */
            const response = await adminFetch<AdminSystemHealth>(
                "/dashboard/system-health",
                { okStatuses: [503] },
            );

            return response.data;
        },
    });
}