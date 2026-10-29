import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { adminFetch } from "@/app/lib/admin/admin-fetch";
import type { AdminNotificationsData } from "@/app/types/admin/admin-dashboard.types";
import { adminDashboardKeys } from "./admin-dashboard/admin-dashboard-query-keys";

export function useAdminNotifications() {
    return useQuery({
        queryKey: adminDashboardKeys.notifications(),
        refetchInterval: 30_000,
        refetchOnWindowFocus: true,
        queryFn: async (): Promise<AdminNotificationsData> => {
            const response = await adminFetch<AdminNotificationsData>(
                "/notifications",
                { query: { limit: 20 } },
            );

            return response.data;
        },
    });
}

export function useMarkNotificationRead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (notificationId: string) =>
            adminFetch(`/notifications/${notificationId}/read`, {
                method: "PATCH",
            }),
        onSuccess: () =>
            queryClient.invalidateQueries({
                queryKey: adminDashboardKeys.notifications(),
            }),
    });
}

export function useMarkAllNotificationsRead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () =>
            adminFetch("/notifications/read-all", { method: "POST" }),
        onSuccess: () =>
            queryClient.invalidateQueries({
                queryKey: adminDashboardKeys.notifications(),
            }),
    });
}