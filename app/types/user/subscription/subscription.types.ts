export type PaymentStatus =
    | "STARTED"
    | "ABANDONED"
    | "FAILED"
    | "SUCCESS";

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

/* =========================================
   SUBSCRIPTION PLAN VERSION
========================================= */

export interface SubscriptionPlanVersion {
    id: string;
    planId: string;
    version: number;

    price: string;
    currency: string;

    durationDays: number;
    listingCredits: number;

    normalUserDiscountPercent: string;
    dealerDiscountPercent: string;

    active: boolean;
    createdAt: string;
}

/* =========================================
   SUBSCRIPTION PLAN
========================================= */

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

/* =========================================
   SUBSCRIPTION PRICE
========================================= */

export interface SubscriptionPrice {
    planId: string;
    planVersionId: string;
    planName: string;
    version: number;

    originalPrice: string;

    normalUserDiscountPercent: string;
    dealerDiscountPercent: string;
    appliedDiscountPercent: string;

    effectivePrice: string;
    currency: string;

    durationDays: number;
    listingCredits: number;

    isDealer: boolean;
}

/* =========================================
   USER SUBSCRIPTION
========================================= */

export interface UserSubscription {
    id: string;
    userId: string;
    planId: string;
    planVersionId: string;

    status: SubscriptionStatus;

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

    plan?: {
        id: string;
        name: string;
    };
}

/* =========================================
   SUBSCRIPTION CREDIT BALANCE
========================================= */

export interface SubscriptionCreditBalance {
    balance: number;
}

/* =========================================
   CURRENT SUBSCRIPTION RESPONSE
========================================= */

export interface CurrentSubscriptionResponse {
    subscription: UserSubscription | null;
    creditBalance: number;
}

/* =========================================
   SUBSCRIPTION PLANS RESPONSE
========================================= */

export interface SubscriptionPlansResponse {
    plans: SubscriptionPlan[];
}

/* =========================================
   SUBSCRIPTION PRICE RESPONSE
========================================= */

export interface SubscriptionPriceResponse {
    price: SubscriptionPrice;
}

/* =========================================
   SUBSCRIPTION HISTORY
========================================= */

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

/* =========================================
   INITIALIZE SUBSCRIPTION PAYMENT
========================================= */

export interface InitializeSubscriptionPaymentPayload {
    planId: string;
}

/* =========================================
   PAYMENT SESSION
========================================= */

export interface PaymentSessionResult {
    paymentId: string;
    reference: string;
    status: PaymentStatus;
    canResume: boolean;

    authorizationUrl?: string;
    accessCode?: string;

    amount: number;
    currency: string;
}

/* =========================================
   SUBSCRIPTION PAYMENT RESULT
========================================= */

export interface SubscriptionPaymentResult
    extends PaymentSessionResult {
    subscriptionId: string;

    normalUserDiscountPercent: number;
    dealerDiscountPercent: number;
    appliedDiscountPercent: number;
}

/* =========================================
   VERIFY PAYMENT
========================================= */

export interface VerifyPaymentPayload {
    reference: string;
}

export interface FulfilledPaymentResult {
    payment: unknown;
    subscription: UserSubscription | null;
}

/* =========================================
   API RESPONSE
========================================= */

export interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data: T;
}