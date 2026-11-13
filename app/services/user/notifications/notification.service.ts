import { apiRequest } from "@/app/lib/api/api-client";
import { getUserCsrfToken } from "@/app/services/user/auth/csrf.service";

import type {
    NotificationActionResponse,
    NotificationListResponse,
    NotificationPreferencesResponse,
    NotificationUnreadCountResponse,
    PushSubscriptionResponse,
    UserNotification,
} from "@/app/types/user/notifications/notification.types";

const NOTIFICATIONS_ENDPOINT = "/notifications";
const PAGE_SIZE = 100;

export async function getNotifications(
    options: { limit?: number; offset?: number } = {},
    signal?: AbortSignal,
): Promise<NotificationListResponse> {
    const query = new URLSearchParams({
        limit: String(options.limit ?? 30),
        offset: String(options.offset ?? 0),
    });

    return apiRequest<NotificationListResponse>(
        `${NOTIFICATIONS_ENDPOINT}?${query.toString()}`,
        { method: "GET", signal },
    );
}

export async function getUnreadNotificationCount(
    signal?: AbortSignal,
): Promise<NotificationUnreadCountResponse> {
    return apiRequest<NotificationUnreadCountResponse>(
        `${NOTIFICATIONS_ENDPOINT}/unread-count`,
        { method: "GET", signal },
    );
}

export async function getNotificationById(
    notificationId: string,
    signal?: AbortSignal,
): Promise<UserNotification | null> {
    const id = notificationId.trim();
    if (!id) return null;

    // The backend exposes a paginated list but no single-notification GET route.
    // Walk pages so deep links work for older notifications as well.
    for (let offset = 0; offset < 10_000; offset += PAGE_SIZE) {
        const response = await getNotifications(
            { limit: PAGE_SIZE, offset },
            signal,
        );
        const found = response.data.notifications.find(
            (notification) => notification.id === id,
        );

        if (found) return found;
        if (response.data.notifications.length < PAGE_SIZE) return null;
    }

    return null;
}

export async function markNotificationAsRead(
    notificationId: string,
): Promise<NotificationActionResponse> {
    const csrfToken = await getUserCsrfToken();

    return apiRequest<NotificationActionResponse>(
        `${NOTIFICATIONS_ENDPOINT}/${encodeURIComponent(notificationId)}/read`,
        { method: "PATCH", csrfToken },
    );
}

export async function markAllNotificationsAsRead(): Promise<NotificationActionResponse> {
    const csrfToken = await getUserCsrfToken();

    return apiRequest<NotificationActionResponse>(
        `${NOTIFICATIONS_ENDPOINT}/read-all`,
        { method: "POST", csrfToken, body: {} },
    );
}

export async function getNotificationPreferences(
    signal?: AbortSignal,
): Promise<NotificationPreferencesResponse> {
    return apiRequest<NotificationPreferencesResponse>(
        `${NOTIFICATIONS_ENDPOINT}/preferences`,
        { method: "GET", signal },
    );
}

export async function updateNotificationPreferences(input: {
    inAppEnabled?: boolean;
    emailEnabled?: boolean;
}): Promise<NotificationPreferencesResponse> {
    const csrfToken = await getUserCsrfToken();

    return apiRequest<NotificationPreferencesResponse>(
        `${NOTIFICATIONS_ENDPOINT}/preferences`,
        { method: "PATCH", csrfToken, body: input },
    );
}

export async function registerPushSubscription(input: {
    endpoint: string;
    keys: { p256dh: string; auth: string };
    userAgent?: string;
    deviceName?: string;
}): Promise<PushSubscriptionResponse> {
    const csrfToken = await getUserCsrfToken();

    return apiRequest<PushSubscriptionResponse>(
        `${NOTIFICATIONS_ENDPOINT}/push-subscriptions`,
        { method: "POST", csrfToken, body: input },
    );
}

export async function unregisterPushSubscription(
    endpoint: string,
): Promise<void> {
    const csrfToken = await getUserCsrfToken();

    await apiRequest<void>(
        `${NOTIFICATIONS_ENDPOINT}/push-subscriptions`,
        {
            method: "DELETE",
            csrfToken,
            body: { endpoint },
            okStatuses: [204],
        },
    );
}
