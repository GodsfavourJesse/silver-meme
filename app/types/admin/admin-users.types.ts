import type { ApiResponse } from "@/app/types/api.types";

// ============================================================
// USER ENUMS
// ============================================================

export type AdminUserAccountType = "USER" | "DEALER";

export type AdminUserStatus =
    | "ACTIVE"
    | "SUSPENDED"
    | "DELETED";

export type AdminUserTypeFilter =
    | "ALL"
    | "USER"
    | "DEALER"
    | "ADMIN";

export type AdminUserStatusFilter =
    | "ALL"
    | AdminUserStatus;

export type AdminUserSort = "newest" | "oldest";

export type AdminUserRole =
    | "SUPER_ADMIN"
    | "ADMIN"
    | "SUPPORT"
    | "CUSTOMER";

// ============================================================
// USER
// ============================================================

export interface AdminUser {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    avatarUrl: string | null;
    accountType: AdminUserAccountType;
    status: AdminUserStatus;
    emailVerified: boolean;
    createdAt: string;
    updatedAt: string;
    roles: AdminUserRole[];
}

// ============================================================
// QUERY AND PAGINATION
// ============================================================

export interface AdminUsersQuery {
    type?: AdminUserTypeFilter;
    status?: AdminUserStatusFilter;
    search?: string;
    page?: number;
    limit?: number;
    sort?: AdminUserSort;
}

export interface AdminUsersPagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface AdminUsersListResponse {
    items: AdminUser[];
    pagination: AdminUsersPagination;
}

// ============================================================
// STATISTICS
// ============================================================

export interface AdminUserStats {
    total: number;
    active: number;
    suspended: number;
    deleted: number;
    dealers: number;
    administrators: number;
}

// ============================================================
// USER DETAILS
// ============================================================

export interface AdminUserListing {
    id: string;
    title: string;
    status: string;
    price: string | number;
    currency: string;
    createdAt: string;
}

export interface AdminUserSubscription {
    id: string;
    status: string;
    effectivePrice: string | number;
    currency: string;
    startsAt: string | null;
    expiresAt: string | null;
    createdAt: string;
}

export interface AdminUserPayment {
    id: string;
    reference: string;
    purpose: string;
    status: string;
    amount: string | number;
    currency: string;
    paidAt: string | null;
    createdAt: string;
}

export interface AdminUserDealerApplication {
    id: string;
    companyName: string;
    status: string;
    createdAt: string;
    reviewedAt: string | null;
}

export interface AdminUserRelatedData {
    recentListings: AdminUserListing[];
    recentSubscriptions: AdminUserSubscription[];
    recentPayments: AdminUserPayment[];
    dealerApplications: AdminUserDealerApplication[];
}

export interface AdminUserDetails extends AdminUser {
    related: AdminUserRelatedData;
}

// ============================================================
// API RESPONSES
// ============================================================

export type AdminUsersApiResponse =
    ApiResponse<AdminUser[]> & {
        pagination: AdminUsersPagination;
    };

export type AdminUserApiResponse =
    ApiResponse<AdminUserDetails>;

export type AdminUserStatsApiResponse =
    ApiResponse<AdminUserStats>;

// ============================================================
// ACTIONS
// ============================================================

export interface AdminUserStatusActionRequest {
    reason?: string;
}

export interface AdminUserRoleUpdateRequest {
    roles: AdminUserRole[];
}

export interface AdminUserEmailRequest {
    subject: string;
    message: string;
}

export type AdminUserActionApiResponse =
    ApiResponse<unknown>;
