const DEFAULT_AUTHENTICATED_ROUTE = "/dashboard";

const BLOCKED_AUTH_ROUTES = [
    "/login",
    "/register",
    "/verify-email",
    "/forgot-password",
    "/reset-password",
];

export function getSafeReturnTo(
    destination: string | null | undefined,
): string {
    if (!destination) {
        return DEFAULT_AUTHENTICATED_ROUTE;
    }

    const value = destination.trim();

    if (
        !value ||
        !value.startsWith("/") ||
        value.startsWith("//") ||
        value.includes("\\") ||
        /[\u0000-\u001F\u007F]/.test(value)
    ) {
        return DEFAULT_AUTHENTICATED_ROUTE;
    }

    let parsedUrl: URL;

    try {
        parsedUrl = new URL(
            value,
            "https://karmass.invalid",
        );
    } catch {
        return DEFAULT_AUTHENTICATED_ROUTE;
    }

    if (
        parsedUrl.origin !==
        "https://karmass.invalid"
    ) {
        return DEFAULT_AUTHENTICATED_ROUTE;
    }

    const pathname = parsedUrl.pathname;

    const isBlockedRoute = BLOCKED_AUTH_ROUTES.some(
        (route) =>
            pathname === route ||
            pathname.startsWith(`${route}/`),
    );

    if (isBlockedRoute) {
        return DEFAULT_AUTHENTICATED_ROUTE;
    }

    return (
        `${pathname}${parsedUrl.search}${parsedUrl.hash}`
    );
}