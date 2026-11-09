/* =========================================
   ADMIN SUBSCRIPTION STATUS
========================================= */

import {
    SubscriptionPlanVersion,
    SubscriptionStatus,
} from "../user/subscription/subscription.types";

export type AdminSubscriptionStatus = SubscriptionStatus;

/* =========================================
   SUBSCRIPTION PLAN
========================================= */

export interface AdminSubscriptionPlan {
    id: string;
    name: string;
    description: string | null;
    active: boolean;
    createdAt: string;
    updatedAt: string;

    latestVersion: SubscriptionPlanVersion | null;

    versions: SubscriptionPlanVersion[];
}

/* =========================================
   SUBSCRIPTION RECORD
========================================= */

export interface AdminSubscriptionUser {
    id: string;
    email: string | null;
    firstName: string | null;
    lastName: string | null;
    accountType: string;
    status: string;
}

export interface AdminSubscriptionPlanSummary {
    id: string;
    name: string;
}

export interface AdminSubscription {
    id: string;
    userId: string;
    planId: string;
    planVersionId: string;

    status: AdminSubscriptionStatus;

    originalPrice: string;

    normalUserDiscountPercent: string;
    dealerDiscountPercent: string;
    appliedDiscountPercent: string;

    effectivePrice: string;
    currency: string;

    durationDays: number;
    listingCredits: number;

    startsAt: string | null;
    expiresAt: string | null;

    cancelledAt: string | null;
    cancellationReason: string | null;

    previousSubscriptionId: string | null;

    createdAt: string;
    updatedAt: string;

    user: AdminSubscriptionUser;
    plan: AdminSubscriptionPlanSummary;
}

/* =========================================
   ADMIN SUBSCRIPTION FILTERS
========================================= */

export interface AdminSubscriptionFilters {
    page?: number;
    limit?: number;
    status?: AdminSubscriptionStatus;
}

export interface AdminSubscriptionPagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface AdminSubscriptionsResponse {
    items: AdminSubscription[];
    pagination: AdminSubscriptionPagination;
}

/* =========================================
   CREATE SUBSCRIPTION PLAN
========================================= */

export interface CreateAdminSubscriptionPlanPayload {
    name: string;
    description?: string | null;
    price: number;
    currency?: string;
    durationDays: number;
    listingCredits: number;

    normalUserDiscountPercent?: number;
    dealerDiscountPercent?: number;
}

export interface CreateAdminSubscriptionPlanResponse {
    plan: AdminSubscriptionPlan;
}

/* =========================================
   UPDATE SUBSCRIPTION PLAN
========================================= */

export interface UpdateAdminSubscriptionPlanPayload {
    name?: string;
    description?: string | null;
    price?: number;
    currency?: string;
    durationDays?: number;
    listingCredits?: number;

    normalUserDiscountPercent?: number;
    dealerDiscountPercent?: number;

    active?: boolean;
}

export interface UpdateAdminSubscriptionPlanResponse {
    plan: AdminSubscriptionPlan;
}

/* =========================================
   ADMIN API RESPONSE
========================================= */

export interface AdminApiResponse<T> {
    success: boolean;
    message?: string;
    data: T;
}