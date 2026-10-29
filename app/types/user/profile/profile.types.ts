import type { AuthUser } from "@/app/types/user/auth.types";

/**
 * The user's profile information.
 *
 * Extends the existing authenticated-user type so that
 * we don't unnecessarily duplicate authentication fields.
 */
export interface UserProfile extends AuthUser {}

/**
 * Fields editable from the profile page.
 *
 * Keep this aligned with the fields accepted by PATCH /me.
 */
export interface UpdateUserProfileInput {
    firstName: string;
    lastName: string;
    phone?: string | null;
}

/**
 * The user's privacy preferences and phone visibility eligibility.
 *
 * The eligibility fields are calculated by the backend.
 * They are not user-editable privacy settings.
 */
export interface UserPrivacySettings {
    showPhone: boolean;
    showEmail: boolean;
    allowDirectMessages: boolean;
    showOnlineStatus: boolean;
    allowMarketingEmails: boolean;
    allowMarketingSms: boolean;

    isVerifiedDealer: boolean;
    canShowPhone: boolean;
}

/**
 * Fields submitted when the user updates privacy settings.
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