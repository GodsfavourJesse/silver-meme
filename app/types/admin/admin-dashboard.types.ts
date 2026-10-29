export interface CurrencyAmount {
    currency: string;
    amount: number;
}

export interface AdminDashboardData {
    generatedAt: string;
    users: {
        total: number;
        active: number;
        suspended: number;
    };
    listings: {
        total: number;
        pending: number;
        approved: number;
        rejected: number;
        suspended: number;
    };
    dealers: {
        pendingApplications: number;
    };
    subscriptions: {
        active: number;
    };
    revenue: {
        successfulPaymentCount: number;
        grossSuccessfulPaymentsByCurrency: CurrencyAmount[];
        grossSuccessfulPaymentsThisMonthByCurrency: CurrencyAmount[];
        note: string;
    };
    payments: {
        total: number;
        failed: number;
    };
    refunds: {
        pendingOrProcessing: number;
    };
    boosts: {
        pendingApproval: number;
        active: number;
    };
    moderation: {
        pendingListings: number;
        pendingOrReviewImages: number;
        pendingReports: number;
    };
}

export interface AdminSystemHealth {
    status: "healthy" | "degraded";
    checkedAt: string;
    uptimeSeconds: number;
    environment: string;
    database: {
        status: "healthy" | "unavailable";
    };
    runtime: {
        nodeVersion: string;
        memory: {
            rssBytes: number;
            heapUsedBytes: number;
            heapTotalBytes: number;
        };
    };
}

export interface AdminListedUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    accountType: string;
    status: "ACTIVE" | "SUSPENDED" | "DELETED";
    createdAt: string;
    roles: string[];
}

export interface AdminNotification {
    id: string;
    type: string;
    title: string;
    message: string;
    data: Record<string, unknown> | null;
    read: boolean;
    createdAt: string;
}

export interface AdminNotificationsData {
    notifications: AdminNotification[];
    unreadCount: number;
}

export interface AdminSession {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
}