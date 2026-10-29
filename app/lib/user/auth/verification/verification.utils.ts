import { ApiError } from "@/app/lib/api/api-error";

export function getVerificationErrorMessage(
    error: unknown,
    fallback: string,
): string {
    if (error instanceof ApiError) {
        if (error.status === 429) {
            return "Too many attempts. Please wait before trying again.";
        }

        if (error.status === 0) {
            return error.message;
        }

        if (error.status >= 500) {
            return "The service is temporarily unavailable. Please try again shortly.";
        }

        return error.message;
    }

    return fallback;
}

export function getSafeVerificationEmail(
    value: string | null,
): string {
    if (!value) {
        return "";
    }

    const email = value.trim().toLowerCase();

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        ? email
        : "";
}

export function isValidVerificationToken(
    token: string,
): boolean {
    return token.length >= 20 && token.length <= 200;
}