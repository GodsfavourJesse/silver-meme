import {
    InfiniteData,
    useInfiniteQuery,
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";

import {
    getNotificationById,
    getNotificationPreferences,
    getNotifications,
    getUnreadNotificationCount,
    markAllNotificationsAsRead,
    markNotificationAsRead,
    updateNotificationPreferences,
} from "@/app/services/user/notifications/notification.service";

import type {
    NotificationListResponse,
    NotificationPreferences,
} from "@/app/types/user/notifications/notification.types";

export const notificationQueryKeys = {
    all: ["user", "notifications"] as const,
    list: (limit: number) => ["user", "notifications", "list", limit] as const,
    unreadCount: ["user", "notifications", "unread-count"] as const,
    preferences: ["user", "notifications", "preferences"] as const,
    detail: (id: string) => ["user", "notifications", "detail", id] as const,
};

export function useNotifications(limit = 30) {
    return useInfiniteQuery({
        queryKey: notificationQueryKeys.list(limit),
        initialPageParam: 0,
        queryFn: ({ pageParam, signal }) =>
            getNotifications({ limit, offset: pageParam }, signal),
        getNextPageParam: (lastPage, _pages, lastOffset) =>
            lastPage.data.notifications.length === limit
                ? lastOffset + limit
                : undefined,
        refetchInterval: 30_000,
        refetchOnWindowFocus: true,
    });
}

export function useUnreadNotificationCount() {
    return useQuery({
        queryKey: notificationQueryKeys.unreadCount,
        queryFn: async ({ signal }) => {
            const response = await getUnreadNotificationCount(signal);
            return response.data.unreadCount;
        },
        refetchInterval: 30_000,
        refetchOnWindowFocus: true,
    });
}

export function useNotificationPreferences() {
    return useQuery({
        queryKey: notificationQueryKeys.preferences,
        queryFn: async ({ signal }) => {
            const response = await getNotificationPreferences(signal);
            return response.data.preferences;
        },
    });
}

export function useNotification(notificationId: string) {
    return useQuery({
        queryKey: notificationQueryKeys.detail(notificationId),
        queryFn: ({ signal }) => getNotificationById(notificationId, signal),
        enabled: Boolean(notificationId),
    });
}

function invalidateNotificationData(
    queryClient: ReturnType<typeof useQueryClient>,
) {
    void queryClient.invalidateQueries({ queryKey: notificationQueryKeys.all });
}

export function useMarkNotificationRead() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: markNotificationAsRead,
        onSuccess: () => invalidateNotificationData(queryClient),
    });
}

export function useMarkAllNotificationsRead() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: markAllNotificationsAsRead,
        onSuccess: () => invalidateNotificationData(queryClient),
    });
}

export function useUpdateNotificationPreferences() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateNotificationPreferences,
        onMutate: async (patch) => {
            await queryClient.cancelQueries({
                queryKey: notificationQueryKeys.preferences,
            });
            const previous = queryClient.getQueryData<NotificationPreferences>(
                notificationQueryKeys.preferences,
            );
            if (previous) {
                queryClient.setQueryData<NotificationPreferences>(
                    notificationQueryKeys.preferences,
                    { ...previous, ...patch, updatedAt: new Date().toISOString() },
                );
            }
            return { previous };
        },
        onError: (_error, _patch, context) => {
            if (context?.previous) {
                queryClient.setQueryData(
                    notificationQueryKeys.preferences,
                    context.previous,
                );
            }
        },
        onSettled: () => invalidateNotificationData(queryClient),
    });
}

export function getNotificationPages(
    data: InfiniteData<NotificationListResponse> | undefined,
) {
    return data?.pages.flatMap((page) => page.data.notifications) ?? [];
}
