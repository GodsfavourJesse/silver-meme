export const notificationTypes = [
    "GENERAL",
    "LISTING_SUBMITTED",
    "LISTING_APPROVED",
    "LISTING_REJECTED",
    "LISTING_EXPIRED",
    "LISTING_SOLD",
    "SUBSCRIPTION_PAYMENT_PENDING",
    "SUBSCRIPTION_ACTIVATED",
    "SUBSCRIPTION_EXPIRED",
    "SUBSCRIPTION_EXPIRY_REMINDER",
    "BOOST_PAYMENT_PENDING",
    "BOOST_PAYMENT_SUCCESSFUL",
    "BOOST_PAYMENT_RECEIVED",
    "BOOST_ACTIVATED",
    "BOOST_EXPIRY_REMINDER",
    "SUBSCRIPTION_CREDITS_EXHAUSTED",
    "BOOST_EXPIRED",
    "MESSAGE_RECEIVED",
    "DEALER_VERIFIED",
    "DEALER_APPLICATION_REJECTED",
] as const;

export type NotificationType = (typeof notificationTypes)[number];

export interface UserNotification {
    id: string;
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    data: Record<string, unknown> | null;
    idempotencyKey: string | null;
    read: boolean;
    readAt: string | null;
    createdAt: string;
}

export interface NotificationPreferences {
    id: string;
    userId: string;
    inAppEnabled: boolean;
    emailEnabled: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface NotificationListResponse {
    success: boolean;
    data: {
        notifications: UserNotification[];
        unreadCount: number;
    };
    message?: string;
}

export interface NotificationUnreadCountResponse {
    success: boolean;
    data: { unreadCount: number };
    message?: string;
}

export interface NotificationActionResponse {
    success: boolean;
    data: {
        notification?: UserNotification;
        markedRead?: number;
    };
    message?: string;
}

export interface NotificationPreferencesResponse {
    success: boolean;
    data: { preferences: NotificationPreferences };
    message?: string;
}

export interface PushSubscriptionResponse {
    success: boolean;
    data: { subscription: { id: string; endpoint: string; active: boolean } };
    message?: string;
}
