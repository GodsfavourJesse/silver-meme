import { getSafeReturnTo } from "@/app/lib/user/auth/safe-redirect";

const DEFAULT_AUTHENTICATED_ROUTE = "/dashboard";

interface VerificationRedirectOptions {
    verified: boolean;
    destination: string | null | undefined;
}

export function buildVerificationLoginUrl({
    verified,
    destination,
}: VerificationRedirectOptions): string {
    const loginUrl = new URL(
        "/login",
        "https://karmass.invalid",
    );

    if (verified) {
        loginUrl.searchParams.set("verified", "1");
    }

    const safeDestination = getSafeReturnTo(destination);

    if (safeDestination !== DEFAULT_AUTHENTICATED_ROUTE) {
        loginUrl.searchParams.set(
            "returnTo",
            safeDestination,
        );
    }

    return `${loginUrl.pathname}${loginUrl.search}`;
}