import { apiRequest } from "@/app/lib/api/api-client";

import type {
    UserPrivacyResponse,
    UserProfileMutationResponse,
    UserProfileResponse,
    UpdateUserPrivacyInput,
    UpdateUserProfileInput,
    DeleteUserAccountResponse,
} from "@/app/types/user/profile/profile.types";
import { getUserCsrfToken } from "../auth/csrf.service";

const PROFILE_ENDPOINT = "/me";
const PRIVACY_ENDPOINT = "/me/privacy";

/**

* Fetch the authenticated user's profile.
  */
async function getProfile(): Promise<UserProfileResponse> {
    return apiRequest<UserProfileResponse>(
        PROFILE_ENDPOINT,
        {
            method: "GET",
        },
    );
}

/**

* Update the authenticated user's profile.
*
* A CSRF token is required for this mutation.
  */
async function updateProfile(
    input: UpdateUserProfileInput,
): Promise<UserProfileMutationResponse> {
    const csrfToken = await getUserCsrfToken();

    return apiRequest<UserProfileMutationResponse>(
        PROFILE_ENDPOINT,
        {
            method: "PATCH",
            csrfToken,
            body: input,
        },
    );
}

/**

* Fetch the authenticated user's privacy settings.
  */
async function getPrivacySettings(): Promise<UserPrivacyResponse> {
    return apiRequest<UserPrivacyResponse>(
        PRIVACY_ENDPOINT,
        {
            method: "GET",
        },
    );
}

/**

* Update the authenticated user's privacy settings.
*
* A CSRF token is required for this mutation.
  */
async function updatePrivacySettings(
    input: UpdateUserPrivacyInput,
): Promise<UserProfileMutationResponse> {
    const csrfToken = await getUserCsrfToken();

    return apiRequest<UserProfileMutationResponse>(
        PRIVACY_ENDPOINT,
        {
            method: "PATCH",
            csrfToken,
            body: input,
        },
    );
}

/**

* Delete the authenticated user's account.
*
* The backend handles account anonymization, session revocation,
* and related account cleanup.
  */
async function deleteAccount(): Promise<DeleteUserAccountResponse> {
    const csrfToken = await getUserCsrfToken();

    return apiRequest<DeleteUserAccountResponse>(
        PROFILE_ENDPOINT,
        {
            method: "DELETE",
            csrfToken,
        },
    );
}

export const profileService = {
    getProfile,
    updateProfile,
    getPrivacySettings,
    updatePrivacySettings,
    deleteAccount,
};
