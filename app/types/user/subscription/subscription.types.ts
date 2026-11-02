export type SubscriptionStatus =
    | "PENDING"
    | "ACTIVE"
    | "EXPIRED"
    | "CANCELLED";

export type SubscriptionHistoryEvent =
    | "CREATED"
    | "PAYMENT_PENDING"
    | "PAYMENT_SUCCESS"
    | "PAYMENT_FAILED"
    | "ACTIVATED"
    | "RENEWED"
    | "CANCELLED"
    | "EXPIRED"
    | "REACTIVATED"
    | "REFUNDED"
    | "SUSPENDED"
    | "RESUMED"
    | "CREDIT_GRANTED"
    | "CREDIT_REVOKED";

export interface SubscriptionPlanVersion {
    id: string;
    planId: string;
    version: number;
    price: string;
    currency: string;
    durationDays: number;
    listingCredits: number;
    dealerDiscountPercent: string;
    active: boolean;
    createdAt: string;
}

export interface SubscriptionPlan {
    id: string;
    name: string;
    description: string | null;
    active: boolean;
    createdAt: string;
    updatedAt: string;
    latestVersion?: SubscriptionPlanVersion | null;
    versions?: SubscriptionPlanVersion[];
}

export interface SubscriptionPrice {
    planId: string;
    planVersionId: string;
    planName: string;
    version: number;
    originalPrice: number;
    dealerDiscountPercent: number;
    effectivePrice: number;
    currency: string;
    durationDays: number;
    listingCredits: number;
    isDealer: boolean;
}

export interface UserSubscription {
    id: string;
    userId: string;
    planId: string;
    planVersionId: string;
    status: SubscriptionStatus;

    originalPrice: string;
    dealerDiscountPercent: string;
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

    plan?: {
        id: string;
        name: string;
    };
}

export interface SubscriptionCreditBalance {
    balance: number;
}

export interface CurrentSubscriptionResponse {
    subscription: UserSubscription | null;
    creditBalance: number;
}

export interface SubscriptionPlansResponse {
    plans: SubscriptionPlan[];
}

export interface SubscriptionPriceResponse {
    price: SubscriptionPrice;
}

export interface SubscriptionHistoryItem {
    id: string;
    subscriptionId: string;
    userId: string;
    event: SubscriptionHistoryEvent;
    previousStatus: SubscriptionStatus | null;
    newStatus: SubscriptionStatus | null;
    amount: string | null;
    currency: string | null;
    referenceId: string | null;
    reason: string | null;
    metadata: string | null;
    createdAt: string;
}

export interface InitializeSubscriptionPaymentPayload {
    planId: string;
}

export interface SubscriptionPaymentResult {
    paymentId: string;
    subscriptionId: string;
    reference: string;
    authorizationUrl?: string;
    accessCode?: string;
    amount: number;
    currency: string;
    dealerDiscountPercent: number;
}

export interface VerifyPaymentPayload {
    reference: string;
}

export interface FulfilledPaymentResult {
    payment: unknown;
    subscription: UserSubscription | null;
}

export interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data: T;
}