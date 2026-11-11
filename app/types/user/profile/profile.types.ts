import type { AuthUser } from "@/app/types/user/auth.types";

export type UserProfile = AuthUser & {
    whatsappPhone: string | null;
};

export type UserProfileWithMembership = UserProfile & {
    credits: UserCreditBreakdown;
    currentSubscription: UserCurrentSubscription | null;
};

/**
 * Individual credit pool balance.
 */
export interface UserCreditSourceBalance {
    total: number;
    used: number;
    remaining: number;
}

/**
 * Complete listing credit breakdown.
 */
export interface UserCreditBreakdown {
    free: UserCreditSourceBalance;
    subscribed: UserCreditSourceBalance;
    adjustment: UserCreditSourceBalance;
    totalRemaining: number;
}

/**
 * Currently active subscription.
 */
export interface UserCurrentSubscription {
    id: string;

    planId: string;
    planVersionId: string | null;

    planName: string;
    planVersion: number | null;

    status: string;

    originalPrice: string | number;
    dealerDiscountPercent: string | number | null;

    effectivePrice: string | number;
    currency: string;

    durationDays: number;
    listingCredits: number;

    startsAt: string | null;
    expiresAt: string | null;

    createdAt: string;
}

/**
 * Profile data returned by GET /me.
 */
export interface UserAccountOverview {
    user: UserProfile;
    credits: UserCreditBreakdown;
    currentSubscription: UserCurrentSubscription | null;
}

/**
 * Fields editable from the profile page.
 */
export interface UpdateUserProfileInput {
    firstName: string;
    lastName: string;
    phone?: string | null;
    whatsappPhone?: string | null;
}

/**
 * User privacy preferences.
 */
export interface UserPrivacySettings {
    showPhone: boolean;
    showWhatsapp: boolean;
    showEmail: boolean;

    allowDirectMessages: boolean;
    showOnlineStatus: boolean;

    allowMarketingEmails: boolean;
    allowMarketingSms: boolean;
}

/**
 * Partial privacy update.
 */
export type UpdateUserPrivacyInput =
    Partial<UserPrivacySettings>;

/**
 * Profile API response.
 */
export interface UserProfileResponse {
    success: true;
    data: {
        user: UserProfile;
        privacy: UserPrivacySettings;
        credits: UserCreditBreakdown;
        currentSubscription: UserCurrentSubscription | null;
    };
    message?: string;
}

/**
 * Privacy settings API response.
 */
export interface UserPrivacyResponse {
    success: true;
    data: {
        privacy: UserPrivacySettings;
    };
    message?: string;
}

/**
 * Standard mutation response.
 */
export interface UserProfileMutationResponse {
    success: true;
    data?: {
        user?: UserProfile;
        privacy?: UserPrivacySettings;
    };
    message?: string;
}

/**
 * Account deletion response.
 */
export interface DeleteUserAccountResponse {
    success: true;
    message?: string;
}