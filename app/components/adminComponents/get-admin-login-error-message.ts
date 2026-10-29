import { ApiError } from "@/app/lib/api/api-error";

/**
 * Converts any login failure into a message that is safe
 * to show on the administrator sign-in screen.
 */
export function getAdminLoginErrorMessage(error: unknown): string {
    if (error instanceof ApiError) {
        if (error.status === 401 || error.status === 403) {
            return "The email or password is incorrect, or this account is not authorized to access the administrator portal.";
        }

        if (error.status === 429) {
            return "Too many login attempts. Please wait before trying again.";
        }

        if (error.status >= 500) {
            return "The authentication service is temporarily unavailable. Please try again later.";
        }

        return error.message;
    }

    if (error instanceof Error) {
        return error.message;
    }

    return "Unable to sign in. Please try again.";
}